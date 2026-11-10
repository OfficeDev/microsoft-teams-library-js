#!/usr/bin/env node
/**
 * Decides whether a run of tools/releases/sdf-release.yml publishes the weekly SDF beta, and sets the `publish`
 * output variable that the release stage's condition reads.
 *
 * Manual runs always publish. A scheduled run (Build.Reason "Schedule") is skipped when any of these hold:
 *   - it is a Prod week: the Monday-Sunday week (UTC) that contains the first Wednesday of a month;
 *   - the CI build is a beta of a version that has already shipped (the README in the build names it on the CDN);
 *   - nothing new reached main since the last beta: the CI build has the same commit as the build the last
 *     published beta used, or is not newer than it, or its beta version is not newer than the published one;
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

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const MAIN_BRANCH = 'refs/heads/main';
const BETA_VERSION = /^((?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*))-beta\.(?:0|[1-9]\d*)$/;
const PROD_CDN_SCRIPT = /res\.cdn\.office\.net\/teams-js\/(\d+\.\d+\.\d+)\/js\/MicrosoftTeams\.min\.js/g;
const NPM_PUBLISH_TASK = 'EsrpRelease';
const NPM_PACK_TASK = 'Npm';
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

/** Orders two <x.y.z>-beta.<n> versions; a version that is not a beta sorts as unknown, which throws. */
function compareBetas(a, b) {
  const left = BETA_VERSION.exec(a || '');
  const right = BETA_VERSION.exec(b || '');
  if (!left || !right) {
    throw new Error(
      `Cannot compare ${a} with the last published version ${b}; both must be betas such as 2.60.0-beta.0`,
    );
  }
  return compareReleases(left[1], right[1]) || Number(a.split('.').pop()) - Number(b.split('.').pop());
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
 * The pure decision. `lastPublished` is { runId, commit, runName, sdfRun, version } for the CI build behind the newest
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
  if (!current || !/^\d+$/.test(String(current.runId || '')) || !current.commit) {
    throw new Error(`The current CI run ID and commit are required`);
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
  } else if (lastPublished.version && compareBetas(beta, lastPublished.version) <= 0) {
    // Two main builds made before a beta publishes can carry the same version, and npm never takes a version twice.
    reasons.push(`Nothing new: ${beta} is not newer than ${lastPublished.version}, the last published beta`);
  }
  if (inFlight.length > 0) {
    reasons.push(`Another run of this pipeline is in progress: ${inFlight.join(', ')}`);
  }
  return { publish: reasons.length === 0, reasons };
}

async function getJson(fetchImpl, url, token) {
  const response = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw new Error(`GET ${url} answered ${response.status}`);
  }
  // 204 No Content: for example the timeline of a run that retention has removed.
  return response.status === 204 ? null : response.json();
}

const PACKED_VERSION = /npm notice package: @microsoft\/teams-js@(\S+)/;

/**
 * The version a run published, from `npm notice package: @microsoft/teams-js@<version>` in the log of the npm pack
 * task in the same job as the publish task. Two CI builds can carry the same beta version, so the commit alone does
 * not show a build's beta is still unpublished.
 */
async function publishedVersion({ fetchImpl, token, records, publish, run }) {
  const pack = records.find(
    (record) =>
      record.type === 'Task' &&
      record.task &&
      record.task.name === NPM_PACK_TASK &&
      record.parentId === publish.parentId &&
      SUCCEEDED.includes(record.result),
  );
  if (!pack || !pack.log || !pack.log.url) {
    throw new Error(`Run ${run.buildNumber} published a beta but has no npm pack log to read its version from`);
  }
  const log = await getJson(fetchImpl, `${pack.log.url}?api-version=7.1`, token);
  const lines = log && Array.isArray(log.value) ? log.value : [];
  for (const line of lines) {
    const match = PACKED_VERSION.exec(String(line));
    if (match) {
      return match[1];
    }
  }
  throw new Error(`Run ${run.buildNumber} published a beta but its npm pack log does not name the version`);
}

/**
 * Reads this pipeline's recent runs. The completed run whose npm publish task finished last published the current
 * beta; its pipeline resource names the CI run that beta came from, and its npm pack log names the version.
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

  // Overlapping manual runs can publish out of queue order, so the last published beta is the run whose npm publish
  // task finished last, not the most recently queued one.
  let latest;
  for (const run of others.filter((candidate) => candidate.status === 'completed')) {
    const timeline = await getJson(fetchImpl, `${base}/build/builds/${run.id}/timeline?api-version=7.1`, token);
    const records = timeline && Array.isArray(timeline.records) ? timeline.records : [];
    const publish = records.find(
      (record) =>
        record.type === 'Task' &&
        record.task &&
        record.task.name === NPM_PUBLISH_TASK &&
        SUCCEEDED.includes(record.result),
    );
    if (!publish) {
      continue;
    }
    const finished = Date.parse(publish.finishTime);
    if (Number.isNaN(finished)) {
      throw new Error(`Run ${run.buildNumber} published a beta but its publish task has no finish time`);
    }
    if (!latest || finished > latest.finished) {
      latest = { run, records, publish, finished };
    }
  }
  if (latest) {
    const { run, records, publish } = latest;
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
        version: await publishedVersion({ fetchImpl, token, records, publish, run }),
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

const REPOSITORY_URL = 'https://github.com/OfficeDev/microsoft-teams-library-js';
const BUNDLE_PATH = ['dist', 'umd', 'MicrosoftTeams.min.js'];

/** The sha384 SRI of the build's bundle, which is the one the SDF CDN serves, or undefined if it isn't in the feed. */
function bundleSri(readFile, npmFeed) {
  try {
    const bytes = readFile(path.join(npmFeed, ...BUNDLE_PATH));
    return bytes ? `sha384-${crypto.createHash('sha384').update(bytes).digest('base64')}` : undefined;
  } catch {
    return undefined;
  }
}

