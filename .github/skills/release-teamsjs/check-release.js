#!/usr/bin/env node
/**
 * Read-only checks for a @microsoft/teams-js release. Nothing here writes files, refs, packages or messages.
 *
 *   check-version --version <v>                    <v> is free on npm, the Prod CDN and as a GitHub tag
 *   preflight     [--version <v>] [--registry <url>]
 *                                                  Step 1: pending change files and the version they make, the
 *                                                  release YAML, npm reachability and GitHub CI on main; with
 *                                                  --version, check-version and that release/<v> does not exist
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
 *   pipeline-config                                the checkout's release YAML: Prod runs validate-prod-build.ps1 in
 *                                                  the Validate_CI_build job of a stage the Lockbox stage depends on,
 *                                                  with no continueOnError and no condition but succeeded() on the
 *                                                  task, the job or the Lockbox stage, and publishes with tag
 *                                                  latest, SDF gates its Lockbox stage on the Check_Skip decision and
 *                                                  publishes with tag beta, and each has artifact retention @6 or later;
 *                                                  commented-out, `enabled: false` and script-text tasks don't count
 *   announcement  --version <v> --file <path>      every npm, CDN and GitHub release link in a draft names <v>
 *   announcement-draft --version <v>               prints a Prod announcement draft from the checkout's CHANGELOG
 *                                                  section for <v>, then runs the announcement check on it
 *   consumed-changes --version <v> --prep-commit <sha>
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
// Canonical SemVer without build metadata: no leading zeros in numbers, no empty prerelease identifiers.
const NUMERIC_IDENTIFIER = '(?:0|[1-9]\\d*)';
const PRERELEASE_IDENTIFIER = `(?:${NUMERIC_IDENTIFIER}|\\d*[A-Za-z-][0-9A-Za-z-]*)`;
const VERSION_PATTERN = new RegExp(
  `^${NUMERIC_IDENTIFIER}\\.${NUMERIC_IDENTIFIER}\\.${NUMERIC_IDENTIFIER}` +
    `(?:-${PRERELEASE_IDENTIFIER}(?:\\.${PRERELEASE_IDENTIFIER})*)?$`,
);
// A sha384 digest is 48 bytes: exactly 64 base64 characters, with no padding.
const SRI_PATTERN = /^sha384-[A-Za-z0-9+/]{64}$/;
const CARRIER_VERSION_PATTERNS = [
  /res\.cdn\.office\.net\/teams-js\/([^/\s"')]+)\/js\/MicrosoftTeams\.min\.js/g,
  /node_modules\/@microsoft\/teams-js@([^/\s"')]+)\/dist\/MicrosoftTeams\.min\.js/g,
];
const SCRIPT_TAG_PATTERN = /<script\b[^>]*>/gi;
// Attribute names are case-insensitive and must be whole names: `data-src` and `data-integrity` are not them.
const CDN_SCRIPT_SRC_PATTERN =
  /\ssrc\s*=\s*"[^"]*res\.cdn\.office\.net\/teams-js\/[^"]*\/js\/MicrosoftTeams\.min\.js"/i;
const INTEGRITY_ATTRIBUTE_PATTERN = /\sintegrity\s*=\s*"([^"]*)"/i;
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

// The integrity attribute of each teams-js CDN <script> in a carrier ('' when one has none). Other elements'
// integrity attributes are not this bundle's.
function cdnScriptIntegrities(text) {
  return Array.from(text.matchAll(SCRIPT_TAG_PATTERN), ([tag]) => tag)
    .filter((tag) => CDN_SCRIPT_SRC_PATTERN.test(tag))
    .map((tag) => INTEGRITY_ATTRIBUTE_PATTERN.exec(tag)?.[1] ?? '');
}

class LocalFileError extends Error {}

// Reads a JSON file from the checkout, tolerating a UTF-8 BOM as beachball and npm do. A file that is not JSON is
// a FAIL naming it, not a crash.
function readLocalJson(readFile, file, relativePath) {
  const text = readFile(file, 'utf8').replace(/^\uFEFF/, '');
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new LocalFileError(`${relativePath} is not valid JSON (${error.message})`);
  }
}

function distinctIntegrities(carriers) {
  return [...new Set(carriers.sriFiles.flatMap(({ integrities }) => integrities))];
}

function readCarriers(repoRoot, readFile = fs.readFileSync) {
  const read = (relativePath) => readFile(path.join(repoRoot, relativePath), 'utf8');
  return {
    packageVersions: PACKAGE_JSON_FILES.map((file) => {
      const json = readLocalJson(readFile, path.join(repoRoot, file), file);
      return { file, version: json && typeof json === 'object' ? json.version : undefined };
    }),
    sriFiles: SRI_CARRIER_FILES.map((file) => {
      const text = read(file);
      return {
        file,
        versions: CARRIER_VERSION_PATTERNS.flatMap((pattern) => matchAll(text, pattern)),
        integrities: cdnScriptIntegrities(text),
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
      integrities.length === 0
        ? `${file} has no teams-js CDN script with an integrity attribute`
        : `${file} teams-js CDN script integrity is ${integrities.map((value) => value || '(none)').join(', ')}, ` +
            'expected a sha384 SRI (64 base64 characters)',
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
      error && error.name === 'TimeoutError'
        ? `timed out after ${FETCH_TIMEOUT_MS / 1000} s`
        : (error?.message ?? String(error));
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
      error && error.name === 'TimeoutError'
        ? `timed out after ${FETCH_TIMEOUT_MS / 1000} s`
        : (error?.message ?? String(error));
    return {
      unreachable: result(
        Outcome.unreachable,
        `${label}: reading ${url} failed (${reason}). This is not evidence either way.`,
      ),
    };
  }
}

// A 404 is evidence that something is absent only when the origin itself sent it, not a proxy, captive portal or
// login page in between. The Prod and SDF CDNs (Azure Blob storage) answer a missing path with a BlobNotFound error,
// GitHub's API with { "message": "Not Found" }, and the npm registry with "version not found: <v>" for a version or
// { "error": "Not found" } for a package. Other registries (a proxy) are never authoritative for absence.
async function isOriginNotFound(response, url) {
  let text;
  try {
    text = await response.text();
  } catch {
    return false;
  }
  const host = new URL(url).hostname;
  if (host === 'res.cdn.office.net' || host === 'res-sdf.cdn.office.net') {
    return /<Code>BlobNotFound<\/Code>/.test(text);
  }
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    return false;
  }
  const isObject = body !== null && typeof body === 'object';
  if (host === 'registry.npmjs.org') {
    return (
      (typeof body === 'string' && /^version not found\b/i.test(body)) ||
      (isObject && typeof body.error === 'string' && /not found/i.test(body.error))
    );
  }
  if (host === 'api.github.com') {
    return isObject && body.message === 'Not Found';
  }
  return isObject;
}

function notFromOrigin(label, url) {
  return result(
    Outcome.unreachable,
    `${label}: ${url} returned HTTP 404, but not the origin's own not-found answer. This is not evidence either way.`,
  );
}

async function expectAbsent(fetchImpl, url, label, takenMessage = 'so this version is taken') {
  const { response, unreachable } = await fetchOrUnreachable(fetchImpl, url, label);
  if (unreachable) {
    return unreachable;
  }
  if (response.status === 404) {
    return (await isOriginNotFound(response, url))
      ? result(Outcome.pass, `${label}: ${url} does not exist yet`)
      : notFromOrigin(label, url);
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
    return (await isOriginNotFound(response, url))
      ? result(Outcome.fail, `CDN ${url} returned HTTP 404`)
      : notFromOrigin('CDN', url);
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
    return (await isOriginNotFound(response, url))
      ? { status: 'missing', problem: result(Outcome.fail, `${label}: ${url} does not exist`) }
      : { status: 'unreachable', problem: notFromOrigin(label, url) };
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

async function readGithubJson(fetchImpl, url, label, { missingMessage, valid = () => true, fields } = {}) {
  const answer = await getJson(fetchImpl, url, label);
  if (answer.status === 'ok') {
    return valid(answer.json)
      ? { json: answer.json }
      : {
          problem: result(
            Outcome.unreachable,
            `${label}: ${url} returned HTTP 200 without ${fields}. This is not evidence either way.`,
          ),
        };
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
  const picked = Object.create(null);
  if (tags && typeof tags === 'object') {
    for (const tagName of tagNames) {
      if (
        Object.prototype.hasOwnProperty.call(tags, tagName) &&
        typeof tags[tagName] === 'string' &&
        VERSION_PATTERN.test(tags[tagName])
      ) {
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
    const source = { name, kind, hasVersion: undefined, tags: Object.create(null), problems: [] };
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

  const jsdelivr = { name: 'jsDelivr', kind: 'mirror', hasVersion: undefined, tags: Object.create(null), problems: [] };
  const listing = await getJson(fetchImpl, JSDELIVR_PACKAGE_URL, 'jsDelivr');
  if (listing.status === 'ok') {
    const versions = Array.isArray(listing.json.versions) ? listing.json.versions : [];
    if (version && versions.some((entry) => entry && entry.version === version)) {
      jsdelivr.hasVersion = true;
    }
    jsdelivr.tags = pickTags(listing.json.tags, tagNames);
  }
  sources.push(jsdelivr);

  const unpkg = { name: 'unpkg', kind: 'mirror', hasVersion: undefined, tags: Object.create(null), problems: [] };
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

const COMMIT_SHA_PATTERN = /^[0-9a-f]{40}$/i;
const hasCommitSha = (json) => Boolean(json.object) && COMMIT_SHA_PATTERN.test(json.object.sha);
const GITHUB_SHAPES = {
  release: {
    valid: (json) => typeof json.draft === 'boolean' && typeof json.prerelease === 'boolean',
    fields: 'boolean draft and prerelease fields',
  },
  latest: { valid: (json) => typeof json.tag_name === 'string' && json.tag_name !== '', fields: 'a tag_name' },
  contents: {
    valid: (json) => json.encoding === 'base64' && typeof json.content === 'string',
    fields: 'base64 content',
  },
  tagRef: {
    valid: (json) => hasCommitSha(json) && ['commit', 'tag'].includes(json.object.type),
    fields: 'an object with a commit or tag type and a sha',
  },
  commitRef: { valid: hasCommitSha, fields: 'an object with a sha' },
};

function packageVersionFromContents(json) {
  try {
    const version = JSON.parse(Buffer.from(json.content, 'base64').toString('utf8')).version;
    return typeof version === 'string' ? version : undefined;
  } catch {
    return undefined;
  }
}

async function checkGithubRelease({ version, expect, fetchImpl }) {
  const tag = `v${version}`;
  const results = [];
  const release = await readGithubJson(fetchImpl, githubReleaseUrl(version), 'GitHub release', {
    missingMessage: `GitHub release ${tag} is missing or still a draft (drafts are not visible by tag)`,
    valid: (json) => GITHUB_SHAPES.release.valid(json) && json.tag_name === tag,
    fields: `${GITHUB_SHAPES.release.fields} and tag_name ${tag}`,
  });
  const readLatest = () =>
    readGithubJson(fetchImpl, githubLatestReleaseUrl(), 'GitHub latest release', GITHUB_SHAPES.latest);
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
    const latest = await readLatest();
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
    const latest = await readLatest();
    results.push(
      latest.problem ||
        result(
          latest.json.tag_name === tag ? Outcome.pass : Outcome.fail,
          `GitHub latest release is ${latest.json.tag_name}, expected ${tag}`,
        ),
    );
  }

  const packageJson = await readGithubJson(
    fetchImpl,
    githubPackageJsonAtTagUrl(version),
    `Tag ${tag}`,
    GITHUB_SHAPES.contents,
  );
  const tagVersion = packageJson.json && packageVersionFromContents(packageJson.json);
  if (packageJson.problem) {
    results.push(packageJson.problem);
  } else if (!tagVersion) {
    results.push(
      result(
        Outcome.unreachable,
        `Tag ${tag}: ${githubPackageJsonAtTagUrl(version)} is not a package.json with a version. ` +
          'This is not evidence either way.',
      ),
    );
  } else {
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
  const tagRef = await readGithubJson(fetchImpl, githubTagUrl(version), `Tag ${tag}`, GITHUB_SHAPES.tagRef);
  if (tagRef.problem) {
    return tagRef.problem;
  }
  let tagCommit = tagRef.json.object.sha;
  if (tagRef.json.object.type === 'tag') {
    const annotated = await readGithubJson(
      fetchImpl,
      `${GITHUB_API}/repos/${REPOSITORY}/git/tags/${tagCommit}`,
      'Tag',
      GITHUB_SHAPES.commitRef,
    );
    if (annotated.problem) {
      return annotated.problem;
    }
    tagCommit = annotated.json.object.sha;
  }
  const branch = `release/${version}`;
  const head = await readGithubJson(
    fetchImpl,
    `${GITHUB_API}/repos/${REPOSITORY}/git/ref/heads/${branch}`,
    branch,
    GITHUB_SHAPES.commitRef,
  );
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
      // SemVer: numeric identifiers compare numerically and sort below alphanumeric ones.
      const [xNumeric, yNumeric] = [/^\d+$/.test(x), /^\d+$/.test(y)];
      if (xNumeric && yNumeric) {
        return Number(x) > Number(y) ? 1 : -1;
      }
      if (xNumeric !== yNumeric) {
        return xNumeric ? -1 : 1;
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
    .map((source) => ({
      name: source.name,
      value: source.tags.latest,
      authoritative: source.kind === 'authoritative',
    }));
  const githubLatest = await getJson(fetchImpl, githubLatestReleaseUrl(), 'GitHub Latest release');
  const githubTag =
    githubLatest.status === 'ok' && typeof githubLatest.json.tag_name === 'string' ? githubLatest.json.tag_name : '';
  if (VERSION_PATTERN.test(githubTag.replace(/^v/, ''))) {
    latests.push({ name: 'GitHub Latest release', value: githubTag.replace(/^v/, ''), authoritative: true });
  }
  const highest = highestVersion(latests.map(({ value }) => value));
  const results = [];
  if (highest) {
    const reportedBy = latests
      .filter(({ value }) => value === highest)
      .map(({ name }) => name)
      .join(', ');
    if (compareVersions(base, highest) <= 0) {
      results.push(
        result(
          Outcome.fail,
          `${version} is a beta of ${base}, which is not newer than latest ${highest} (${reportedBy}); ` +
            'it would sort below the release',
        ),
      );
    } else if (latests.some(({ authoritative }) => authoritative)) {
      results.push(
        result(Outcome.pass, `${version} is a beta of ${base}, newer than latest ${highest} (${reportedBy})`),
      );
    } else {
      results.push(
        result(
          Outcome.unreachable,
          `latest: only ${reportedBy} answered, with ${highest}; a proxy or mirror can lag, so a newer release ` +
            'cannot be ruled out without registry.npmjs.org or the GitHub Latest release',
        ),
      );
    }
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
// The Prod validation stage runs this script, and the Lockbox stage must wait for it.
const PROD_VALIDATION_SCRIPT = 'tools/releases/powershell-commands/validate-prod-build.ps1';
const PROD_VALIDATION_STAGE = 'Prod_Validation';
const PROD_VALIDATION_JOB = 'Validate_CI_build';
const PROD_LOCKBOX_STAGE = 'Prod_Lockbox_Approval_Deployment';
// The SDF skip gate: the Check job's Decide step runs this script, and the Lockbox stage waits for it and runs a
// scheduled build only when the step's publish output is true. Manual runs skip the step and always publish.
const SDF_SKIP_SCRIPT = 'sdf-beta-schedule.js';
const SDF_SKIP_STAGE = 'Check_Skip';
const SDF_SKIP_JOB = 'Check';
const SDF_SKIP_STEP = 'Decide';
// The options the pipeline passes to the skip script. Its --now option is for local testing only.
const SDF_SKIP_OPTIONS = new Set([
  '--reason',
  '--npm-feed',
  '--alias',
  '--source-branch',
  '--run-id',
  '--run-name',
  '--commit',
]);
// pipelineTasks records a task key whose value is on or continued onto another line as this, which matches no
// accepted value.
const UNREADABLE_VALUE = '\u0000unreadable';
const UNSET_VALUE = '\u0000unset';
// The Lockbox stage condition, in either order of its or() branches, as normalizeExpression writes it.
const SDF_MANUAL_BRANCH = "ne(variables['build.reason'],'schedule')";
const SDF_PUBLISH_BRANCH = "eq(dependencies.check_skip.outputs['check.decide.publish'],'true')";
const SDF_LOCKBOX_CONDITIONS = [
  `and(succeeded(),or(${SDF_MANUAL_BRANCH},${SDF_PUBLISH_BRANCH}))`,
  `and(succeeded(),or(${SDF_PUBLISH_BRANCH},${SDF_MANUAL_BRANCH}))`,
];
const SDF_LOCKBOX_CONDITION_TEXT =
  "and(succeeded(), or(ne(variables['Build.Reason'], 'Schedule'), " +
  "eq(dependencies.Check_Skip.outputs['Check.Decide.publish'], 'true')))";

// Drops a YAML comment: a # at the line start or after whitespace, outside a quoted scalar.
function stripYamlComment(line) {
  let quote = null;
  for (let index = 0; index < line.length; index++) {
    const character = line[index];
    if (quote) {
      if (character === quote) {
        quote = null;
      }
    } else if ((character === "'" || character === '"') && (index === 0 || /[\s:\-[{,]/.test(line[index - 1]))) {
      quote = character;
    } else if (character === '#' && (index === 0 || /\s/.test(line[index - 1]))) {
      return line.slice(0, index);
    }
  }
  return line;
}

function yamlScalar(value) {
  const trimmed = value.trim();
  const quoted = /^(['"])(.*)\1$/.exec(trimmed);
  return quoted ? quoted[2] : trimmed;
}

// Blanks the contents of YAML block scalars (`script: |`, `>-` and the like), which are text, not pipeline steps.
function withoutBlockScalars(lines) {
  let blockIndent = -1;
  return lines.map((line) => {
    const indent = line.length - line.trimStart().length;
    if (blockIndent >= 0) {
      if (line.trim() === '' || indent > blockIndent) {
        return '';
      }
      blockIndent = -1;
    }
    if (/:[ \t]*[|>][+-]?\d*[+-]?[ \t]*$/.test(line)) {
      blockIndent = indent;
    }
    return line;
  });
}

// The `- task: Name@N` items in a pipeline YAML, ignoring comments and block scalars, with the
// properties the checks read and its raw lines. A task with `enabled: false` is not active. `condition`,
// `continueOnError` and `name` are read only as the task's own keys, at the indent of `task:`.
function pipelineTasks(text) {
  const raw = text.split(/\r?\n/);
  const lines = withoutBlockScalars(raw.map(stripYamlComment));
  const tasks = [];
  for (let index = 0; index < lines.length; index++) {
    const header = /^(([ \t]*)-[ \t]*)task:[ \t]*(['"]?)([\w.-]+)@(\d+)\3[ \t]*$/.exec(lines[index]);
    if (!header) {
      continue;
    }
    const indent = header[2].length;
    const keyIndent = header[1].length;
    const task = {
      name: header[4],
      version: Number(header[5]),
      enabled: true,
      displayName: '',
      filePath: '',
      productState: [],
      stepName: '',
      condition: '',
      continueOnError: '',
      lines: [],
    };
    let end = index + 1;
    for (; end < lines.length; end++) {
      const next = end;
      const line = lines[next];
      if (line.trim() === '') {
        continue;
      }
      const lineIndent = line.length - line.trimStart().length;
      if (lineIndent <= indent) {
        break;
      }
      const property = /^[ \t]*(['"]?)([\w.]+)\1[ \t]*:[ \t]*(.*)$/.exec(line);
      if (!property) {
        continue;
      }
      const [, , key, value] = property;
      const own = lineIndent === keyIndent;
      // A task's own scalar key has no children, so a deeper line after it puts or continues its value on another line,
      // which the checks don't read; record that as a value no check accepts. A key with no value is null, the default.
      let after = end + 1;
      while (after < lines.length && lines[after].trim() === '') {
        after++;
      }
      const continued = after < lines.length && lines[after].length - lines[after].trimStart().length > lineIndent;
      const scalar = continued ? UNREADABLE_VALUE : yamlScalar(value);
      if (key === 'name' && own) {
        task.stepName = yamlScalar(value);
      } else if (key === 'condition' && own) {
        task.condition = scalar;
      } else if (key === 'continueOnError' && own) {
        task.continueOnError = scalar;
      } else if (key === 'enabled' && /^false$/i.test(yamlScalar(value))) {
        task.enabled = false;
      } else if (key === 'displayName') {
        task.displayName = yamlScalar(value);
      } else if (key === 'filePath') {
        task.filePath = yamlScalar(value);
      } else if (key.toLowerCase() === 'productstate') {
        task.productState.push(yamlScalar(value));
      }
    }
    task.lines = raw.slice(index, end);
    tasks.push(task);
  }
  return tasks;
}

// The stage names a `- stage: <name>` item lists under its own `dependsOn` key (not a job's), as an inline value, a
// flow list or a block list, ignoring comments and block scalars. Undefined when the stage is not declared.
function stageDependsOn(text, stage) {
  const lines = withoutBlockScalars(text.split(/\r?\n/).map(stripYamlComment));
  let keyIndent = -1;
  const start = lines.findIndex((line) => {
    const header = /^([ \t]*-[ \t]*)stage:[ \t]*(.+?)[ \t]*$/.exec(line);
    if (header && yamlScalar(header[2]) === stage) {
      keyIndent = header[1].length;
      return true;
    }
    return false;
  });
  if (start === -1) {
    return undefined;
  }
  const stageIndent = lines[start].length - lines[start].trimStart().length;
  const names = [];
  for (let index = start + 1; index < lines.length; index++) {
    const line = lines[index];
    if (line.trim() === '') {
      continue;
    }
    const indent = line.length - line.trimStart().length;
    if (indent <= stageIndent) {
      break;
    }
    const property = /^[ \t]*dependsOn:[ \t]*(.*)$/.exec(line);
    // Only the stage mapping's own keys sit at the indent of `stage:`; deeper ones belong to jobs.
    if (!property || indent !== keyIndent) {
      continue;
    }
    const value = property[1].trim();
    if (value.startsWith('[')) {
      names.push(
        ...value
          .replace(/^\[|\]$/g, '')
          .split(',')
          .map(yamlScalar)
          .filter(Boolean),
      );
    } else if (value) {
      names.push(yamlScalar(value));
    } else {
      for (let next = index + 1; next < lines.length; next++) {
        const item = /^([ \t]*)-[ \t]*(.+?)[ \t]*$/.exec(lines[next]);
        if (lines[next].trim() === '') {
          continue;
        }
        // YAML allows the items of a block list at the same indent as its key.
        if (!item || item[1].length < indent) {
          break;
        }
        names.push(yamlScalar(item[2]));
      }
    }
    break;
  }
  return names;
}

// The lines of a `- <kind>: <name>` item (a stage or a job), up to the next line at or below its indent, ignoring
// comments and block scalars. Empty when the item is not declared.
function itemText(text, kind, name) {
  const raw = text.split(/\r?\n/);
  const lines = withoutBlockScalars(raw.map(stripYamlComment));
  const start = lines.findIndex((line) => {
    const header = new RegExp(`^[ \\t]*-[ \\t]*${kind}:[ \\t]*(.+?)[ \\t]*$`).exec(line);
    return header && yamlScalar(header[1]) === name;
  });
  if (start === -1) {
    return '';
  }
  const itemIndent = lines[start].length - lines[start].trimStart().length;
  let end = start + 1;
  while (
    end < lines.length &&
    (lines[end].trim() === '' || lines[end].length - lines[end].trimStart().length > itemIndent)
  ) {
    end++;
  }
  return raw.slice(start, end).join('\n');
}

function stageText(text, stage) {
  return itemText(text, 'stage', stage);
}

// The value of a `- <kind>: <name>` item's own property (a stage's or a job's), not a nested job's or step's, ignoring
// comments and block scalars. Undefined when the item or the property is not declared, and empty when the value is on
// another line.
function itemProperty(text, kind, name, key) {
  const lines = withoutBlockScalars(text.split(/\r?\n/).map(stripYamlComment));
  const start = lines.findIndex((line) => {
    const header = new RegExp(`^[ \\t]*-[ \\t]*${kind}:[ \\t]*(.+?)[ \\t]*$`).exec(line);
    return header && yamlScalar(header[1]) === name;
  });
  if (start === -1) {
    return undefined;
  }
  const itemIndent = lines[start].length - lines[start].trimStart().length;
  const propertyIndent = lines[start].indexOf(`${kind}:`);
  for (let index = start + 1; index < lines.length; index++) {
    const line = lines[index];
    if (line.trim() === '') {
      continue;
    }
    const indent = line.length - line.trimStart().length;
    if (indent <= itemIndent) {
      break;
    }
    const property = /^[ \t]*(['"]?)([\w.]+)\1[ \t]*:[ \t]*(.*)$/.exec(line);
    if (property && indent === propertyIndent && property[2] === key) {
      return yamlScalar(property[3]);
    }
  }
  return undefined;
}

function stageProperty(text, stage, key) {
  return itemProperty(text, 'stage', stage, key);
}

// The inline script of a PowerShell@2 task written in the one shape the check supports, or undefined. The task's own
// keys are only name, displayName, condition, inputs and env, each once and unquoted; inputs holds only targetType
// (inline), script, pwsh and workingDirectory, each once. Scalars can't continue on another line, and env is not read.
const DECIDE_TASK_KEYS = new Set(['name', 'displayName', 'condition', 'inputs', 'env']);
const DECIDE_INPUT_KEYS = new Set(['targetType', 'script', 'pwsh', 'workingDirectory']);
function inlineScript(task) {
  if (task.name !== 'PowerShell' || task.version !== 2) {
    return undefined;
  }
  const raw = task.lines;
  const indentOf = (line) => line.length - line.trimStart().length;
  const keyIndent = /^[ \t]*-[ \t]*/.exec(raw[0])[0].length;
  const seen = new Set();
  let inputs;
  for (let index = 1; index < raw.length; ) {
    const line = stripYamlComment(raw[index]);
    if (line.trim() === '') {
      index++;
      continue;
    }
    const property = /^[ \t]*([\w.]+):(?:[ \t]+(.*))?$/.exec(line);
    if (indentOf(line) !== keyIndent || !property || seen.has(property[1]) || !DECIDE_TASK_KEYS.has(property[1])) {
      return undefined;
    }
    seen.add(property[1]);
    const value = (property[2] || '').trim();
    index++;
    if (property[1] === 'inputs' || property[1] === 'env') {
      const start = index;
      while (index < raw.length && (raw[index].trim() === '' || indentOf(raw[index]) > keyIndent)) {
        index++;
      }
      if (value !== '') {
        return undefined;
      }
      if (property[1] === 'inputs') {
        inputs = scriptInput(raw.slice(start, index));
        if (!inputs) {
          return undefined;
        }
      }
    } else if (value === '' || /^[|>]/.test(value)) {
      return undefined;
    }
  }
  return inputs;
}

