#!/usr/bin/env node
/**
 * Decides whether a run of tools/releases/sdf-release.yml publishes the weekly SDF beta, and sets the `publish`
 * output variable that the release stage's condition reads.
 *
 * Manual runs always publish. A scheduled run (Build.Reason "Schedule") is skipped when any of these hold:
 *   - it is a Prod week: the Monday-Sunday week (UTC) that contains the first Wednesday of a month;
 *   - the CI build is a beta of a version that has already shipped (the README in the build names it on the CDN);
 *   - nothing new reached main since the last beta: the CI build has the same commit as the build the last
 *     published beta used, or is not newer than it;
 *   - another run of this pipeline is still in progress.
 * Anything it cannot establish (no beta version, a build that is not from main, Azure DevOps not answering, no
 * published beta in the recent history) fails the step, so a scheduled run never publishes on a guess.
 *
 * Usage (in the pipeline; Azure DevOps sets the SYSTEM_* and BUILD_* variables):
 *   node tools/releases/sdf-beta-schedule.js --reason <Build.Reason> --npm-feed <NPMFeed folder> --alias <resource>
 *     --source-branch <branch> --run-id <id> --run-name <name> --commit <sha> [--now <ISO date>]
 * Needs SYSTEM_ACCESSTOKEN, SYSTEM_COLLECTIONURI, SYSTEM_TEAMPROJECTID, SYSTEM_DEFINITIONID and BUILD_BUILDID for
 * scheduled runs. Only reads; it never queues, cancels or changes anything.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const MAIN_BRANCH = 'refs/heads/main';
const BETA_VERSION = /^(\d+\.\d+\.\d+)-beta\.\d+$/;
const PROD_CDN_SCRIPT = /res\.cdn\.office\.net\/teams-js\/(\d+\.\d+\.\d+)\/js\/MicrosoftTeams\.min\.js/g;
const NPM_PUBLISH_TASK = 'EsrpRelease';
const SUCCEEDED = ['succeeded', 'succeededWithIssues'];
const HISTORY_SIZE = 50;

/** The Wednesday (UTC) of the Monday-Sunday week that contains `date`, and whether it is a month's first Wednesday. */
function prodWeek(date) {
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  const wednesday = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - daysSinceMonday + 2),
  );
  return { isProdWeek: wednesday.getUTCDate() <= 7, wednesday: wednesday.toISOString().slice(0, 10) };
}

function compareReleases(a, b) {
  const left = a.split('.').map(Number);
  const right = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (left[i] !== right[i]) {
      return left[i] > right[i] ? 1 : -1;
    }
  }
  return 0;
}

/** The highest Prod CDN version the README links to, which is the last release the build's source had merged. */
function releasedVersionFromReadme(readme) {
  const versions = Array.from(readme.matchAll(PROD_CDN_SCRIPT), (match) => match[1]);
  return versions.reduce(
    (highest, version) => (!highest || compareReleases(version, highest) > 0 ? version : highest),
    null,
  );
}

/**
 * The pure decision. `lastPublished` is { runId, commit, runName, sdfRun } for the CI build behind the newest
 * published beta; `inFlight` lists other runs of this pipeline that have not completed.
 * Returns { publish, reasons }; throws when a scheduled run cannot be judged safely.
 */
function decide({ reason, now, beta, releasedVersion, sourceBranch, current, lastPublished, inFlight = [] }) {
  if (reason !== 'Schedule') {
    return { publish: true, reasons: [`${reason || 'Unknown'} run: the skip rule applies only to scheduled runs`] };
  }
  if (sourceBranch !== MAIN_BRANCH) {
    throw new Error(`The CI build is from ${sourceBranch || 'an unknown branch'}, not ${MAIN_BRANCH}`);
  }
  const match = BETA_VERSION.exec(beta || '');
  if (!match) {
    throw new Error(`The CI build's version ${beta || '(none)'} is not a beta version such as 2.60.0-beta.0`);
  }
  if (!releasedVersion) {
    throw new Error(`The check could not find a released version in the build's README`);
  }
  const reasons = [];
  const week = prodWeek(now);
  if (week.isProdWeek) {
    reasons.push(`Prod week: ${week.wednesday} is the first Wednesday of its month`);
  }
  if (releasedVersion && compareReleases(match[1], releasedVersion) <= 0) {
    reasons.push(`${beta} is a beta of ${match[1]}, which is not newer than the released ${releasedVersion}`);
  }
  if (!lastPublished) {
    if (reasons.length === 0) {
      throw new Error(
        `No published beta in the last ${HISTORY_SIZE} runs of this pipeline, so "nothing new" cannot be judged`,
      );
    }
  } else if (current.commit && current.commit === lastPublished.commit) {
    reasons.push(
      `Nothing new: CI run ${current.runName} has the same commit as ${lastPublished.runName}, the last published beta's build`,
    );
  } else if (Number(current.runId) <= Number(lastPublished.runId)) {
    reasons.push(
      `Nothing new: CI run ${current.runName} is not newer than ${lastPublished.runName}, the last published beta's build`,
    );
  }
  if (inFlight.length > 0) {
    reasons.push(`Another run of this pipeline is in progress: ${inFlight.join(', ')}`);
  }
  return { publish: reasons.length === 0, reasons };
}

async function getJson(fetchImpl, url, token) {
  const response = await fetchImpl(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`GET ${url} answered ${response.status}`);
  }
  return response.json();
}