/**
 * The job summary a Lockbox approver reads before approving a scheduled run: the decision and its reasons, the build,
 * what changed since the last beta, and the bundle SRI to compare with SKILL.md SDF step 3. Informational only.
 */
function summarize({ decision, beta, releasedVersion, current, lastPublished, sri }) {
  const lines = [
    '## Weekly SDF beta',
    '',
    decision.publish
      ? `**Publishes ${beta}** once the Lockbox request is approved. Before approving, do SKILL.md SDF steps 2 and 3.`
      : `**Skipped**: nothing is published and no Lockbox request is raised.`,
    '',
    ...decision.reasons.map((reason) => `- ${reason}`),
    ...(decision.reasons.length > 0 ? [''] : []),
    `- CI build: ${beta} from CI run ${current.runName} (${current.runId}) at commit ${current.commit}`,
    `- The released version in its README: ${releasedVersion || 'none found'}`,
    lastPublished
      ? `- Last published beta: ${lastPublished.version || '(version unknown)'} by SDF run ${lastPublished.sdfRun}, from CI run ${lastPublished.runName} at commit ${lastPublished.commit}`
      : '- Last published beta: none in the recent history',
  ];
  if (lastPublished && lastPublished.commit && current.commit && lastPublished.commit !== current.commit) {
    lines.push(`- Changes since then: ${REPOSITORY_URL}/compare/${lastPublished.commit}...${current.commit}`);
  }
  lines.push(
    sri
      ? `- Bundle SRI (dist/umd/MicrosoftTeams.min.js): ${sri}`
      : '- Bundle SRI: MicrosoftTeams.min.js was not found in the NPMFeed artifact',
  );
  return `${lines.join('\n')}\n`;
}

async function main(
  argv,
  env,
  { fetchImpl = globalThis.fetch, readFile = fs.readFileSync, writeFile = fs.writeFileSync, log = console.log } = {},
) {
  const options = parseArgs(argv);
  const now = options.now ? new Date(options.now) : new Date();
  if (Number.isNaN(now.getTime())) {
    throw new Error(`--now ${options.now} is not a date`);
  }

  let decision;
  let summaryInput;
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
      log(`Last published beta: ${last.version} by run ${last.sdfRun}, from CI run ${last.runName} at ${last.commit}`);
    }
    const current = {
      runId: options['run-id'],
      commit: options.commit,
      runName: options['run-name'] || options['run-id'],
    };
    decision = decide({
      reason: options.reason,
      now,
      beta,
      releasedVersion,
      sourceBranch: options['source-branch'],
      current,
      lastPublished: history.lastPublished,
      inFlight: history.inFlight,
    });
    summaryInput = {
      beta,
      releasedVersion,
      current,
      lastPublished: history.lastPublished,
      sri: bundleSri(readFile, options['npm-feed']),
    };
  }

  for (const reason of decision.reasons) {
    log(decision.publish ? reason : `##vso[task.logissue type=warning]Skipping the weekly beta. ${reason}`);
  }
  log(decision.publish ? 'Publishing the beta.' : 'Not publishing: the release stage will be skipped.');
  if (summaryInput) {
    // The summary is for the approver; failing to write it never changes the decision.
    try {
      const file = path.join(env.AGENT_TEMPDIRECTORY || os.tmpdir(), 'sdf-beta-schedule.md');
      writeFile(file, summarize({ decision, ...summaryInput }));
      log(`##vso[task.uploadsummary]${file}`);
    } catch (error) {
      log(`##vso[task.logissue type=warning]Could not write the job summary: ${error?.message ?? String(error)}`);
    }
  }
  log(`##vso[task.setvariable variable=publish;isOutput=true]${decision.publish}`);
  return decision;
}

module.exports = {
  compareReleases,
  decide,
  main,
  parseArgs,
  prodWeek,
  readHistory,
  releasedVersionFromReadme,
  summarize,
};

if (require.main === module) {
  main(process.argv.slice(2), process.env).catch((error) => {
    console.log(`##vso[task.logissue type=error]${error.message}`);
    process.exitCode = 1;
  });
}