function scriptInput(block) {
  const indentOf = (line) => line.length - line.trimStart().length;
  const first = block.find((line) => line.trim() !== '');
  if (first === undefined) {
    return undefined;
  }
  const childIndent = indentOf(first);
  const seen = new Set();
  let script;
  for (let index = 0; index < block.length; ) {
    const line = stripYamlComment(block[index]);
    if (line.trim() === '') {
      index++;
      continue;
    }
    const property = /^[ \t]*([\w.]+):(?:[ \t]+(.*))?$/.exec(line);
    if (indentOf(line) !== childIndent || !property || seen.has(property[1]) || !DECIDE_INPUT_KEYS.has(property[1])) {
      return undefined;
    }
    seen.add(property[1]);
    const value = (property[2] || '').trim();
    index++;
    if (property[1] === 'script' && /^[|>][+-]?$/.test(value)) {
      const start = index;
      while (index < block.length && (block[index].trim() === '' || indentOf(block[index]) > childIndent)) {
        index++;
      }
      script = { text: block.slice(start, index).join('\n'), style: value[0] };
    } else if (value === '' || /^['"|>[{&*!%@`]/.test(value)) {
      return undefined;
    } else if (property[1] === 'script') {
      script = { text: value, style: '' };
    } else if (property[1] === 'targetType' && value !== 'inline') {
      return undefined;
    }
  }
  return seen.has('targetType') ? script : undefined;
}

// The one command a step's script runs, or undefined when the script is anything else: an inline value, a one-line
// literal block, or a folded block whose lines share one indent with no blank line between them.
function scriptCommand(task) {
  const script = inlineScript(task);
  if (!script) {
    return undefined;
  }
  if (script.style === '') {
    return script.text;
  }
  const lines = script.text.split('\n');
  while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
    lines.pop();
  }
  while (lines.length > 0 && lines[0].trim() === '') {
    lines.shift();
  }
  const indents = new Set(lines.map((line) => line.length - line.trimStart().length));
  if (lines.some((line) => line.trim() === '') || indents.size !== 1) {
    return undefined;
  }
  if (script.style === '|' && lines.length !== 1) {
    return undefined;
  }
  return lines.map((line) => line.trim()).join(' ');
}