/**
 * Reads this pipeline's recent runs. The newest completed run whose npm publish task succeeded published the current
 * beta; its pipeline resource names the CI run that beta came from.
 */
async function readHistory({ fetchImpl, collectionUri, project, definitionId, buildId, alias, token }) {
  const base = `${collectionUri.replace(/\/+$/, '')}/${project}/_apis`;
  const runs = await getJson(
    fetchImpl,
    `${base}/build/builds?definitions=${definitionId}&queryOrder=queueTimeDescending&$top=${HISTORY_SIZE}&api-version=7.1`,
    token,
  );
  const others = runs.value.filter((run) => String(run.id) !== String(buildId));
  const inFlight = others.filter((run) => run.status !== 'completed').map((run) => run.buildNumber);

  for (const run of others.filter((candidate) => candidate.status === 'completed')) {
    const timeline = await getJson(fetchImpl, `${base}/build/builds/${run.id}/timeline?api-version=7.1`, token);
    const published = (timeline && timeline.records ? timeline.records : []).some(
      (record) =>
        record.type === 'Task' &&
        record.task &&
        record.task.name === NPM_PUBLISH_TASK &&
        SUCCEEDED.includes(record.result),
    );
    if (!published) {
      continue;
    }
    const details = await getJson(fetchImpl, `${base}/pipelines/${definitionId}/runs/${run.id}?api-version=7.1`, token);
    const resource = details.resources && details.resources.pipelines && details.resources.pipelines[alias];
    if (!resource || !resource.version || !resource.pipeline) {
      throw new Error(`Run ${run.buildNumber} published a beta but does not name its ${alias} resource`);
    }
    // In this response the resource's pipeline.id is the consumed CI run's ID and version is its run name.
    const ciRun = await getJson(fetchImpl, `${base}/build/builds/${resource.pipeline.id}?api-version=7.1`, token);
    if (ciRun.buildNumber !== resource.version) {
      throw new Error(`CI run ${resource.pipeline.id} is named ${ciRun.buildNumber}, expected ${resource.version}`);
    }
    return {
      inFlight,
      lastPublished: {
        runId: ciRun.id,
        commit: ciRun.sourceVersion,
        runName: ciRun.buildNumber,
        sdfRun: run.buildNumber,
      },
    };
  }
  return { inFlight, lastPublished: null };
}

function parseArgs(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i += 2) {
    if (!argv[i].startsWith('--') || argv[i + 1] === undefined) {
      throw new Error(`Unexpected argument ${argv[i]}; every option takes a value`);
    }
    options[argv[i].slice(2)] = argv[i + 1];
  }
  return options;
}

async function main(argv, env, { fetchImpl = globalThis.fetch, readFile = fs.readFileSync, log = console.log } = {}) {
  const options = parseArgs(argv);
  const now = options.now ? new Date(options.now) : new Date();
  if (Number.isNaN(now.getTime())) {
    throw new Error(`--now ${options.now} is not a date`);
  }

  let decision;
  if (options.reason !== 'Schedule') {
    decision = decide({ reason: options.reason });
  } else {
    if (!options['npm-feed'] || !options.alias) {
      throw new Error('A scheduled run needs --npm-feed and --alias');
    }
    const beta = JSON.parse(readFile(path.join(options['npm-feed'], 'package.json'), 'utf8')).version;
    const releasedVersion = releasedVersionFromReadme(readFile(path.join(options['npm-feed'], 'README.md'), 'utf8'));
    const missing = [
      'SYSTEM_ACCESSTOKEN',
      'SYSTEM_COLLECTIONURI',
      'SYSTEM_TEAMPROJECTID',
      'SYSTEM_DEFINITIONID',
    ].filter((name) => !env[name]);
    if (missing.length > 0) {
      throw new Error(`Missing ${missing.join(', ')}`);
    }
    const history = await readHistory({
      fetchImpl,
      collectionUri: env.SYSTEM_COLLECTIONURI,
      project: env.SYSTEM_TEAMPROJECTID,
      definitionId: env.SYSTEM_DEFINITIONID,
      buildId: env.BUILD_BUILDID,
      alias: options.alias,
      token: env.SYSTEM_ACCESSTOKEN,
    });
    log(`CI build: ${beta} from ${options['source-branch']} at ${options.commit} (run ${options['run-id']})`);
    log(`Released version in its README: ${releasedVersion || 'none found'}`);
    if (history.lastPublished) {
      const last = history.lastPublished;
      log(`Last published beta: run ${last.sdfRun}, from CI run ${last.runName} at ${last.commit}`);
    }
    decision = decide({
      reason: options.reason,
      now,
      beta,
      releasedVersion,
      sourceBranch: options['source-branch'],
      current: { runId: options['run-id'], commit: options.commit, runName: options['run-name'] || options['run-id'] },
      lastPublished: history.lastPublished,
      inFlight: history.inFlight,
    });
  }

  for (const reason of decision.reasons) {
    log(decision.publish ? reason : `##vso[task.logissue type=warning]Skipping the weekly beta. ${reason}`);
  }
  log(decision.publish ? 'Publishing the beta.' : 'Not publishing: the release stage will be skipped.');
  log(`##vso[task.setvariable variable=publish;isOutput=true]${decision.publish}`);
  return decision;
}

module.exports = { compareReleases, decide, main, parseArgs, prodWeek, readHistory, releasedVersionFromReadme };

if (require.main === module) {
  main(process.argv.slice(2), process.env).catch((error) => {
    console.log(`##vso[task.logissue type=error]${error.message}`);
    process.exitCode = 1;
  });
}
