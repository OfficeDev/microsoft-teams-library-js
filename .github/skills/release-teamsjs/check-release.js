#!/usr/bin/env node
/**
 * Read-only checks for a @microsoft/teams-js release. Nothing here writes files, refs, packages or messages.
 *
 *   check-version --version <v>                    <v> is free on npm, the Prod CDN and as a GitHub tag
 *   carriers      --version <v>                    the checkout's version carriers agree on <v> and one SRI hash
 *   artifact      --version <v> --file <path>      a downloaded CI build's MicrosoftTeams.min.js matches that SRI
 *   published     --version <v> [--environment prod|sdf] [--dist-tag <tag>] [--expected-sri <sri>] [--registry <url>]
 *                                                  the CDN bytes and the npm registry show the release
 *   domains       [--environment prod|sdf]         the live valid-domains list equals this checkout's source
 *   links         --version <v>                    public npm, CDN and GitHub release links for the announcement
 *   sri           --file <path>                    the sha384 SRI of a file, such as an SDF beta CI bundle
 *   github-release --version <v> --expect prerelease|latest
 *                                                  the GitHub release state, that tag v<v> carries the bump and
 *                                                  points at the release branch head, and which release is Latest
 *   merged-back   --version <v>                    main's CHANGELOG has the <v> section
 *   size          --version <v> --previous <p>     Prod CDN bundle bytes and the change from <p>
 *   beta-version  --version <x.y.z>-beta.<n> [--registry <url>]
 *                                                  the beta is of a version newer than npm's latest
 *   pipeline-config                                the checkout's release YAML: Prod publishes with tag latest,
 *                                                  SDF with tag beta, and artifact retention is @6 or later
 *   announcement  --version <v> --file <path>      every npm, CDN and GitHub release link in a draft names <v>
 *   consumed-changes --version <v>                 no pending change file repeats an entry released in <v>
 *                                                  (run on the merge-back branch after merging main)
 *
 * GitHub API calls send GITHUB_TOKEN as a bearer token when it is set, to avoid anonymous rate limits.
 *
 * Exit codes: 0 every check passed, 1 a check failed, 2 usage error, 3 a source was unreachable (inconclusive).
 */
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PACKAGE_NAME = '@microsoft/teams-js';
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
  return `${registry}/${PACKAGE_NAME.replace('/', '%2f')}/${version}`;
}

function npmDistTagsUrl(registry) {
  return `${registry}/-/package/${PACKAGE_NAME.replace('/', '%2f')}/dist-tags`;
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
    return { response: await fetchImpl(url, { redirect: 'follow' }) };
  } catch (error) {
    return {
      unreachable: result(
        Outcome.unreachable,
        `${label}: could not reach ${url} (${error.message}). This is not evidence either way.`,
      ),
    };
  }
}

async function expectAbsent(fetchImpl, url, label) {
  const { response, unreachable } = await fetchOrUnreachable(fetchImpl, url, label);
  if (unreachable) {
    return unreachable;
  }
  if (response.status === 404) {
    return result(Outcome.pass, `${label}: ${url} does not exist yet`);
  }
  if (response.status === 200) {
    return result(Outcome.fail, `${label}: ${url} already exists, so this version is taken`);
  }
  return result(
    Outcome.unreachable,
    `${label}: ${url} returned HTTP ${response.status}. This is not evidence either way.`,
  );
}

async function checkVersionIsFree({ version, registry, fetchImpl }) {
  return [
    await expectAbsent(fetchImpl, npmVersionUrl(registry, version), 'npm'),
    await expectAbsent(fetchImpl, cdnScriptUrl(version, 'prod'), 'Prod CDN'),
    await expectAbsent(fetchImpl, githubTagUrl(version), 'GitHub tag'),
  ];
}

async function checkCdnScript({ version, environment, expectedSri, fetchImpl }) {
  const url = cdnScriptUrl(version, environment);
  const { response, unreachable } = await fetchOrUnreachable(fetchImpl, url, 'CDN');
  if (unreachable) {
    return unreachable;
  }
  if (response.status !== 200) {
    return result(Outcome.fail, `CDN ${url} returned HTTP ${response.status}`);
  }
  return checkBytes(Buffer.from(await response.arrayBuffer()), expectedSri, `CDN ${url}`);
}

async function readJson(fetchImpl, url, label) {
  const { response, unreachable } = await fetchOrUnreachable(fetchImpl, url, label);
  if (unreachable) {
    return { problem: unreachable };
  }
  if (response.status !== 200) {
    return { problem: result(Outcome.fail, `${label} ${url} returned HTTP ${response.status}`) };
  }
  return { json: await response.json() };
}