// The words of a command written as plain words, single-quoted strings, double-quoted strings without $ or `, and
// $(Variable) macros; undefined for anything else, such as a second command, a comment, a pipe or a redirect.
function commandWords(command) {
  const word = /\s*(?:'([^']*)'|"([^"$`]*)"|((?:[\w.\-/\\=:]|\$\([\w.-]+\))+))(?=\s|$)/y;
  const words = [];
  while (command.slice(word.lastIndex).trim() !== '') {
    const match = word.exec(command);
    if (!match) {
      return undefined;
    }
    words.push(match[1] ?? match[2] ?? match[3]);
  }
  return words;
}

// Whether the step runs `node <path>/sdf-beta-schedule.js` with exactly one --reason of $(Build.Reason) or Schedule,
// and the non-empty --npm-feed and --alias a scheduled run needs. The script reads its options in pairs, treats a
// missing or other reason as a manual run, which always publishes, and throws on a scheduled run without --npm-feed or
// --alias.
function runsSkipRule(task) {
  const command = scriptCommand(task);
  const words = command === undefined ? undefined : commandWords(command);
  if (!words || words.length < 2 || !/^node(\.exe)?$/i.test(words[0])) {
    return false;
  }
  if (words[1].startsWith('-') || words[1].split(/[\\/]/).pop() !== SDF_SKIP_SCRIPT) {
    return false;
  }
  // Only the options the pipeline passes, each once; --now would replace the date the skip rule reads.
  const options = new Map();
  for (let index = 2; index < words.length; index += 2) {
    if (!SDF_SKIP_OPTIONS.has(words[index]) || options.has(words[index]) || words[index + 1] === undefined) {
      return false;
    }
    options.set(words[index], words[index + 1]);
  }
  return (
    ['$(Build.Reason)', 'Schedule'].includes(options.get('--reason')) &&
    Boolean(options.get('--npm-feed')) &&
    Boolean(options.get('--alias'))
  );
}

