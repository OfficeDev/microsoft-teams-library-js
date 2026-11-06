#!/usr/bin/env node
/**
 * Read-only checks for a @microsoft/teams-js release. Nothing here writes files, refs, packages or messages.
 *
 *   check-version --version <v>                    <v> is free on npm, the Prod CDN and as a GitHub tag
 *   carriers      --version <v>                    the checkout's version carriers agree on <v> and one SRI hash
 *   artifact      --version <v> --file <path>      a downloaded CI build's MicrosoftTeams.min.js matches that SRI
 *   published     --version <v> [--environment prod|sdf] [--dist-tag <tag>] [--expected-sri <sri>] [--registry <url>]
 *                                                  the CDN bytes and the npm registry show the release
 *   domains                                        the live Prod valid-domains list equals this checkout's source
 *   links         --version <v>                    public npm, CDN and GitHub release links for the announcement
 *   sri           --file <path>                    the sha384 SRI of a file, such as an SDF beta CI bundle
 *   github-release --version <v> --expect prerelease|latest
 *                                                  the GitHub release state, that tag v<v> carries the bump and
 *                                                  points at the release branch head, and which release is Latest
 *   merged-back   --version <v>                    main's CHANGELOG has the <v> section
 *   size          --version <v> --previous <p>     Prod CDN bundle bytes and the change from <p>
 *   beta-version  --version <x.y.z>-beta.<n> [--registry <url>]
 *                                                  the beta is of a version newer than latest on npm and GitHub
 *   pipeline-config                                the checkout's release YAML: Prod publishes with tag latest,
 *                                                  SDF with tag beta, and artifact retention is @6 or later
 *   announcement  --version <v> --file <path>      every npm, CDN and GitHub release link in a draft names <v>
 *   consumed-changes --version <v> [--prep-commit <sha>]
 *                                                  no pending change file was deleted by the prep commit; one that
 *                                                  only repeats an entry released in <v> is inconclusive
 *                                                  (run on the merge-back branch after merging main)
 *
 * GitHub API calls send GITHUB_TOKEN as a bearer token when it is set, to avoid anonymous rate limits.
 *
 * Exit codes: 0 every check passed, 1 a check failed, 2 usage error, 3 a source was unreachable (inconclusive).
 */
'use strict';