async function readGithubJson(fetchImpl, url, label) {
  const { response, unreachable } = await fetchOrUnreachable(fetchImpl, url, label);
  if (unreachable) {
    return { problem: unreachable };
  }
  if (response.status === 404) {
    return { problem: result(Outcome.fail, `${label}: ${url} does not exist`) };
  }
  if (response.status !== 200) {
    return {
      problem: result(
        Outcome.unreachable,
        `${label}: ${url} returned HTTP ${response.status}. Set GITHUB_TOKEN if this is a rate limit.`,
      ),
    };
  }
  return { json: await response.json() };
}

async function checkGithubRelease({ version, expect, fetchImpl }) {
  const tag = `v${version}`;
  const results = [];
  const release = await readGithubJson(fetchImpl, githubReleaseUrl(version), 'GitHub release');
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

function parseStableVersion(version) {
  return version.split('-')[0].split('.').map(Number);
}

function isNewer(candidate, baseline) {
  const [a, b] = [parseStableVersion(candidate), parseStableVersion(baseline)];
  for (let index = 0; index < 3; index++) {
    if (a[index] !== b[index]) {
      return a[index] > b[index];
    }
  }
  return false;
}

async function checkBetaVersion({ version, registry, fetchImpl }) {
  const tags = await readJson(fetchImpl, npmDistTagsUrl(registry), 'npm dist-tags');
  if (tags.problem) {
    return [tags.problem];
  }
  const latest = tags.json.latest;
  const newer = isNewer(version, latest);
  return [
    result(
      newer ? Outcome.pass : Outcome.fail,
      newer
        ? `${version} is a beta of a version newer than latest ${latest}`
        : `${version} is a beta of a version that is not newer than latest ${latest}; it would sort below the release`,
    ),
  ];
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

function releasedEntries(changelog, version) {
  const lines = changelog.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `## ${version}`);
  if (start === -1) {
    return undefined;
  }
  const entries = new Set();
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith('## ')) {
      break;
    }
    if (line.startsWith('- ')) {
      entries.add(line.slice(2).trim());
    }
  }
  return entries;
}

function checkConsumedChanges({ version, repoRoot, readFile, readDirectory }) {
  const entries = releasedEntries(readFile(path.join(repoRoot, CHANGELOG_PATH), 'utf8'), version);
  if (!entries) {
    return [result(Outcome.fail, `${CHANGELOG_PATH} has no "## ${version}" section; run this on the cleanup branch`)];
  }
  const changeFiles = readDirectory(path.join(repoRoot, CHANGE_DIRECTORY)).filter((name) => name.endsWith('.json'));
  const consumed = changeFiles.filter((name) => {
    const changeFile = JSON.parse(readFile(path.join(repoRoot, CHANGE_DIRECTORY, name), 'utf8'));
    return entries.has(String(changeFile.comment || '').trim());
  });
  if (consumed.length === 0) {
    return [
      result(
        Outcome.pass,
        `none of the ${changeFiles.length} pending change files repeats an entry released in ${version}`,
      ),
    ];
  }
  return consumed.map((name) =>
    result(
      Outcome.fail,
      `${CHANGE_DIRECTORY}/${name} repeats an entry already released in ${version}; delete it or the next release ` +
        'ships it again',
    ),
  );
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
  const found = (await response.text()).split(/\r?\n/).some((line) => line.trim() === heading);
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
  if (response.status !== 200) {
    return { problem: result(Outcome.fail, `CDN ${url} returned HTTP ${response.status}`) };
  }
  return { bytes: Buffer.from(await response.arrayBuffer()).length };
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
  const results = [];
  const versionUrl = npmVersionUrl(registry, version);
  const manifest = await readJson(fetchImpl, versionUrl, 'npm');
  results.push(
    manifest.problem ||
      result(
        manifest.json.version === version ? Outcome.pass : Outcome.fail,
        `npm ${versionUrl} reports version ${manifest.json.version}`,
      ),
  );
  if (distTag) {
    const tags = await readJson(fetchImpl, npmDistTagsUrl(registry), 'npm dist-tags');
    results.push(
      tags.problem ||
        result(
          tags.json[distTag] === version ? Outcome.pass : Outcome.fail,
          `npm dist-tag ${distTag} points at ${tags.json[distTag]}, expected ${version}`,
        ),
    );
  }
  return results;
}