// The Decide step may run on every build, after success, or on scheduled builds only.
const DECIDE_CONDITIONS = new Set([
  UNSET_VALUE,
  'succeeded()',
  "eq(variables['build.reason'],'schedule')",
  "and(succeeded(),eq(variables['build.reason'],'schedule'))",
]);
function decideRunsOnSchedule(task) {
  return DECIDE_CONDITIONS.has(task.condition === '' ? UNSET_VALUE : normalizeExpression(task.condition));
}

// A pipeline expression with whitespace outside string literals removed, double quotes made single and case folded,
// which Azure Pipelines ignores in function names and string comparisons.
function normalizeExpression(expression) {
  let normalized = '';
  let quote = null;
  for (const character of expression) {
    if (quote) {
      normalized += character === quote ? "'" : character;
      if (character === quote) {
        quote = null;
      }
    } else if (character === "'" || character === '"') {
      quote = character;
      normalized += "'";
    } else if (!/\s/.test(character)) {
      normalized += character;
    }
  }
  return normalized.toLowerCase();
}

function checkSdfSkipGate(file, text) {
  // The step that sets the publish output must be the one that runs the script, in the job the condition names.
  const job = itemText(stageText(text, SDF_SKIP_STAGE), 'job', SDF_SKIP_JOB);
  const gateOk = pipelineTasks(job).some(
    (task) => task.enabled && task.stepName === SDF_SKIP_STEP && decideRunsOnSchedule(task) && runsSkipRule(task),
  );
  const lockboxDependsOn = stageDependsOn(text, PROD_LOCKBOX_STAGE) || [];
  const condition = stageProperty(text, PROD_LOCKBOX_STAGE, 'condition') || '';
  const conditionOk = SDF_LOCKBOX_CONDITIONS.includes(normalizeExpression(condition));
  return [
    result(
      gateOk ? Outcome.pass : Outcome.fail,
      gateOk
        ? `${file} has the ${SDF_SKIP_STAGE} stage with the ${SDF_SKIP_JOB}.${SDF_SKIP_STEP} step running ${SDF_SKIP_SCRIPT}`
        : `${file} has no ${SDF_SKIP_STAGE} stage with an enabled ${SDF_SKIP_JOB}.${SDF_SKIP_STEP} step running ` +
            `${SDF_SKIP_SCRIPT}, so a scheduled run that should skip still asks for the Lockbox approval`,
    ),
    result(
      lockboxDependsOn.includes(SDF_SKIP_STAGE) ? Outcome.pass : Outcome.fail,
      `${file} ${PROD_LOCKBOX_STAGE} depends on [${lockboxDependsOn.join(', ')}], expected ${SDF_SKIP_STAGE}`,
    ),
    result(
      conditionOk ? Outcome.pass : Outcome.fail,
      conditionOk
        ? `${file} ${PROD_LOCKBOX_STAGE} runs manual builds, and scheduled builds only when ${SDF_SKIP_STAGE} says publish`
        : `${file} ${PROD_LOCKBOX_STAGE} condition is ${condition || '(none)'}, expected ${SDF_LOCKBOX_CONDITION_TEXT} ` +
            'so that manual builds run, and scheduled builds only when the skip rule says publish',
    ),
  ];
}