const childProcess = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PACKAGE_NAME = '@microsoft/teams-js';
const ENCODED_PACKAGE_NAME = PACKAGE_NAME.replaceAll('/', '%2f');
const REPOSITORY = 'OfficeDev/microsoft-teams-library-js';
const CDN_HOSTS = { prod: 'res.cdn.office.net', sdf: 'res-sdf.cdn.office.net' };
const DEFAULT_REGISTRY = 'https://registry.npmjs.org';
const GITHUB_API = 'https://api.github.com';
const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const SRI_PATTERN = /^sha384-[A-Za-z0-9+/]+={0,2}$/;
const CARRIER_VERSION_PATTERNS = [
  /res\.cdn\.office\.net\/teams-js\/([^/\s"')]+)\/js\/MicrosoftTeams\.min\.js/g,
  /node_modules\/@microsoft\/teams-js@([^/\s"')]+)\/dist\/MicrosoftTeams\.min\.js/g,
];
const INTEGRITY_PATTERN = /integrity="([^"]*)"/g;
const SRI_CARRIER_FILES = ['packages/teams-js/README.md', 'apps/teams-test-app/index_cdn.html'];
const PACKAGE_JSON_FILES = ['packages/teams-js/package.json', 'apps/teams-test-app/package.json'];
const VALID_DOMAINS_SOURCE = 'packages/teams-js/src/artifactsForCDN/validDomains.json';
const FETCH_TIMEOUT_MS = 30000;

const ExitCode = { passed: 0, failed: 1, usage: 2, unreachable: 3 };
const Outcome = { pass: 'PASS', fail: 'FAIL', unreachable: 'UNREACHABLE', info: 'INFO' };

class UsageError extends Error {}

function computeSri(bytes) {
  return `sha384-${crypto.createHash('sha384').update(bytes).digest('base64')}`;
}

function cdnScriptUrl(version, environment = 'prod') {
  return `https://${CDN_HOSTS[environment]}/teams-js/${version}/js/MicrosoftTeams.min.js`;
}

function validDomainsUrl(environment = 'prod') {
  return `https://${CDN_HOSTS[environment]}/teams-js/validDomains/json/validDomains.json`;
}

function npmVersionUrl(registry, version) {
  return `${registry}/${ENCODED_PACKAGE_NAME}/${version}`;
}

function npmDistTagsUrl(registry) {
  return `${registry}/-/package/${ENCODED_PACKAGE_NAME}/dist-tags`;
}

function githubTagUrl(version) {
  return `${GITHUB_API}/repos/${REPOSITORY}/git/ref/tags/v${version}`;
}

function githubReleaseUrl(version) {
  return `${GITHUB_API}/repos/${REPOSITORY}/releases/tags/v${version}`;
}

function githubLatestReleaseUrl() {
  return `${GITHUB_API}/repos/${REPOSITORY}/releases/latest`;
}

function githubPackageJsonAtTagUrl(version) {
  return `${GITHUB_API}/repos/${REPOSITORY}/contents/packages/teams-js/package.json?ref=v${version}`;
}

function mainChangelogUrl() {
  return `https://raw.githubusercontent.com/${REPOSITORY}/main/packages/teams-js/CHANGELOG.md`;
}

function withGithubAuth(url, init, env) {
  if (!url.startsWith(`${GITHUB_API}/`)) {
    return init;
  }
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'release-teamsjs-check', ...init.headers };
  if (env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
  }
  return { ...init, headers };
}

function publicLinks(version) {
  return {
    npm: `https://www.npmjs.com/package/${PACKAGE_NAME}/v/${version}`,
    cdn: cdnScriptUrl(version, 'prod'),
    githubRelease: `https://github.com/${REPOSITORY}/releases/tag/v${version}`,
  };
}

function result(outcome, message) {
  return { outcome, message };
}

function matchAll(text, pattern) {
  return Array.from(text.matchAll(pattern), (match) => match[1]);
}

function distinctIntegrities(carriers) {
  return [...new Set(carriers.sriFiles.flatMap(({ integrities }) => integrities))];
}

function readCarriers(repoRoot, readFile = fs.readFileSync) {
  const read = (relativePath) => readFile(path.join(repoRoot, relativePath), 'utf8');
  return {
    packageVersions: PACKAGE_JSON_FILES.map((file) => ({ file, version: JSON.parse(read(file)).version })),
    sriFiles: SRI_CARRIER_FILES.map((file) => {
      const text = read(file);
      return {
        file,
        versions: CARRIER_VERSION_PATTERNS.flatMap((pattern) => matchAll(text, pattern)),
        integrities: matchAll(text, INTEGRITY_PATTERN),
      };
    }),
  };
}

function checkCarriers(carriers, version) {
  const results = [];
  const add = (passed, message) => results.push(result(passed ? Outcome.pass : Outcome.fail, message));

  for (const { file, version: found } of carriers.packageVersions) {
    add(found === version, `${file} version is ${found}, expected ${version}`);
  }
  for (const { file, versions, integrities } of carriers.sriFiles) {
    add(
      versions.length > 0 && versions.every((found) => found === version),
      versions.length === 0
        ? `${file} has no CDN or node_modules script reference`
        : `${file} script references point at ${[...new Set(versions)].join(', ')}, expected ${version}`,
    );
    add(
      integrities.length > 0 && integrities.every((value) => SRI_PATTERN.test(value)),
      integrities.length === 0 ? `${file} has no integrity attribute` : `${file} integrity attributes are sha384 SRI`,
    );
  }
  const distinct = distinctIntegrities(carriers);
  add(distinct.length === 1, `carriers share one integrity hash (found ${distinct.length})`);
  return results;
}

function carrierIntegrity(carriers) {
  const distinct = distinctIntegrities(carriers);
  return distinct.length === 1 ? distinct[0] : undefined;
}

function checkBytes(bytes, expectedSri, label) {
  const actual = computeSri(bytes);
  return result(
    actual === expectedSri ? Outcome.pass : Outcome.fail,
    `${label} hashes to ${actual}, expected ${expectedSri} (${bytes.length} bytes)`,
  );
}

async function fetchOrUnreachable(fetchImpl, url, label) {
  try {
    return { response: await fetchImpl(url, { redirect: 'follow', signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }) };
  } catch (error) {
    const reason =
      error && error.name === 'TimeoutError' ? `timed out after ${FETCH_TIMEOUT_MS / 1000} s` : error.message;
    return {
      unreachable: result(
        Outcome.unreachable,
        `${label}: could not reach ${url} (${reason}). This is not evidence either way.`,
      ),
    };
  }
}

async function readBody(response, read, label, url) {
  try {
    return { value: await read(response) };
  } catch (error) {
    const reason =
      error && error.name === 'TimeoutError' ? `timed out after ${FETCH_TIMEOUT_MS / 1000} s` : error.message;
    return {
      unreachable: result(
        Outcome.unreachable,
        `${label}: reading ${url} failed (${reason}). This is not evidence either way.`,
      ),
    };
  }
}

async function expectAbsent(fetchImpl, url, label, takenMessage = 'so this version is taken') {
  const { response, unreachable } = await fetchOrUnreachable(fetchImpl, url, label);
  if (unreachable) {
    return unreachable;
  }
  if (response.status === 404) {
    return result(Outcome.pass, `${label}: ${url} does not exist yet`);
  }
  if (response.status === 200) {
    return result(Outcome.fail, `${label}: ${url} already exists, ${takenMessage}`);
  }
  return result(
    Outcome.unreachable,
    `${label}: ${url} returned HTTP ${response.status}. This is not evidence either way.`,
  );
}

async function checkVersionIsFree({ version, registry, fetchImpl }) {
  const sources = await observeNpm({ version, tagNames: [], registry, fetchImpl });
  return [
    npmAbsenceResult(sources, version),
    await expectAbsent(fetchImpl, cdnScriptUrl(version, 'prod'), 'Prod CDN'),
    await expectAbsent(fetchImpl, githubTagUrl(version), 'GitHub tag'),
  ];
}

function inconclusiveStatus(label, url, status) {
  return result(Outcome.unreachable, `${label}: ${url} returned HTTP ${status}. This is not evidence either way.`);
}

async function checkCdnScript({ version, environment, expectedSri, fetchImpl }) {
  const url = cdnScriptUrl(version, environment);
  const { response, unreachable } = await fetchOrUnreachable(fetchImpl, url, 'CDN');
  if (unreachable) {
    return unreachable;
  }
  if (response.status === 404) {
    return result(Outcome.fail, `CDN ${url} returned HTTP 404`);
  }
  if (response.status !== 200) {
    return inconclusiveStatus('CDN', url, response.status);
  }
  const body = await readBody(response, (r) => r.arrayBuffer(), 'CDN', url);
  if (body.unreachable) {
    return body.unreachable;
  }
  return checkBytes(Buffer.from(body.value), expectedSri, `CDN ${url}`);
}

async function getJson(fetchImpl, url, label) {
  const { response, unreachable } = await fetchOrUnreachable(fetchImpl, url, label);
  if (unreachable) {
    return { status: 'unreachable', problem: unreachable };
  }
  if (response.status === 404) {
    return { status: 'missing', problem: result(Outcome.fail, `${label}: ${url} does not exist`) };
  }
  if (response.status !== 200) {
    return { status: 'unreachable', problem: inconclusiveStatus(label, url, response.status) };
  }
  try {
    const json = await response.json();
    if (!json || typeof json !== 'object') {
      throw new Error('not a JSON object');
    }
    return { status: 'ok', json };
  } catch {
    return {
      status: 'unreachable',
      problem: result(Outcome.unreachable, `${label}: ${url} did not return JSON. This is not evidence either way.`),
    };
  }
}

async function readJson(fetchImpl, url, label) {
  const answer = await getJson(fetchImpl, url, label);
  return answer.status === 'ok' ? { json: answer.json } : { problem: answer.problem };
}

async function readGithubJson(fetchImpl, url, label, missingMessage) {
  const answer = await getJson(fetchImpl, url, label);
  if (answer.status === 'ok') {
    return { json: answer.json };
  }
  if (answer.status === 'missing') {
    return { problem: result(Outcome.fail, missingMessage || `${label}: ${url} does not exist`) };
  }
  const problem = answer.problem;
  return {
    problem:
      problem.message.includes('HTTP 403') || problem.message.includes('HTTP 429')
        ? result(Outcome.unreachable, `${problem.message} Set GITHUB_TOKEN if this is a rate limit.`)
        : problem,
  };
}

const JSDELIVR_PACKAGE_URL = `https://data.jsdelivr.com/v1/packages/npm/${PACKAGE_NAME}`;

function unpkgPackageJsonUrl(spec) {
  return `https://unpkg.com/${PACKAGE_NAME}@${spec}/package.json`;
}

function pickTags(tags, tagNames) {
  const picked = {};
  if (tags && typeof tags === 'object') {
    for (const tagName of tagNames) {
      if (typeof tags[tagName] === 'string' && VERSION_PATTERN.test(tags[tagName])) {
        picked[tagName] = tags[tagName];
      }
    }
  }
  return picked;
}

/**
 * Asks registry.npmjs.org (authoritative), an optional proxy registry, jsDelivr and unpkg. Only the authoritative
 * registry can show that a version is absent or a dist-tag is current; the others can lag, so they only add evidence
 * that a version or tag value exists.
 */
async function observeNpm({ version, tagNames, registry, fetchImpl }) {
  const sources = [];
  const registries = [{ url: DEFAULT_REGISTRY, kind: 'authoritative', name: 'registry.npmjs.org' }];
  if (registry !== DEFAULT_REGISTRY) {
    registries.push({ url: registry, kind: 'proxy', name: registry });
  }
  for (const { url, kind, name } of registries) {
    const source = { name, kind, hasVersion: undefined, tags: {}, problems: [] };
    if (version) {
      const answer = await getJson(fetchImpl, npmVersionUrl(url, version), name);
      if (answer.status === 'ok') {
        if (answer.json.version === version) {
          source.hasVersion = true;
        } else {
          source.problems.push(
            `${name}: ${npmVersionUrl(url, version)} returned HTTP 200 without version ${version}. ` +
              'This is not evidence either way.',
          );
        }
      } else if (answer.status === 'missing') {
        source.hasVersion = false;
      } else {
        source.problems.push(answer.problem.message);
      }
    }
    if (tagNames.length > 0) {
      const answer = await getJson(fetchImpl, npmDistTagsUrl(url), name);
      if (answer.status === 'ok') {
        source.tags = pickTags(answer.json, tagNames);
      } else if (answer.status === 'unreachable') {
        source.problems.push(answer.problem.message);
      }
    }
    sources.push(source);
  }

  const jsdelivr = { name: 'jsDelivr', kind: 'mirror', hasVersion: undefined, tags: {}, problems: [] };
  const listing = await getJson(fetchImpl, JSDELIVR_PACKAGE_URL, 'jsDelivr');
  if (listing.status === 'ok') {
    const versions = Array.isArray(listing.json.versions) ? listing.json.versions : [];
    if (version && versions.some((entry) => entry && entry.version === version)) {
      jsdelivr.hasVersion = true;
    }
    jsdelivr.tags = pickTags(listing.json.tags, tagNames);
  }
  sources.push(jsdelivr);

  const unpkg = { name: 'unpkg', kind: 'mirror', hasVersion: undefined, tags: {}, problems: [] };
  if (version) {
    const answer = await getJson(fetchImpl, unpkgPackageJsonUrl(version), 'unpkg');
    if (answer.status === 'ok' && answer.json.version === version) {
      unpkg.hasVersion = true;
    }
  }
  for (const tagName of tagNames) {
    const answer = await getJson(fetchImpl, unpkgPackageJsonUrl(tagName), 'unpkg');
    if (answer.status === 'ok') {
      Object.assign(unpkg.tags, pickTags({ [tagName]: answer.json.version }, [tagName]));
    }
  }
  sources.push(unpkg);
  return sources;
}

function authoritativeSource(sources) {
  return sources.find((source) => source.kind === 'authoritative');
}

function sourcesListing(sources, kinds) {
  return sources
    .filter((source) => source.hasVersion === true && kinds.includes(source.kind))
    .map((source) => source.name);
}

function npmAbsenceResult(sources, version) {
  const listedBy = sourcesListing(sources, ['authoritative', 'proxy', 'mirror']);
  if (listedBy.length > 0) {
    return result(
      Outcome.fail,
      `npm: ${version} is already published (${listedBy.join(', ')}), so this version is taken`,
    );
  }
  const authoritative = authoritativeSource(sources);
  if (authoritative.hasVersion === false) {
    return result(Outcome.pass, `npm: registry.npmjs.org does not have ${version}`);
  }
  return result(
    Outcome.unreachable,
    `npm: registry.npmjs.org did not answer (${authoritative.problems.join('; ')}); a proxy or mirror that lacks a ` +
      'version cannot prove it is free',
  );
}

function npmPresenceResult(sources, version) {
  const authoritative = authoritativeSource(sources);
  const others = sourcesListing(sources, ['proxy', 'mirror']);
  if (authoritative.hasVersion === true) {
    return result(Outcome.pass, `npm: registry.npmjs.org has ${version}`);
  }
  if (authoritative.hasVersion === false) {
    return others.length > 0
      ? result(
          Outcome.unreachable,
          `npm: registry.npmjs.org lacks ${version} but ${others.join(', ')} list it; the sources disagree`,
        )
      : result(Outcome.fail, `npm: registry.npmjs.org does not have ${version}`);
  }
  const publicMirrors = sourcesListing(sources, ['mirror']);
  if (publicMirrors.length > 0) {
    return result(
      Outcome.pass,
      `npm: ${version} is published (${publicMirrors.join(', ')}; registry.npmjs.org did not answer)`,
    );
  }
  return result(
    Outcome.unreachable,
    `npm: registry.npmjs.org did not answer and no public mirror lists ${version}` +
      (others.length > 0 ? ` (only ${others.join(', ')} does, and a proxy alone is not proof)` : '') +
      '; a lagging source is not evidence either way',
  );
}

function npmTagResult(sources, version, tagName) {
  const label = `npm dist-tag ${tagName}`;
  const authoritativeValue = authoritativeSource(sources).tags[tagName];
  const mirrorValues = sources
    .filter((source) => source.kind === 'mirror')
    .map((source) => source.tags[tagName])
    .filter(Boolean);
  if (authoritativeValue) {
    if (authoritativeValue === version) {
      return result(Outcome.pass, `${label} points at ${version} on registry.npmjs.org`);
    }
    if (compareVersions(authoritativeValue, version) > 0 || !mirrorValues.includes(version)) {
      return result(
        Outcome.fail,
        `${label} points at ${authoritativeValue} on registry.npmjs.org, expected ${version}`,
      );
    }
    return result(
      Outcome.unreachable,
      `${label}: registry.npmjs.org shows ${authoritativeValue} but a mirror shows ${version}; the sources disagree`,
    );
  }
  const highest = highestVersion(mirrorValues);
  if (highest && compareVersions(highest, version) > 0) {
    return result(Outcome.fail, `${label} points at ${highest}, newer than ${version}`);
  }
  const proxyValues = sources
    .filter((source) => source.kind === 'proxy')
    .map((source) => source.tags[tagName])
    .filter(Boolean);
  return result(
    Outcome.unreachable,
    `${label}: registry.npmjs.org did not answer and public mirrors show ${highest || 'nothing'}` +
      (proxyValues.length > 0 ? `, a proxy shows ${proxyValues.join(', ')}` : '') +
      '; a mirror can show a tag was set, not that it is still current, so this is not evidence either way',
  );
}

async function checkGithubRelease({ version, expect, fetchImpl }) {
  const tag = `v${version}`;
  const results = [];
  const release = await readGithubJson(
    fetchImpl,
    githubReleaseUrl(version),
    'GitHub release',
    `GitHub release ${tag} is missing or still a draft (drafts are not visible by tag)`,
  );
  if (release.problem) {
    results.push(release.problem);
  } else if (release.json.draft) {
    results.push(result(Outcome.fail, `GitHub release ${tag} is still a draft`));
  } else if (expect === 'prerelease') {
    results.push(
      result(
        release.json.prerelease ? Outcome.pass : Outcome.fail,
        release.json.prerelease
          ? `GitHub release ${tag} is a pre-release`
          : `GitHub release ${tag} is not a pre-release yet it should be until publication is verified`,
      ),
    );
    const latest = await readGithubJson(fetchImpl, githubLatestReleaseUrl(), 'GitHub latest release');
    results.push(
      latest.problem ||
        result(
          latest.json.tag_name === tag ? Outcome.fail : Outcome.pass,
          `GitHub latest release is ${latest.json.tag_name}; ${tag} must not be Latest before publication is verified`,
        ),
    );
  } else {
    results.push(
      result(
        release.json.prerelease ? Outcome.fail : Outcome.pass,
        release.json.prerelease
          ? `GitHub release ${tag} is still a pre-release`
          : `GitHub release ${tag} is no longer a pre-release`,
      ),
    );
    const latest = await readGithubJson(fetchImpl, githubLatestReleaseUrl(), 'GitHub latest release');
    results.push(
      latest.problem ||
        result(
          latest.json.tag_name === tag ? Outcome.pass : Outcome.fail,
          `GitHub latest release is ${latest.json.tag_name}, expected ${tag}`,
        ),
    );
  }

  const packageJson = await readGithubJson(fetchImpl, githubPackageJsonAtTagUrl(version), `Tag ${tag}`);
  if (packageJson.problem) {
    results.push(packageJson.problem);
  } else {
    const tagVersion = JSON.parse(
      Buffer.from(packageJson.json.content, packageJson.json.encoding).toString('utf8'),
    ).version;
    results.push(
      result(
        tagVersion === version ? Outcome.pass : Outcome.fail,
        `packages/teams-js/package.json at ${tag} is ${tagVersion}, expected ${version}` +
          (tagVersion === version ? '' : '; the tag was cut before the bump landed'),
      ),
    );
  }
  results.push(await checkTagAtBranchHead({ version, fetchImpl }));
  return results;
}

async function checkTagAtBranchHead({ version, fetchImpl }) {
  const tag = `v${version}`;
  const tagRef = await readGithubJson(fetchImpl, githubTagUrl(version), `Tag ${tag}`);
  if (tagRef.problem) {
    return tagRef.problem;
  }
  let tagCommit = tagRef.json.object.sha;
  if (tagRef.json.object.type === 'tag') {
    const annotated = await readGithubJson(fetchImpl, `${GITHUB_API}/repos/${REPOSITORY}/git/tags/${tagCommit}`, 'Tag');
    if (annotated.problem) {
      return annotated.problem;
    }
    tagCommit = annotated.json.object.sha;
  }
  const branch = `release/${version}`;
  const head = await readGithubJson(fetchImpl, `${GITHUB_API}/repos/${REPOSITORY}/git/ref/heads/${branch}`, branch);
  if (head.problem) {
    return head.problem;
  }
  const headCommit = head.json.object.sha;
  return headCommit === tagCommit
    ? result(Outcome.pass, `${tag} points at the ${branch} head ${headCommit.slice(0, 8)}`)
    : result(
        Outcome.fail,
        `${tag} points at ${tagCommit.slice(0, 8)} but ${branch} is at ${headCommit.slice(0, 8)}; ` +
          'never push to the release branch after tagging',
      );
}

function parseVersion(version) {
  const [core, prerelease] = version.split(/-(.*)/s);
  return { core: core.split('.').map(Number), prerelease: prerelease ? prerelease.split('.') : [] };
}

function compareVersions(a, b) {
  const [left, right] = [parseVersion(a), parseVersion(b)];
  for (let index = 0; index < 3; index++) {
    if (left.core[index] !== right.core[index]) {
      return left.core[index] > right.core[index] ? 1 : -1;
    }
  }
  if (left.prerelease.length === 0 || right.prerelease.length === 0) {
    return right.prerelease.length - left.prerelease.length === 0 ? 0 : left.prerelease.length === 0 ? 1 : -1;
  }
  for (let index = 0; index < Math.max(left.prerelease.length, right.prerelease.length); index++) {
    const [x, y] = [left.prerelease[index], right.prerelease[index]];
    if (x === undefined || y === undefined) {
      return x === undefined ? -1 : 1;
    }
    if (x !== y) {
      const [xNumber, yNumber] = [Number(x), Number(y)];
      if (Number.isInteger(xNumber) && Number.isInteger(yNumber)) {
        return xNumber > yNumber ? 1 : -1;
      }
      return x > y ? 1 : -1;
    }
  }
  return 0;
}

function highestVersion(versions) {
  return versions.reduce(
    (highest, version) => (!highest || compareVersions(version, highest) > 0 ? version : highest),
    undefined,
  );
}

async function checkBetaVersion({ version, registry, fetchImpl }) {
  const base = version.split('-')[0];
  const sources = await observeNpm({ version: undefined, tagNames: ['latest'], registry, fetchImpl });
  const latests = sources
    .filter((source) => source.tags.latest)
    .map((source) => ({ name: source.name, value: source.tags.latest }));
  const githubLatest = await getJson(fetchImpl, githubLatestReleaseUrl(), 'GitHub Latest release');
  const githubTag = githubLatest.status === 'ok' ? String(githubLatest.json.tag_name || '') : '';
  if (VERSION_PATTERN.test(githubTag.replace(/^v/, ''))) {
    latests.push({ name: 'GitHub Latest release', value: githubTag.replace(/^v/, '') });
  }
  const highest = highestVersion(latests.map(({ value }) => value));
  const results = [];
  if (highest) {
    const reportedBy = latests
      .filter(({ value }) => value === highest)
      .map(({ name }) => name)
      .join(', ');
    results.push(
      compareVersions(base, highest) > 0
        ? result(Outcome.pass, `${version} is a beta of ${base}, newer than latest ${highest} (${reportedBy})`)
        : result(
            Outcome.fail,
            `${version} is a beta of ${base}, which is not newer than latest ${highest} (${reportedBy}); ` +
              'it would sort below the release',
          ),
    );
  } else {
    results.push(
      result(
        Outcome.unreachable,
        'latest: neither npm nor the GitHub Latest release answered, so a beta of an older, unshipped patch line ' +
          '(for example 2.58.1-beta.0 after 2.59.0) cannot be ruled out',
      ),
    );
  }
  results.push(
    await expectAbsent(fetchImpl, cdnScriptUrl(base, 'prod'), `Prod CDN for ${base}`, `so ${base} has already shipped`),
    await expectAbsent(fetchImpl, githubTagUrl(base), `GitHub tag v${base}`, `so ${base} has already shipped`),
  );
  return results;
}

const PIPELINE_FILES = [
  { file: 'tools/releases/prod-release.yml', npmTag: 'latest', productState: 'Latest' },
  { file: 'tools/releases/sdf-release.yml', npmTag: 'beta', productState: 'Beta' },
  { file: 'tools/releases/ddl-release.yml' },
  { file: 'tools/yaml-templates/security.yml' },
];
const MINIMUM_ASSET_RETENTION_VERSION = 6;

function checkPipelineConfig({ repoRoot, readFile }) {
  const results = [];
  for (const { file, npmTag, productState } of PIPELINE_FILES) {
    const text = readFile(path.join(repoRoot, file), 'utf8');
    const retention = matchAll(text, /AssetRetention@(\d+)/g).map(Number);
    const old = retention.filter((taskVersion) => taskVersion < MINIMUM_ASSET_RETENTION_VERSION);
    results.push(
      result(
        old.length === 0 ? Outcome.pass : Outcome.fail,
        old.length === 0
          ? `${file} uses AssetRetention@${retention.join(', @') || '(none)'}`
          : `${file} uses AssetRetention@${old.join(', @')}, which runs on end-of-life Node 16; use @6 or later`,
      ),
    );
    if (npmTag) {
      const tags = matchAll(text, /Publish to npm \(tag (\w+)\)/g);
      const states = matchAll(text, /productstate:\s*'(\w+)'/g);
      const tagOk = tags.length > 0 && tags.every((found) => found === npmTag);
      const stateOk = states.length > 0 && states.every((found) => found === productState);
      results.push(
        result(tagOk ? Outcome.pass : Outcome.fail, `${file} npm publish says tag ${tags.join(', ') || '(none)'}`),
        result(
          stateOk ? Outcome.pass : Outcome.fail,
          `${file} productstate is ${states.join(', ') || '(none)'}, expected ${productState}`,
        ),
      );
    }
  }
  return results;
}

const CHANGELOG_PATH = 'packages/teams-js/CHANGELOG.md';
const CHANGE_DIRECTORY = 'change';

function normalizeText(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function releasedEntries(changelog, version) {
  const lines = changelog.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `## ${version}`);
  if (start === -1) {
    return undefined;
  }
  const entries = [];
  let current;
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith('## ')) {
      break;
    }
    if (line.startsWith('- ')) {
      current = [line.slice(2)];
      entries.push(current);
    } else if (current && line.trim() !== '' && !line.trim().startsWith('#')) {
      current.push(line);
    } else {
      current = undefined;
    }
  }
  return new Set(entries.map((entry) => normalizeText(entry.join(' '))));
}

