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

  links: async (options) =>
    Object.entries(publicLinks(requireVersion(options))).map(([name, url]) => result(Outcome.info, `${name} ${url}`)),

  sri: async (options, { readFile }) => {
    if (!options.file) {
      throw new UsageError('sri needs --file <path>');
    }
    return [result(Outcome.info, `${computeSri(readFile(options.file))} ${options.file}`)];
  },
};

async function run(argv, { repoRoot, fetchImpl = globalThis.fetch, readFile = fs.readFileSync, log = console.log }) {
  let results;
  try {
    const { command, options } = parseArgs(argv);
    if (!Object.prototype.hasOwnProperty.call(commands, command)) {
      throw new UsageError(`Command must be one of: ${Object.keys(commands).join(', ')}`);
    }
    results = await commands[command](options, { repoRoot, fetchImpl, readFile });
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