// A job or stage condition that leaves the default, so the item runs only when everything before it succeeded.
function runsOnlyAfterSuccess(condition) {
  return condition === undefined || normalizeExpression(condition) === 'succeeded()';
}

function checkProdValidation(file, text) {
  // A condition can skip the task and continueOnError lets it fail, and either way its job still succeeds. The same
  // holds for the job's own condition and continueOnError, and a Lockbox stage condition can ignore the result.
  const job = itemText(stageText(text, PROD_VALIDATION_STAGE), 'job', PROD_VALIDATION_JOB);
  const validation = pipelineTasks(job).some(
    (task) =>
      task.enabled &&
      task.name === 'PowerShell' &&
      task.filePath === PROD_VALIDATION_SCRIPT &&
      (task.continueOnError === '' || /^false$/i.test(task.continueOnError)) &&
      (task.condition === '' || normalizeExpression(task.condition) === 'succeeded()'),
  );
  const stageDeclared = stageDependsOn(text, PROD_VALIDATION_STAGE) !== undefined;
  const jobCondition = itemProperty(job, 'job', PROD_VALIDATION_JOB, 'condition');
  const jobContinueOnError = itemProperty(job, 'job', PROD_VALIDATION_JOB, 'continueOnError');
  const jobOk =
    runsOnlyAfterSuccess(jobCondition) && (jobContinueOnError === undefined || /^false$/i.test(jobContinueOnError));
  const lockboxDependsOn = stageDependsOn(text, PROD_LOCKBOX_STAGE) || [];
  const lockboxCondition = stageProperty(text, PROD_LOCKBOX_STAGE, 'condition');
  const lockboxConditionOk = runsOnlyAfterSuccess(lockboxCondition);
  return [
    result(
      validation && stageDeclared ? Outcome.pass : Outcome.fail,
      validation && stageDeclared
        ? `${file} has the ${PROD_VALIDATION_STAGE} stage running ${PROD_VALIDATION_SCRIPT}`
        : `${file} has no ${PROD_VALIDATION_STAGE} stage whose ${PROD_VALIDATION_JOB} job has an enabled task running ` +
            `${PROD_VALIDATION_SCRIPT} with no condition other than succeeded() and no continueOnError, so a wrong CI ` +
            'build is caught only after the Lockbox approval',
    ),
    result(
      jobOk ? Outcome.pass : Outcome.fail,
      jobOk
        ? `${file} ${PROD_VALIDATION_JOB} fails when the validation fails`
        : `${file} ${PROD_VALIDATION_JOB} has condition ${jobCondition ?? '(none)'} and continueOnError ` +
            `${jobContinueOnError ?? '(none)'}, expected no condition other than succeeded() and no continueOnError, ` +
            'so that a failed validation stops the Lockbox stage',
    ),
    result(
      lockboxDependsOn.includes(PROD_VALIDATION_STAGE) ? Outcome.pass : Outcome.fail,
      `${file} ${PROD_LOCKBOX_STAGE} depends on [${lockboxDependsOn.join(', ')}], expected ${PROD_VALIDATION_STAGE}`,
    ),
    result(
      lockboxConditionOk ? Outcome.pass : Outcome.fail,
      lockboxConditionOk
        ? `${file} ${PROD_LOCKBOX_STAGE} runs only after its dependencies succeed`
        : `${file} ${PROD_LOCKBOX_STAGE} condition is ${lockboxCondition || '(on another line)'}, expected none or ` +
            'succeeded(), so that it never runs after a failed validation',
    ),
  ];
}