function defaultListDeletedChangeFiles(commit, repoRoot) {
  const output = childProcess.execFileSync(
    'git',
    ['show', '--diff-filter=D', '--name-only', '--format=', commit, '--', `${CHANGE_DIRECTORY}/`],
    { cwd: repoRoot, encoding: 'utf8' },
  );
  return output
    .split(/\r?\n/)
    .filter(Boolean)
    .map((file) => path.basename(file));
}

function checkConsumedChanges({ version, prepCommit, repoRoot, readFile, readDirectory, listDeletedChangeFiles }) {
  const entries = releasedEntries(readFile(path.join(repoRoot, CHANGELOG_PATH), 'utf8'), version);
  if (!entries) {
    return [result(Outcome.fail, `${CHANGELOG_PATH} has no "## ${version}" section; run this on the cleanup branch`)];
  }
  const deletedByPrep = new Set(prepCommit ? listDeletedChangeFiles(prepCommit, repoRoot) : []);
  const changeFiles = readDirectory(path.join(repoRoot, CHANGE_DIRECTORY)).filter((name) => name.endsWith('.json'));
  const results = [];
  for (const name of changeFiles) {
    const changeFile = JSON.parse(readFile(path.join(repoRoot, CHANGE_DIRECTORY, name), 'utf8'));
    if (deletedByPrep.has(name)) {
      results.push(
        result(
          Outcome.fail,
          `${CHANGE_DIRECTORY}/${name} was deleted by the prep commit ${prepCommit}, so ${version} already consumed ` +
            'it; delete it or the next release ships it again',
        ),
      );
    } else if (entries.has(normalizeText(changeFile.comment))) {
      // Matching text alone cannot tell a re-added change file from a new change with the same comment.
      results.push(
        result(
          Outcome.unreachable,
          `${CHANGE_DIRECTORY}/${name} has the same comment as an entry released in ${version}, but ` +
            (prepCommit ? `the prep commit ${prepCommit} did not delete it` : 'no --prep-commit was given') +
            '; keep it if it is a new change, delete it if it is the released change re-added under another name',
        ),
      );
    }
  }
  if (results.length === 0) {
    return [
      result(
        Outcome.pass,
        `none of the ${changeFiles.length} pending change files repeats an entry released in ${version}` +
          (prepCommit ? ` or was consumed by ${prepCommit}` : ''),
      ),
    ];
  }
  return results;
}