async function checkValidDomains({ environment, repoRoot, fetchImpl, readFile }) {
  const url = validDomainsUrl(environment);
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
    options[flag.slice(2)] = value;
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

const commands = {
  'check-version': async (options, { fetchImpl }) =>
    checkVersionIsFree({ version: requireVersion(options), registry: requireRegistry(options), fetchImpl }),

  carriers: async (options, { repoRoot, readFile }) =>
    checkCarriers(readCarriers(repoRoot, readFile), requireVersion(options)),

  artifact: async (options, { repoRoot, readFile }) => {
    const version = requireVersion(options);
    if (!options.file) {
      throw new UsageError('artifact needs --file <path to the CI build CDNFeed/<version>/js/MicrosoftTeams.min.js>');
    }
    const carriers = readCarriers(repoRoot, readFile);
    const results = checkCarriers(carriers, version);
    const expectedFolder = `/CDNFeed/${version}/js/MicrosoftTeams.min.js`;
    const inVersionFolder = options.file.replace(/\\/g, '/').endsWith(expectedFolder);
    results.push(
      result(
        inVersionFolder ? Outcome.pass : Outcome.fail,
        inVersionFolder
          ? `${options.file} is in the CDNFeed folder for ${version}`
          : `${options.file} is not under CDNFeed/${version}/js; check the CI run is the one from the prep PR merge`,
      ),
    );
    const expectedSri = carrierIntegrity(carriers);
    if (expectedSri) {
      results.push(checkBytes(readFile(options.file), expectedSri, options.file));
    }
    return results;
  },

  published: async (options, { repoRoot, readFile, fetchImpl }) => {
    const version = requireVersion(options);
    const environment = requireEnvironment(options);
    const registry = requireRegistry(options);
    if (!options['expected-sri'] && environment === 'sdf') {
      throw new UsageError('published --environment sdf needs --expected-sri; beta builds are not in the carriers');
    }
    const expectedSri = options['expected-sri'] || carrierIntegrity(readCarriers(repoRoot, readFile));
    if (!expectedSri || !SRI_PATTERN.test(expectedSri)) {
      throw new UsageError('No single sha384 SRI to compare against; pass --expected-sri');
    }
    return [
      await checkCdnScript({ version, environment, expectedSri, fetchImpl }),
      ...(await checkNpm({ version, distTag: options['dist-tag'], registry, fetchImpl })),
    ];
  },

  domains: async (options, { repoRoot, readFile, fetchImpl }) =>
    checkValidDomains({ environment: requireEnvironment(options), repoRoot, fetchImpl, readFile }),

  'github-release': async (options, { fetchImpl }) =>
    checkGithubRelease({ version: requireVersion(options), expect: requireExpect(options), fetchImpl }),

  'merged-back': async (options, { fetchImpl }) => checkMergedBack({ version: requireVersion(options), fetchImpl }),

  'beta-version': async (options, { fetchImpl }) => {
    const version = requireVersion(options);
    if (!/^\d+\.\d+\.\d+-beta\.\d+$/.test(version)) {
      throw new UsageError('beta-version needs a version such as 2.60.0-beta.0 (<x.y.z>-beta.<n>)');
    }
    return checkBetaVersion({ version, registry: requireRegistry(options), fetchImpl });
  },

  'pipeline-config': async (options, { repoRoot, readFile }) => checkPipelineConfig({ repoRoot, readFile }),

  'consumed-changes': async (options, { repoRoot, readFile, readDirectory }) =>
    checkConsumedChanges({ version: requireVersion(options), repoRoot, readFile, readDirectory }),

  announcement: async (options, { readFile }) => {
    const version = requireVersion(options);
    if (!options.file) {
      throw new UsageError('announcement needs --file <path to the draft text>');
    }
    return checkAnnouncement({ version, text: readFile(options.file, 'utf8') });
  },

  size: async (options, { fetchImpl }) => {
    const version = requireVersion(options);
    if (!options.previous || !VERSION_PATTERN.test(options.previous)) {
      throw new UsageError('size needs --previous <the version released before>');
    }
    return reportSize({ version, previous: options.previous, fetchImpl });
  },

  links: async (options) =>
    Object.entries(publicLinks(requireVersion(options))).map(([name, url]) => result(Outcome.info, `${name} ${url}`)),

  sri: async (options, { readFile }) => {
    if (!options.file) {
      throw new UsageError('sri needs --file <path>');
    }
    return [result(Outcome.info, `${computeSri(readFile(options.file))} ${options.file}`)];
  },
};

async function run(
  argv,
  {
    repoRoot,
    fetchImpl = globalThis.fetch,
    readFile = fs.readFileSync,
    readDirectory = fs.readdirSync,
    log = console.log,
    env = process.env,
  },
) {
  const authorizedFetch = (url, init) => fetchImpl(url, withGithubAuth(url, init, env));
  let results;
  try {
    const { command, options } = parseArgs(argv);
    if (!Object.prototype.hasOwnProperty.call(commands, command)) {
      throw new UsageError(`Command must be one of: ${Object.keys(commands).join(', ')}`);
    }
    results = await commands[command](options, { repoRoot, fetchImpl: authorizedFetch, readFile, readDirectory });
  } catch (error) {
    if (error instanceof UsageError) {
      log(`USAGE ${error.message}`);
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
  run,
  validDomainsUrl,
};

if (require.main === module) {
  run(process.argv.slice(2), { repoRoot: path.resolve(__dirname, '..', '..', '..') }).then(
    (code) => {
      process.exitCode = code;
    },
    (error) => {
      console.error(error);
      process.exitCode = ExitCode.failed;
    },
  );
}