function checkPipelineConfig({ repoRoot, readFile }) {
  const results = [];
  for (const { file, npmTag, productState } of PIPELINE_FILES) {
    const text = readFile(path.join(repoRoot, file), 'utf8');
    const tasks = pipelineTasks(text).filter((task) => task.enabled);
    if (file === PIPELINE_FILES[0].file) {
      results.push(...checkProdValidation(file, text));
    } else if (file === PIPELINE_FILES[1].file) {
      results.push(...checkSdfSkipGate(file, text));
    }
    const retention = tasks.filter((task) => task.name === 'AssetRetention').map((task) => task.version);
    const old = retention.filter((taskVersion) => taskVersion < MINIMUM_ASSET_RETENTION_VERSION);
    if (retention.length === 0) {
      results.push(
        result(Outcome.fail, `${file} has no enabled AssetRetention task, so artifact retention is not configured`),
      );
    } else {
      results.push(
        result(
          old.length === 0 ? Outcome.pass : Outcome.fail,
          old.length === 0
            ? `${file} uses AssetRetention@${retention.join(', @')}`
            : `${file} uses AssetRetention@${old.join(', @')}, which runs on end-of-life Node 16; use @6 or later`,
        ),
      );
    }
    if (npmTag) {
      const publish = tasks.filter((task) => task.name === 'EsrpRelease');
      if (publish.length === 0) {
        results.push(result(Outcome.fail, `${file} has no enabled EsrpRelease task, so nothing publishes to npm`));
        continue;
      }
      const tags = publish.map((task) => /Publish to npm \(tag (\w+)\)/.exec(task.displayName)?.[1] ?? '(none)');
      const states = publish.flatMap((task) => (task.productState.length > 0 ? task.productState : ['(none)']));
      const tagOk = tags.every((found) => found === npmTag);
      const stateOk = states.every((found) => found === productState);
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
const CHANGELOG_TITLE = '# Change Log - @microsoft/teams-js';
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
  let afterBlank = false;
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith('## ')) {
      break;
    }
    if (line.startsWith('- ')) {
      current = [line.slice(2)];
      entries.push(current);
      afterBlank = false;
    } else if (line.trim() === '') {
      // A blank line can separate paragraphs of one entry; beachball indents the paragraphs that follow it.
      afterBlank = true;
    } else if (current && !line.trim().startsWith('#') && (!afterBlank || /^\s/.test(line))) {
      current.push(line);
      afterBlank = false;
    } else {
      current = undefined;
      afterBlank = false;
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
  let deleted;
  try {
    deleted = listDeletedChangeFiles(prepCommit, repoRoot);
  } catch (error) {
    const detail = String(error?.stderr || error?.message || error)
      .trim()
      .split(/\r?\n/)[0];
    return [result(Outcome.unreachable, `cannot read the prep commit ${prepCommit} (${detail}); check the SHA`)];
  }
  // beachball's bump deletes every change file it consumes, so a prep commit that deleted none is the wrong commit:
  // a typo that names another commit, or a merge commit, whose combined diff lists no deletions.
  if (deleted.length === 0) {
    return [
      result(
        Outcome.unreachable,
        `the prep commit ${prepCommit} deleted no change files, but a prep commit always does; pass the prep PR's ` +
          'squash commit, not a merge commit',
      ),
    ];
  }
  const deletedByPrep = new Set(deleted);
  const changeFiles = readDirectory(path.join(repoRoot, CHANGE_DIRECTORY)).filter((name) => name.endsWith('.json'));
  const results = [];
  for (const name of changeFiles) {
    const relativePath = `${CHANGE_DIRECTORY}/${name}`;
    let changeFile;
    try {
      changeFile = readLocalJson(readFile, path.join(repoRoot, CHANGE_DIRECTORY, name), relativePath);
    } catch (error) {
      if (!(error instanceof LocalFileError)) {
        throw error;
      }
      results.push(result(Outcome.fail, `${error.message}; beachball cannot read it either`));
      continue;
    }
    if (!changeFile || typeof changeFile !== 'object' || typeof changeFile.comment !== 'string') {
      results.push(
        result(Outcome.fail, `${relativePath} is not a beachball change file (no string comment); fix or delete it`),
      );
      continue;
    }
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
            `the prep commit ${prepCommit} did not delete it` +
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
          ` or was consumed by ${prepCommit}`,
      ),
    ];
  }
  return results;
}

// Each link kind by exact host and path; the query and fragment are not part of the version. The announcement is for
// Prod, so only the Prod CDN host counts.
const ANNOUNCEMENT_LINKS = [
  {
    name: 'npm',
    hosts: ['www.npmjs.com', 'npmjs.com'],
    path: /^\/package\/@microsoft\/teams-js\/v\/([^/]+)\/?$/,
    required: true,
  },
  { name: 'CDN', hosts: ['res.cdn.office.net'], path: /^\/teams-js\/([^/]+)\/js\//, required: true },
  {
    name: 'GitHub release',
    hosts: ['github.com'],
    path: /^\/OfficeDev\/microsoft-teams-library-js\/releases\/tag\/v([^/]+)\/?$/i,
    required: false,
  },
];

function announcementLinkVersion(url, { hosts, path: pathPattern }) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }
  if (!hosts.includes(parsed.hostname.toLowerCase())) {
    return undefined;
  }
  return pathPattern.exec(parsed.pathname)?.[1];
}