const ANNOUNCEMENT_LINKS = [
  { name: 'npm', pattern: /npmjs\.com\/package\/@microsoft\/teams-js\/v\/([^/\s"'<>)]+)/, required: true },
  { name: 'CDN', pattern: /cdn\.office\.net\/teams-js\/([^/\s"'<>)]+)\/js\//, required: true },
  { name: 'GitHub release', pattern: /microsoft-teams-library-js\/releases\/tag\/v([^/\s"'<>)]+)/, required: false },
];

function checkAnnouncement({ version, text }) {
  const urls = text.match(/https?:\/\/[^\s"'<>)\]]+/g) || [];
  const results = [];
  for (const { name, pattern, required } of ANNOUNCEMENT_LINKS) {
    const versions = urls
      .map((url) => url.match(pattern))
      .filter(Boolean)
      .map((match) => match[1]);
    if (versions.length === 0) {
      if (required) {
        results.push(result(Outcome.fail, `the announcement has no ${name} link`));
      }
      continue;
    }
    const wrong = versions.filter((found) => found !== version);
    results.push(
      result(
        wrong.length === 0 ? Outcome.pass : Outcome.fail,
        wrong.length === 0
          ? `every ${name} link names ${version}`
          : `${name} link names ${wrong.join(', ')}, expected ${version}`,
      ),
    );
  }
  return results;
}

async function checkMergedBack({ version, fetchImpl }) {
  const url = mainChangelogUrl();
  const { response, unreachable } = await fetchOrUnreachable(fetchImpl, url, 'main CHANGELOG');
  if (unreachable) {
    return [unreachable];
  }
  if (response.status !== 200) {
    return [result(Outcome.unreachable, `main CHANGELOG ${url} returned HTTP ${response.status}`)];
  }
  const heading = `## ${version}`;
  const body = await readBody(response, (r) => r.text(), 'main CHANGELOG', url);
  if (body.unreachable) {
    return [body.unreachable];
  }
  const found = body.value.split(/\r?\n/).some((line) => line.trim() === heading);
  return [
    found
      ? result(Outcome.pass, `main's CHANGELOG has the "${heading}" section, so the release is merged back`)
      : result(Outcome.fail, `main's CHANGELOG has no "${heading}" section, so the release is not merged back yet`),
  ];
}

async function readCdnBytes(fetchImpl, version) {
  const url = cdnScriptUrl(version, 'prod');
  const { response, unreachable } = await fetchOrUnreachable(fetchImpl, url, 'CDN');
  if (unreachable) {
    return { problem: unreachable };
  }
  if (response.status === 404) {
    return { problem: result(Outcome.fail, `CDN ${url} returned HTTP 404`) };
  }
  if (response.status !== 200) {
    return { problem: inconclusiveStatus('CDN', url, response.status) };
  }
  const body = await readBody(response, (r) => r.arrayBuffer(), 'CDN', url);
  if (body.unreachable) {
    return { problem: body.unreachable };
  }
  return { bytes: Buffer.from(body.value).length };
}

async function reportSize({ version, previous, fetchImpl }) {
  const current = await readCdnBytes(fetchImpl, version);
  const before = await readCdnBytes(fetchImpl, previous);
  const problems = [current.problem, before.problem].filter(Boolean);
  if (problems.length > 0) {
    return problems;
  }
  const change = current.bytes - before.bytes;
  const sign = change >= 0 ? '+' : '-';
  const percent = ((Math.abs(change) / before.bytes) * 100).toFixed(2);
  return [
    result(
      Outcome.info,
      `${version} is ${current.bytes} bytes; ${previous} was ${before.bytes} bytes; ` +
        `change ${sign}${Math.abs(change)} bytes (${sign}${percent}%)`,
    ),
  ];
}

async function checkNpm({ version, distTag, registry, fetchImpl }) {
  const sources = await observeNpm({ version, tagNames: distTag ? [distTag] : [], registry, fetchImpl });
  const results = [npmPresenceResult(sources, version)];
  if (distTag) {
    results.push(npmTagResult(sources, version, distTag));
  }
  return results;
}

async function checkValidDomains({ repoRoot, fetchImpl, readFile }) {
  const url = validDomainsUrl('prod');
  const live = await readJson(fetchImpl, url, 'valid domains');
  if (live.problem) {
    return [live.problem];
  }
  const source = JSON.parse(readFile(path.join(repoRoot, VALID_DOMAINS_SOURCE), 'utf8'));
  if (JSON.stringify(live.json) === JSON.stringify(source)) {
    return [result(Outcome.pass, `valid domains ${url} equals ${VALID_DOMAINS_SOURCE}`)];
  }
  const liveOrigins = new Set(live.json.validOrigins || []);
  const sourceOrigins = new Set(source.validOrigins || []);
  const missingLive = [...sourceOrigins].filter((origin) => !liveOrigins.has(origin));
  const extraLive = [...liveOrigins].filter((origin) => !sourceOrigins.has(origin));
  return [
    result(
      Outcome.fail,
      `valid domains ${url} differs from ${VALID_DOMAINS_SOURCE}; missing live: [${missingLive.join(', ')}], ` +
        `only live: [${extraLive.join(', ')}]. After a DDL run this usually means the CDN is serving a cached copy.`,
    ),
  ];
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const options = {};
  for (let index = 0; index < rest.length; index += 2) {
    const flag = rest[index];
    const value = rest[index + 1];
    if (!flag.startsWith('--') || value === undefined || value.startsWith('--')) {
      throw new UsageError(`Expected "--name value" pairs, got "${flag}"`);
    }
    const name = flag.slice(2);
    if (Object.prototype.hasOwnProperty.call(options, name)) {
      throw new UsageError(`${flag} is given more than once`);
    }
    options[name] = value;
  }
  return { command, options };
}

function requireVersion(options) {
  if (!options.version || !VERSION_PATTERN.test(options.version)) {
    throw new UsageError('--version must be a semantic version such as 2.59.0 or 2.60.0-beta.0');
  }
  return options.version;
}

function requireEnvironment(options) {
  const environment = options.environment || 'prod';
  if (!Object.prototype.hasOwnProperty.call(CDN_HOSTS, environment)) {
    throw new UsageError(`--environment must be one of ${Object.keys(CDN_HOSTS).join(', ')}`);
  }
  return environment;
}

function requireRegistry(options) {
  const registry = (options.registry || DEFAULT_REGISTRY).replace(/\/+$/, '');
  if (!registry.startsWith('https://')) {
    throw new UsageError('--registry must be an https:// URL');
  }
  return registry;
}

function requireExpect(options) {
  if (options.expect !== 'prerelease' && options.expect !== 'latest') {
    throw new UsageError('--expect must be prerelease or latest');
  }
  return options.expect;
}

function requireFile(options, command, what) {
  if (!options.file) {
    throw new UsageError(`${command} needs --file <${what}>`);
  }
  return options.file;
}

function requireCheckout(repoRoot, command, alternative = '') {
  if (!repoRoot) {
    throw new UsageError(
      `${command} reads the checkout; run it inside a microsoft-teams-library-js checkout (no git repository here)` +
        alternative,
    );
  }
}

function resolveRepoRoot(cwd, runGit = (args, options) => childProcess.execFileSync('git', args, options)) {
  try {
    const root = runGit(['rev-parse', '--show-toplevel'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return root || undefined;
  } catch {
    return undefined;
  }
}

function checkArtifact({ version, file, repoRoot, readFile, readDirectory }) {
  const carriers = readCarriers(repoRoot, readFile);
  const results = checkCarriers(carriers, version);
  const expectedFolder = `/CDNFeed/${version}/js/MicrosoftTeams.min.js`;
  const absoluteFile = path.resolve(file);
  const inVersionFolder = absoluteFile.replace(/\\/g, '/').endsWith(expectedFolder);
  results.push(
    result(
      inVersionFolder ? Outcome.pass : Outcome.fail,
      inVersionFolder
        ? `${file} is in the CDNFeed folder for ${version}`
        : `${file} is not under CDNFeed/${version}/js; check the CI run is the one from the prep PR merge`,
    ),
  );
  if (inVersionFolder) {
    const cdnFeed = path.dirname(path.dirname(path.dirname(absoluteFile)));
    const versionFolders = readDirectory(cdnFeed).filter((name) => !name.startsWith('_'));
    if (versionFolders.length !== 1) {
      results.push(
        result(
          Outcome.fail,
          `${cdnFeed} holds version folders ${versionFolders.join(', ')}; expected only ${version} (and _manifest)`,
        ),
      );
    }
  }
  const expectedSri = carrierIntegrity(carriers);
  if (expectedSri) {
    results.push(checkBytes(readFile(file), expectedSri, file));
  }
  return results;
}

const commands = {
  'check-version': {
    flags: ['version', 'registry'],
    optional: ['registry'],
    summary: 'the version is free on registry.npmjs.org, mirrors, the Prod CDN and GitHub tags',
    run: async (options, { fetchImpl }) =>
      checkVersionIsFree({ version: requireVersion(options), registry: requireRegistry(options), fetchImpl }),
  },
  carriers: {
    flags: ['version'],
    checkout: true,
    summary: "the checkout's version carriers agree on the version and one SRI hash",
    run: async (options, { repoRoot, readFile }) =>
      checkCarriers(readCarriers(repoRoot, readFile), requireVersion(options)),
  },
  artifact: {
    flags: ['version', 'file'],
    checkout: true,
    summary: "a downloaded CI build's CDNFeed/<v>/js/MicrosoftTeams.min.js is the only version and matches that SRI",
    run: async (options, deps) =>
      checkArtifact({
        version: requireVersion(options),
        file: requireFile(options, 'artifact', 'path to the CI build CDNFeed/<version>/js/MicrosoftTeams.min.js'),
        ...deps,
      }),
  },
  published: {
    flags: ['version', 'environment', 'dist-tag', 'expected-sri', 'registry'],
    optional: ['environment', 'dist-tag', 'expected-sri', 'registry'],
    summary: 'the CDN bytes match the SRI, and npm has the version (and dist-tag) per the source rules',
    run: async (options, { repoRoot, readFile, fetchImpl }) => {
      const version = requireVersion(options);
      const environment = requireEnvironment(options);
      const registry = requireRegistry(options);
      if (!options['expected-sri'] && environment === 'sdf') {
        throw new UsageError('published --environment sdf needs --expected-sri; beta builds are not in the carriers');
      }
      const expectedSri = options['expected-sri'];
      if (!expectedSri) {
        requireCheckout(repoRoot, 'published', ', or pass --expected-sri');
      }
      const sri = expectedSri || carrierIntegrity(readCarriers(repoRoot, readFile));
      if (!sri || !SRI_PATTERN.test(sri)) {
        throw new UsageError('No single sha384 SRI to compare against; pass --expected-sri');
      }
      return [
        await checkCdnScript({ version, environment, expectedSri: sri, fetchImpl }),
        ...(await checkNpm({ version, distTag: options['dist-tag'], registry, fetchImpl })),
      ];
    },
  },
  domains: {
    flags: [],
    checkout: true,
    summary: "the live Prod valid-domains list equals this checkout's source",
    run: async (options, { repoRoot, readFile, fetchImpl }) => checkValidDomains({ repoRoot, fetchImpl, readFile }),
  },
  'github-release': {
    flags: ['version', 'expect'],
    summary: 'the GitHub release state (prerelease|latest), and tag v<v> carries the bump at the release branch head',
    run: async (options, { fetchImpl }) =>
      checkGithubRelease({ version: requireVersion(options), expect: requireExpect(options), fetchImpl }),
  },
  'merged-back': {
    flags: ['version'],
    summary: "main's CHANGELOG has the version's section",
    run: async (options, { fetchImpl }) => checkMergedBack({ version: requireVersion(options), fetchImpl }),
  },
  'beta-version': {
    flags: ['version', 'registry'],
    optional: ['registry'],
    summary:
      'a beta <x.y.z>-beta.<n> is of a version that has not shipped (npm and GitHub latest, Prod CDN, GitHub tag)',
    run: async (options, { fetchImpl }) => {
      const version = requireVersion(options);
      if (!/^\d+\.\d+\.\d+-beta\.\d+$/.test(version)) {
        throw new UsageError('beta-version needs a version such as 2.60.0-beta.0 (<x.y.z>-beta.<n>)');
      }
      return checkBetaVersion({ version, registry: requireRegistry(options), fetchImpl });
    },
  },
  'pipeline-config': {
    flags: [],
    checkout: true,
    summary: "the checkout's release YAML: Prod tag latest, SDF tag beta, AssetRetention@6 or later",
    run: async (options, { repoRoot, readFile }) => checkPipelineConfig({ repoRoot, readFile }),
  },
  'consumed-changes': {
    flags: ['version', 'prep-commit'],
    optional: ['prep-commit'],
    checkout: true,
    summary: 'on the merge-back branch, no pending change file was already consumed by the release',
    run: async (options, deps) => {
      const prepCommit = options['prep-commit'];
      if (prepCommit !== undefined && !/^[0-9a-f]{7,40}$/i.test(prepCommit)) {
        throw new UsageError('--prep-commit must be a commit SHA (7-40 hex characters)');
      }
      return checkConsumedChanges({ version: requireVersion(options), prepCommit, ...deps });
    },
  },
  announcement: {
    flags: ['version', 'file'],
    summary: 'every npm, CDN and GitHub release link in a draft names the version',
    run: async (options, { readFile }) => {
      const version = requireVersion(options);
      const file = requireFile(options, 'announcement', 'path to the draft text');
      return checkAnnouncement({ version, text: readFile(file, 'utf8') });
    },
  },
  size: {
    flags: ['version', 'previous'],
    summary: '(informational) Prod CDN bundle bytes and the change from --previous',
    run: async (options, { fetchImpl }) => {
      const version = requireVersion(options);
      if (!options.previous || !VERSION_PATTERN.test(options.previous)) {
        throw new UsageError('size needs --previous <the version released before>');
      }
      return reportSize({ version, previous: options.previous, fetchImpl });
    },
  },
  links: {
    flags: ['version'],
    summary: '(informational) the public npm, CDN and GitHub release links for an announcement',
    run: async (options) =>
      Object.entries(publicLinks(requireVersion(options))).map(([name, url]) => result(Outcome.info, `${name} ${url}`)),
  },
  sri: {
    flags: ['file'],
    summary: "(informational) a file's sha384 SRI",
    run: async (options, { readFile }) => {
      const file = requireFile(options, 'sri', 'path');
      return [result(Outcome.info, `${computeSri(readFile(file))} ${file}`)];
    },
  },
  help: {
    flags: [],
    summary: 'this list',
    run: async () =>
      Object.entries(commands).map(([name, { flags, optional = [], summary }]) =>
        result(
          Outcome.info,
          `${name}${flags.map((flag) => (optional.includes(flag) ? ` [--${flag}]` : ` --${flag}`)).join('')}: ${summary}`,
        ),
      ),
  },
};

async function run(
  argv,
  {
    repoRoot,
    fetchImpl = globalThis.fetch,
    readFile = fs.readFileSync,
    readDirectory = fs.readdirSync,
    listDeletedChangeFiles = defaultListDeletedChangeFiles,
    log = console.log,
    env = process.env,
  },
) {
  const authorizedFetch = (url, init) => fetchImpl(url, withGithubAuth(url, init, env));
  let results;
  try {
    const { command, options } = parseArgs(argv);
    if (!Object.prototype.hasOwnProperty.call(commands, command)) {
      throw new UsageError(`Command must be one of: ${Object.keys(commands).join(', ')} (try "help")`);
    }
    const { flags, checkout, run: runCommand } = commands[command];
    const unknown = Object.keys(options).filter((name) => !flags.includes(name));
    if (unknown.length > 0) {
      throw new UsageError(
        `${command} does not take --${unknown.join(', --')}; it takes ${
          flags.length > 0 ? `--${flags.join(', --')}` : 'no options'
        }`,
      );
    }
    if (checkout) {
      requireCheckout(repoRoot, command);
    }
    results = await runCommand(options, {
      repoRoot,
      fetchImpl: authorizedFetch,
      readFile,
      readDirectory,
      listDeletedChangeFiles,
    });
  } catch (error) {
    if (error instanceof UsageError) {
      log(`USAGE ${error.message}`);
      return ExitCode.usage;
    }
    if (error && error.code === 'ENOENT' && error.path) {
      log(
        `USAGE cannot read ${error.path}; run inside a microsoft-teams-library-js checkout, ` +
          'and check any --file path',
      );
      return ExitCode.usage;
    }
    throw error;
  }

  for (const { outcome, message } of results) {
    log(`${outcome} ${message}`);
  }
  if (results.some(({ outcome }) => outcome === Outcome.fail)) {
    return ExitCode.failed;
  }
  return results.some(({ outcome }) => outcome === Outcome.unreachable) ? ExitCode.unreachable : ExitCode.passed;
}

module.exports = {
  ExitCode,
  Outcome,
  carrierIntegrity,
  cdnScriptUrl,
  checkCarriers,
  computeSri,
  publicLinks,
  readCarriers,
  resolveRepoRoot,
  run,
  validDomainsUrl,
};

if (require.main === module) {
  run(process.argv.slice(2), { repoRoot: resolveRepoRoot(process.cwd()) }).then(
    (code) => {
      process.exitCode = code;
    },
    (error) => {
      console.error(error);
      process.exitCode = ExitCode.failed;
    },
  );
}