function checkAnnouncement({ version, text }) {
  const urls = text.match(/https?:\/\/[^\s"'<>)\]]+/g) || [];
  const results = [];
  for (const link of ANNOUNCEMENT_LINKS) {
    const { name, required } = link;
    const versions = urls.map((url) => announcementLinkVersion(url, link)).filter(Boolean);
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
  if (!body.value.replace(/^\uFEFF/, '').startsWith(CHANGELOG_TITLE)) {
    return [
      result(
        Outcome.unreachable,
        `main CHANGELOG ${url} returned HTTP 200 but not the CHANGELOG. This is not evidence either way.`,
      ),
    ];
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
    return {
      problem: (await isOriginNotFound(response, url))
        ? result(Outcome.fail, `CDN ${url} returned HTTP 404`)
        : notFromOrigin('CDN', url),
    };
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
  const origins = live.json?.validOrigins;
  if (!Array.isArray(origins) || !origins.every((origin) => typeof origin === 'string')) {
    return [
      result(
        Outcome.unreachable,
        `valid domains: ${url} did not return a validOrigins list of strings. This is not evidence either way.`,
      ),
    ];
  }
  const source = readLocalJson(readFile, path.join(repoRoot, VALID_DOMAINS_SOURCE), VALID_DOMAINS_SOURCE);
  if (!source || !Array.isArray(source.validOrigins) || !source.validOrigins.every((o) => typeof o === 'string')) {
    return [result(Outcome.fail, `${VALID_DOMAINS_SOURCE} has no validOrigins list of strings`)];
  }
  if (JSON.stringify(live.json) === JSON.stringify(source)) {
    return [result(Outcome.pass, `valid domains ${url} equals ${VALID_DOMAINS_SOURCE}`)];
  }
  const liveOrigins = new Set(origins);
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

// The change types this repository's beachball.config.js allows, highest bump first. It disallows major and
// prerelease, so beachball's bump rejects a change file of either type; a release never makes them.
const CHANGE_TYPES = ['minor', 'patch', 'none'];
const DISALLOWED_CHANGE_TYPES = ['major', 'prerelease'];
const DEPENDENT_CHANGE_TYPES = ['major', 'minor', 'patch', 'prerelease', 'none'];
const MAIN_CI_WORKFLOW = 'main.yml';

function mainCiRunsUrl() {
  return (
    `${GITHUB_API}/repos/${REPOSITORY}/actions/workflows/${MAIN_CI_WORKFLOW}/runs` +
    '?branch=main&event=push&status=completed&per_page=1'
  );
}

// Why a parsed change file is not one beachball would count for a teams-js bump, or undefined when it is.
function changeFileProblem(changeFile) {
  if (!changeFile || typeof changeFile !== 'object' || Array.isArray(changeFile)) {
    return 'is not a beachball change file (not a JSON object)';
  }
  if (Object.prototype.hasOwnProperty.call(changeFile, 'changes')) {
    return 'is a grouped change file, which this check does not read; check it by hand';
  }
  const { type, packageName, comment, dependentChangeType } = changeFile;
  if (typeof type === 'string' && DISALLOWED_CHANGE_TYPES.includes(type)) {
    return `has type ${type}, which beachball.config.js disallows, so beachball's bump rejects it`;
  }
  if (typeof type !== 'string' || !CHANGE_TYPES.includes(type)) {
    return `has no change type a release uses (${CHANGE_TYPES.join(', ')})`;
  }
  if (packageName !== PACKAGE_NAME) {
    return `is for package ${typeof packageName === 'string' ? packageName : '(none)'}, not ${PACKAGE_NAME}`;
  }
  if (typeof comment !== 'string' || comment.trim() === '') {
    return 'has no comment for the CHANGELOG';
  }
  if (typeof dependentChangeType !== 'string' || !DEPENDENT_CHANGE_TYPES.includes(dependentChangeType)) {
    return 'has no valid dependentChangeType';
  }
  return undefined;
}

function readPendingChanges({ repoRoot, readFile, readDirectory }) {
  let names;
  try {
    names = readDirectory(path.join(repoRoot, CHANGE_DIRECTORY));
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      names = [];
    } else {
      throw error;
    }
  }
  const counts = Object.create(null);
  const problems = [];
  for (const name of names.filter((file) => file.endsWith('.json')).sort()) {
    const relativePath = `${CHANGE_DIRECTORY}/${name}`;
    let changeFile;
    try {
      changeFile = readLocalJson(readFile, path.join(repoRoot, CHANGE_DIRECTORY, name), relativePath);
    } catch (error) {
      if (error instanceof LocalFileError) {
        problems.push(result(Outcome.fail, `${error.message}; beachball cannot read it either`));
        continue;
      }
      if (error && typeof error.code === 'string' && error.code !== 'ENOENT') {
        problems.push(result(Outcome.fail, `${relativePath} cannot be read as a file (${error.code})`));
        continue;
      }
      throw error;
    }
    const problem = changeFileProblem(changeFile);
    if (problem) {
      problems.push(result(Outcome.fail, `${relativePath} ${problem}`));
      continue;
    }
    counts[changeFile.type] = (counts[changeFile.type] || 0) + 1;
  }
  return { counts, problems };
}

function bumpVersion(version, type) {
  const [major, minor, patch] = parseVersion(version).core;
  return type === 'minor' ? `${major}.${minor + 1}.0` : `${major}.${minor}.${patch + 1}`;
}

function pendingChangesResults({ repoRoot, readFile, readDirectory }) {
  const { counts, problems } = readPendingChanges({ repoRoot, readFile, readDirectory });
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const results = [...problems];
  if (total === 0) {
    if (problems.length === 0) {
      results.push(result(Outcome.fail, `no pending change files in ${CHANGE_DIRECTORY}/, so nothing to release`));
    }
    return { results };
  }
  const summary = Object.keys(counts)
    .sort()
    .map((type) => `${type} ${counts[type]}`)
    .join(', ');
  const bump = CHANGE_TYPES.find((type) => type !== 'none' && counts[type]);
  if (!bump) {
    results.push(
      result(
        Outcome.fail,
        `${total} pending change ${total === 1 ? 'file' : 'files'} (${summary}), all type none, so nothing bumps the ` +
          'version; a leftover "Released x.y.z" file from the last merge-back is one of these',
      ),
    );
    return { results };
  }
  results.push(result(Outcome.pass, `${total} pending change ${total === 1 ? 'file' : 'files'} (${summary})`));
  const current = readLocalJson(readFile, path.join(repoRoot, PACKAGE_JSON_FILES[0]), PACKAGE_JSON_FILES[0])?.version;
  if (typeof current !== 'string' || !VERSION_PATTERN.test(current)) {
    results.push(result(Outcome.fail, `${PACKAGE_JSON_FILES[0]} has no semantic version`));
    return { results };
  }
  if (!/^\d+\.\d+\.\d+$/.test(current)) {
    results.push(
      result(
        Outcome.fail,
        `${PACKAGE_JSON_FILES[0]} is at the prerelease ${current}; a Prod pre-flight expects main's released version, ` +
          'and beachball bumps a prerelease differently',
      ),
    );
    return { results };
  }
  const next = bumpVersion(current, bump);
  results.push(
    result(Outcome.info, `the pending change files bump ${current} to ${next} (${bump}); preRelease.js makes the bump`),
  );
  return { results, next };
}

// registry.npmjs.org is always read: a --registry proxy only adds an informational line, so it never stands in for it.
async function npmTagsInfo({ registry, fetchImpl }) {
  const results = [await npmTagsFrom({ registry: DEFAULT_REGISTRY, fetchImpl })];
  if (registry !== DEFAULT_REGISTRY) {
    const proxy = await npmTagsFrom({ registry, fetchImpl });
    results.push(
      proxy.outcome === Outcome.info ? proxy : result(Outcome.info, `(proxy, informational) ${proxy.message}`),
    );
  }
  return results;
}

async function npmTagsFrom({ registry, fetchImpl }) {
  const url = npmDistTagsUrl(registry);
  const answer = await readJson(fetchImpl, url, 'npm dist-tags');
  if (answer.problem) {
    return answer.problem;
  }
  const { latest, beta } = answer.json;
  if (typeof latest !== 'string' || !VERSION_PATTERN.test(latest)) {
    return result(Outcome.unreachable, `npm dist-tags: ${url} has no latest version. This is not evidence either way.`);
  }
  const betaText = typeof beta === 'string' && VERSION_PATTERN.test(beta) ? `, beta ${beta}` : '';
  return result(Outcome.info, `npm ${registry === DEFAULT_REGISTRY ? '' : '(proxy) '}latest ${latest}${betaText}`);
}

async function checkMainCi({ fetchImpl }) {
  const url = mainCiRunsUrl();
  const label = `GitHub Actions ${MAIN_CI_WORKFLOW} on main`;
  const answer = await readGithubJson(fetchImpl, url, label, {
    valid: (json) =>
      Array.isArray(json.workflow_runs) &&
      typeof json.workflow_runs[0]?.conclusion === 'string' &&
      typeof json.workflow_runs[0]?.html_url === 'string',
    fields: 'a completed run with a conclusion',
  });
  if (answer.problem) {
    return answer.problem;
  }
  const { conclusion, html_url: runUrl } = answer.json.workflow_runs[0];
  const internal = 'The internal CI build the release uses is not visible here; check it in the internal project.';
  return conclusion === 'success'
    ? result(Outcome.pass, `${label}: the latest completed run succeeded (${runUrl}). ${internal}`)
    : result(
        Outcome.fail,
        `${label}: the latest completed run ended ${conclusion} (${runUrl}); confirm it is known and unrelated. ` +
          internal,
      );
}

async function checkPreflight({ version, registry, repoRoot, readFile, readDirectory, fetchImpl }) {
  const changes = pendingChangesResults({ repoRoot, readFile, readDirectory });
  const results = [...changes.results, ...checkPipelineConfig({ repoRoot, readFile })];
  results.push(...(await npmTagsInfo({ registry, fetchImpl })));
  results.push(await checkMainCi({ fetchImpl }));
  if (version) {
    if (changes.next && changes.next !== version) {
      results.push(
        result(
          Outcome.fail,
          `--version ${version}, but the pending change files make ${changes.next}; recheck the plan`,
        ),
      );
    }
    results.push(...(await checkVersionIsFree({ version, registry, fetchImpl })));
    const branch = `release/${version}`;
    // The git ref endpoint answers a missing branch with GitHub's own { "message": "Not Found" }; the branches
    // endpoint answers "Branch not found", which is not the not-found answer the origin rule accepts.
    results.push(
      await expectAbsent(
        fetchImpl,
        `${GITHUB_API}/repos/${REPOSITORY}/git/ref/heads/${branch}`,
        `Branch ${branch}`,
        'so check whether it is stale before reusing it (see failure-modes.md)',
      ),
    );
  }
  results.push(
    result(
      Outcome.info,
      'not checked here: Lockbox eligibility, an approver and a backup, the internal CI build, the release work item ' +
        'and the content freeze',
    ),
  );
  return results;
}

// The date line beachball writes under each version heading, e.g. "Wed, 04 Nov 2026 19:13:09 GMT".
const RELEASE_DATE_LINE = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d{2} [A-Z][a-z]{2} \d{4}( \d{2}:\d{2}:\d{2} GMT)?\s*$/;
// A CHANGELOG version heading at column 0, such as "## 2.59.0" or "## 2.60.0-beta.0".
const VERSION_HEADING = /^## \d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?\s*$/;

function changelogSection(changelog, version) {
  const lines = changelog.split(/\r?\n/);
  // Headings start at column 0; an indented line is part of an entry, never a heading.
  const start = lines.findIndex((line) => line.replace(/\s+$/, '') === `## ${version}`);
  if (start === -1) {
    return undefined;
  }
  const groups = [];
  let orphans = 0;
  const strayHeadings = [];
  const looseText = [];
  let group;
  let entry;
  for (const line of lines.slice(start + 1)) {
    // Only a version heading ends the section; another ## heading (say, in a multiline comment) is a stray heading.
    if (VERSION_HEADING.test(line)) {
      break;
    }
    if (line.startsWith('### ')) {
      group = { heading: line.slice(4).trim(), entries: [] };
      groups.push(group);
      entry = undefined;
    } else if (line.startsWith('- ')) {
      if (!group) {
        orphans += 1;
        entry = undefined;
        continue;
      }
      entry = [line.slice(2)];
      group.entries.push(entry);
    } else if (line.trim() === '') {
      continue;
    } else if (line.startsWith('#')) {
      // A heading other than ## and ### at column 0 would end the entry and drop what follows it.
      strayHeadings.push(line.trim());
      entry = undefined;
    } else if (entry) {
      // beachball writes a comment verbatim after "- ", so a later paragraph of it starts at column 0.
      entry.push(line);
    } else if (group || !RELEASE_DATE_LINE.test(line)) {
      looseText.push(line.trim());
    }
  }
  return {
    orphans,
    strayHeadings,
    looseText,
    groups: groups
      .map(({ heading, entries }) => ({ heading, entries: entries.map((lines) => normalizeText(lines.join(' '))) }))
      .filter(({ entries }) => entries.length > 0),
  };
}

function draftAnnouncement({ version, repoRoot, readFile }) {
  const section = changelogSection(readFile(path.join(repoRoot, CHANGELOG_PATH), 'utf8'), version);
  if (!section) {
    return [
      result(
        Outcome.fail,
        `${CHANGELOG_PATH} has no "## ${version}" section; run this on release/${version} after the prep PR merges`,
      ),
    ];
  }
  const { groups, orphans, strayHeadings, looseText } = section;
  if (strayHeadings.length > 0) {
    return [
      result(
        Outcome.fail,
        `the "## ${version}" section of ${CHANGELOG_PATH} has headings other than ### at the start of a line ` +
          `(${strayHeadings.join(', ')}); fix the CHANGELOG rather than announce part of it`,
      ),
    ];
  }
  if (looseText.length > 0) {
    return [
      result(
        Outcome.fail,
        `the "## ${version}" section of ${CHANGELOG_PATH} has text that belongs to no entry ` +
          `(${looseText.join(' / ')}); fix the CHANGELOG rather than announce part of it`,
      ),
    ];
  }
  if (orphans > 0) {
    return [
      result(
        Outcome.fail,
        `the "## ${version}" section of ${CHANGELOG_PATH} has ${orphans} ${orphans === 1 ? 'entry' : 'entries'} before ` +
          'its first ### heading; fix the CHANGELOG rather than announce part of it',
      ),
    ];
  }
  if (groups.length === 0) {
    return [result(Outcome.fail, `the "## ${version}" section of ${CHANGELOG_PATH} has no entries to announce`)];
  }
  const links = publicLinks(version);
  const text = [
    `TeamsJS v${version} Release`,
    '',
    `teams-js v${version} has been released to npm and CDN.`,
    '',
    `npm: ${links.npm}`,
    `CDN: ${links.cdn}`,
    `GitHub release: ${links.githubRelease}`,
    ...groups.flatMap(({ heading, entries }) => ['', heading, ...entries.map((entry) => `- ${entry}`)]),
  ].join('\n');
  return [
    result(
      Outcome.info,
      'announcement draft (subject first; tag the contacts the internal runbook names before sending):\n' + text,
    ),
    ...checkAnnouncement({ version, text }),
  ];
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const options = Object.create(null);
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
  preflight: {
    flags: ['version', 'registry'],
    optional: ['version', 'registry'],
    checkout: true,
    summary:
      'Step 1: pending change files and the version they make, release YAML, npm reachability, GitHub CI on main; ' +
      'with --version, also check-version and that release/<v> does not exist',
    run: async (options, deps) => {
      const version = options.version === undefined ? undefined : requireVersion(options);
      if (version && !/^\d+\.\d+\.\d+$/.test(version)) {
        throw new UsageError('preflight --version is the Prod version to release, such as 2.60.0, not a beta');
      }
      return checkPreflight({ version, registry: requireRegistry(options), ...deps });
    },
  },
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
    summary:
      "the checkout's release YAML: Prod validation stage before Lockbox, Prod tag latest, SDF skip gate before Lockbox, SDF tag beta, AssetRetention@6 or later",
    run: async (options, { repoRoot, readFile }) => checkPipelineConfig({ repoRoot, readFile }),
  },
  'consumed-changes': {
    flags: ['version', 'prep-commit'],
    checkout: true,
    summary: 'on the merge-back branch, no pending change file was already consumed by the release',
    run: async (options, deps) => {
      const prepCommit = options['prep-commit'];
      if (prepCommit === undefined) {
        throw new UsageError(
          '--prep-commit <prep PR squash commit> is required: without it a consumed change file re-added with an ' +
            'edited comment passes',
        );
      }
      if (!/^[0-9a-f]{7,40}$/i.test(prepCommit)) {
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
  'announcement-draft': {
    flags: ['version'],
    checkout: true,
    summary: "prints a Prod announcement draft from the checkout's CHANGELOG section and runs the announcement check",
    run: async (options, { repoRoot, readFile }) => {
      const version = requireVersion(options);
      if (!/^\d+\.\d+\.\d+$/.test(version)) {
        throw new UsageError('announcement-draft is for Prod releases, such as 2.60.0; betas are never announced');
      }
      return draftAnnouncement({ version, repoRoot, readFile });
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
    if (error instanceof LocalFileError) {
      log(`FAIL ${error.message}`);
      return ExitCode.failed;
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
