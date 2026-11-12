'use strict';

// Run with: node --test .github/skills/release-teamsjs/check-release.test.js
const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { afterEach, beforeEach, describe, it } = require('node:test');

const {
  ExitCode,
  carrierIntegrity,
  cdnScriptUrl,
  computeSri,
  publicLinks,
  readCarriers,
  resolveRepoRoot,
  run,
  validDomainsUrl,
} = require('./check-release');

const VERSION = '2.59.0';
const BUNDLE = Buffer.from('console.log("teams-js bundle");');
const BUNDLE_SRI = computeSri(BUNDLE);
const DOMAINS = { validOrigins: ['teams.microsoft.com', '*.teams.microsoft.com'] };

function writeRepo(
  root,
  { version = VERSION, integrity = BUNDLE_SRI, htmlIntegrity = integrity, readmeExtra = '', htmlExtra = '' } = {},
) {
  const write = (relativePath, contents) => {
    fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
    fs.writeFileSync(path.join(root, relativePath), contents);
  };
  write('packages/teams-js/package.json', JSON.stringify({ name: '@microsoft/teams-js', version }));
  write('apps/teams-test-app/package.json', JSON.stringify({ name: 'teams-test-app', version }));
  write(
    'packages/teams-js/README.md',
    [
      `[from here](https://res.cdn.office.net/teams-js/${version}/js/MicrosoftTeams.min.js)`,
      '<script',
      `  src="https://res.cdn.office.net/teams-js/${version}/js/MicrosoftTeams.min.js"`,
      ...(integrity === null ? [] : [`  integrity="${integrity}"`]),
      '  crossorigin="anonymous"',
      '></script>',
      `<script src="node_modules/@microsoft/teams-js@${version}/dist/MicrosoftTeams.min.js"></script>`,
      readmeExtra,
    ].join('\n'),
  );
  write(
    'apps/teams-test-app/index_cdn.html',
    [
      '<script',
      `  src="https://res.cdn.office.net/teams-js/${version}/js/MicrosoftTeams.min.js"`,
      ...(htmlIntegrity === null ? [] : [`  integrity="${htmlIntegrity}"`]),
      '  crossorigin="anonymous"',
      '></script>',
      htmlExtra,
    ].join('\n'),
  );
  write('packages/teams-js/src/artifactsForCDN/validDomains.json', JSON.stringify(DOMAINS));
}

function response(status, body) {
  const bytes = Buffer.isBuffer(body)
    ? body
    : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body ?? {}));
  return {
    status,
    arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    json: async () => JSON.parse(bytes.toString('utf8')),
    text: async () => bytes.toString('utf8'),
  };
}

const throwingFetch = async (url) => {
  throw new Error(`unexpected network request in a test: ${url}`);
};

const NPM = 'https://registry.npmjs.org';
const PROXY = 'https://proxy.example/npm';
const JSDELIVR = 'https://data.jsdelivr.com/v1/packages/npm/@microsoft/teams-js';
const unpkg = (spec) => `https://unpkg.com/@microsoft/teams-js@${spec}/package.json`;
const registryVersion = (registry, version) => `${registry}/@microsoft%2fteams-js/${version}`;
const registryTags = (registry) => `${registry}/-/package/@microsoft%2fteams-js/dist-tags`;

function registryRoutes(registry, { versions = [], tags = {} }) {
  const routes = { [registryTags(registry)]: response(200, tags) };
  for (const version of versions) {
    routes[registryVersion(registry, version)] = response(200, { version });
  }
  return routes;
}

function jsdelivrRoutes({ versions = [], tags = {} }) {
  return { [JSDELIVR]: response(200, { type: 'npm', tags, versions: versions.map((version) => ({ version })) }) };
}

function unreachable(...urls) {
  return Object.fromEntries(urls.map((url) => [url, new Error('TLS alert 40')]));
}

// The 404 each origin really sends for a missing path (observed Nov 7 2026): Azure Blob XML for the CDN, JSON for
// GitHub's API and the npm registry.
const BLOB_NOT_FOUND =
  '\uFEFF<?xml version="1.0" encoding="utf-8"?><Error><Code>BlobNotFound</Code>' +
  '<Message>The specified blob does not exist.</Message></Error>';
const HTML_404 = '<!DOCTYPE html><html><body><h1>Not Found</h1><p>Proxy error page</p></body></html>';
// The npm registry's own 404 bodies, per the registry's published OpenAPI description: a JSON string for a missing
// version, an { error } object for a missing package.
function originNotFound(url) {
  const { hostname, pathname } = new URL(url);
  if (hostname === 'res.cdn.office.net' || hostname === 'res-sdf.cdn.office.net') {
    return response(404, BLOB_NOT_FOUND);
  }
  if (hostname === 'registry.npmjs.org') {
    return response(
      404,
      pathname.split('/').length > 2 ? `"version not found: ${pathname.split('/').pop()}"` : { error: 'Not found' },
    );
  }
  return response(404, { message: 'Not Found' });
}

function fakeFetch(routes) {
  const requested = [];
  const options = [];
  const fetchImpl = async (url, init) => {
    requested.push(url);
    options.push(init);
    const route = routes[url];
    if (route instanceof Error) {
      throw route;
    }
    return route ?? originNotFound(url);
  };
  return { fetchImpl, requested, options };
}

const GITHUB_REPO_API = 'https://api.github.com/repos/OfficeDev/microsoft-teams-library-js';
const MAIN_CHANGELOG =
  'https://raw.githubusercontent.com/OfficeDev/microsoft-teams-library-js/main/packages/teams-js/CHANGELOG.md';

function githubRoutes({
  version = VERSION,
  prerelease,
  draft = false,
  tagVersion = version,
  latestTag = 'v2.58.0',
  tagSha = 'a'.repeat(40),
  branchSha = tagSha,
  annotatedTarget,
}) {
  const routes = {};
  if (prerelease !== undefined) {
    routes[`${GITHUB_REPO_API}/releases/tags/v${version}`] = response(200, {
      tag_name: `v${version}`,
      prerelease,
      draft,
    });
  }
  if (tagVersion) {
    const packageJson = Buffer.from(JSON.stringify({ version: tagVersion })).toString('base64');
    routes[`${GITHUB_REPO_API}/contents/packages/teams-js/package.json?ref=v${version}`] = response(200, {
      encoding: 'base64',
      content: packageJson,
    });
  }
  if (latestTag) {
    routes[`${GITHUB_REPO_API}/releases/latest`] = response(200, { tag_name: latestTag });
  }
  routes[`${GITHUB_REPO_API}/git/ref/tags/v${version}`] = response(200, {
    object: { type: annotatedTarget ? 'tag' : 'commit', sha: tagSha },
  });
  if (annotatedTarget) {
    routes[`${GITHUB_REPO_API}/git/tags/${tagSha}`] = response(200, {
      object: { type: 'commit', sha: annotatedTarget },
    });
  }
  routes[`${GITHUB_REPO_API}/git/ref/heads/release/${version}`] = response(200, { object: { sha: branchSha } });
  return routes;
}

function stalledBody(status = 200) {
  const stall = async () => {
    const error = new Error('The operation was aborted due to timeout');
    error.name = 'TimeoutError';
    throw error;
  };
  return { status, arrayBuffer: stall, json: stall, text: stall };
}

function writeArtifact(root, folderVersion, bytes) {
  const file = path.join(root, 'download', 'CDNFeed', folderVersion, 'js', 'MicrosoftTeams.min.js');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, bytes);
  return file;
}

function writeCleanup(root, { changelog, changeFiles }) {
  fs.mkdirSync(path.join(root, 'packages', 'teams-js'), { recursive: true });
  fs.writeFileSync(path.join(root, 'packages', 'teams-js', 'CHANGELOG.md'), changelog);
  fs.mkdirSync(path.join(root, 'change'), { recursive: true });
  for (const [name, comment, type = 'minor'] of changeFiles) {
    const changeFile = { type, comment, packageName: '@microsoft/teams-js', dependentChangeType: 'patch' };
    fs.writeFileSync(path.join(root, 'change', name), JSON.stringify(changeFile, null, 2));
  }
}

const RELEASED_CHANGELOG = [
  '# Change Log - @microsoft/teams-js',
  '',
  `## ${VERSION}`,
  '',
  'Wed, 04 Nov 2026 21:21:53 GMT',
  '',
  '### Minor changes',
  '',
  '- Added `clipboard.read` permission APIs.',
  '- Added `localNetworkAccess` permission APIs.',
  '',
  '### Patches',
  '',
  '- Added Copilot Studio origins to the valid-origins artifact.',
  '',
  '## 2.58.0',
  '',
  '- Added `stageView.self.isCloseResultSupported`.',
  '',
].join('\n');

// The Prod validation stage as prod-release.yml declares it, and the Lockbox stage's dependency on it.
const PROD_VALIDATION = [
  '      - stage: Prod_Validation',
  '        dependsOn: []',
  '        jobs:',
  '          - job: Validate_CI_build',
  '            steps:',
  '              - task: PowerShell@2',
  '                displayName: Check the pinned CI build',
  '                inputs:',
  "                  targetType: 'filePath'",
  "                  filePath: 'tools/releases/powershell-commands/validate-prod-build.ps1'",
].join('\n');
const LOCKBOX_DEPENDS_ON = ['        dependsOn:', '          - Prod_Validation'].join('\n');
// The SDF skip gate as sdf-release.yml declares it, and the Lockbox stage's dependency on it and condition.
const SDF_SKIP_GATE = [
  '      - stage: Check_Skip',
  '        dependsOn: []',
  '        jobs:',
  '          - job: Check',
  '            steps:',
  '              - task: PowerShell@2',
  '                name: Decide',
  '                displayName: Apply the skip rule',
  "                condition: eq(variables['Build.Reason'], 'Schedule')",
  '                inputs:',
  '                  targetType: inline',
  '                  script: >-',
  "                    node '$(Pipeline.Workspace)/scripts/sdf-beta-schedule.js'",
  "                    --reason '$(Build.Reason)'",
  '                env:',
  '                  SYSTEM_ACCESSTOKEN: $(System.AccessToken)',
].join('\n');
const SDF_LOCKBOX_DEPENDS_ON = '        dependsOn: Check_Skip';
const SDF_LOCKBOX_CONDITION =
  "        condition: and(succeeded(), or(ne(variables['Build.Reason'], 'Schedule'), " +
  "eq(dependencies.Check_Skip.outputs['Check.Decide.publish'], 'true')))";
function writePipelineConfig(
  root,
  {
    prodTag = 'latest',
    prodState = 'Latest',
    retention = 6,
    validation = PROD_VALIDATION,
    lockboxDependsOn = LOCKBOX_DEPENDS_ON,
    sdfSkipGate = SDF_SKIP_GATE,
    sdfLockboxDependsOn = SDF_LOCKBOX_DEPENDS_ON,
    sdfLockboxCondition = SDF_LOCKBOX_CONDITION,
  } = {},
) {
  const write = (relativePath, contents) => {
    fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
    fs.writeFileSync(path.join(root, relativePath), contents);
  };
  const publish = (tag, state) =>
    [
      `              - task: AssetRetention@${retention}`,
      `              - task: EsrpRelease@10`,
      `                displayName: Publish to npm (tag ${tag}) - ESRP release`,
      `                inputs:`,
      `                  productstate: '${state}'`,
    ].join('\n');
  write(
    'tools/releases/prod-release.yml',
    [
      '    stages:',
      validation,
      '      - stage: Prod_Lockbox_Approval_Deployment',
      '        displayName: Lockbox Approval/Deployment',
      lockboxDependsOn,
      '        jobs:',
      '          - job: Agent_job',
      '            steps:',
      publish(prodTag, prodState),
    ].join('\n'),
  );
  write(
    'tools/releases/sdf-release.yml',
    [
      '    stages:',
      sdfSkipGate,
      '      - stage: Prod_Lockbox_Approval_Deployment',
      '        displayName: Lockbox Approval/Deployment',
      sdfLockboxDependsOn,
      sdfLockboxCondition,
      '        jobs:',
      '          - job: Agent_job',
      '            steps:',
      publish('beta', 'Beta'),
    ].join('\n'),
  );
  write('tools/releases/ddl-release.yml', `              - task: AssetRetention@${retention}`);
  write('tools/yaml-templates/security.yml', `  - task: AssetRetention@${retention}`);
}

describe('check-release', () => {
  let root;
  let lines;
  let env;
  const log = (line) => lines.push(line);
  let listDeletedChangeFiles;
  const runWith = (argv, fetchImpl = throwingFetch) =>
    run(argv, { repoRoot: root, fetchImpl, log, env, listDeletedChangeFiles });

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'release-teamsjs-'));
    lines = [];
    env = {};
    listDeletedChangeFiles = () => ['@microsoft-teams-js-shipped.json'];
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  describe('computeSri', () => {
    it('matches the sha384 SRI format browsers check', () => {
      assert.match(BUNDLE_SRI, /^sha384-[A-Za-z0-9+/]{64}$/);
      const emptySri = 'sha384-OLBgp1GsljhM2TJ+sbHjaiH9txEUvgdDTAzHv2P24donTt6/529l+9Ua0vFImLlb';
      assert.equal(computeSri(Buffer.from('')), emptySri);
    });
  });

  describe('carriers', () => {
    it('passes when every carrier names the version and shares one hash', async () => {
      writeRepo(root);
      assert.equal(await runWith(['carriers', '--version', VERSION]), ExitCode.passed);
    });

    for (const [name, value] of [
      ['a short digest', 'sha384-abc'],
      ['a padded digest', `${BUNDLE_SRI}=`],
      ['a 65-character digest', `${BUNDLE_SRI}A`],
    ]) {
      it(`fails for ${name}, which cannot be a sha384 SRI`, async () => {
        writeRepo(root, { integrity: value });
        assert.equal(await runWith(['carriers', '--version', VERSION]), ExitCode.failed, lines.join('\n'));
      });
    }

    it('fails when the CDN script has no integrity, even if another element carries the hash', async () => {
      const elsewhere = `<link rel="preload" href="other.js" as="script" integrity="${BUNDLE_SRI}">`;
      writeRepo(root, { integrity: null, readmeExtra: elsewhere });
      assert.equal(await runWith(['carriers', '--version', VERSION]), ExitCode.failed, lines.join('\n'));
      assert.ok(
        lines.some((line) => line.startsWith('FAIL packages/teams-js/README.md') && line.includes('integrity')),
        lines.join('\n'),
      );
    });

    it('fails when a second teams-js CDN script in a carrier has no integrity', async () => {
      const second = `<script src="https://res.cdn.office.net/teams-js/${VERSION}/js/MicrosoftTeams.min.js"></script>`;
      writeRepo(root, { readmeExtra: second });
      assert.equal(await runWith(['carriers', '--version', VERSION]), ExitCode.failed, lines.join('\n'));
    });

    it('reads an upper-case SCRIPT tag and attributes', async () => {
      writeRepo(root);
      const html = path.join(root, 'apps/teams-test-app/index_cdn.html');
      fs.writeFileSync(
        html,
        fs
          .readFileSync(html, 'utf8')
          .replace('<script', '<SCRIPT')
          .replace('  src=', '  SRC=')
          .replace('  integrity=', '  INTEGRITY='),
      );
      assert.equal(await runWith(['carriers', '--version', VERSION]), ExitCode.passed, lines.join('\n'));
    });

    it('does not take data-integrity for the integrity attribute', async () => {
      writeRepo(root);
      const html = path.join(root, 'apps/teams-test-app/index_cdn.html');
      fs.writeFileSync(html, fs.readFileSync(html, 'utf8').replace('  integrity=', '  data-integrity='));
      assert.equal(await runWith(['carriers', '--version', VERSION]), ExitCode.failed, lines.join('\n'));
    });

    it('does not take data-src for the CDN script source', async () => {
      writeRepo(root);
      const html = path.join(root, 'apps/teams-test-app/index_cdn.html');
      fs.writeFileSync(html, fs.readFileSync(html, 'utf8').replace('  src=', '  data-src='));
      assert.equal(await runWith(['carriers', '--version', VERSION]), ExitCode.failed, lines.join('\n'));
    });

    it('ignores the integrity of other scripts in a carrier', async () => {
      const other = '<script src="https://cdn.example/other.js" integrity="sha384-' + 'B'.repeat(64) + '"></script>';
      writeRepo(root, { htmlExtra: other });
      assert.equal(await runWith(['carriers', '--version', VERSION]), ExitCode.passed, lines.join('\n'));
      assert.ok(
        lines.every((line) => line.startsWith('PASS')),
        lines.join('\n'),
      );
      assert.equal(carrierIntegrity(readCarriers(root)), BUNDLE_SRI);
    });

    it('fails when the carriers still name the previous version', async () => {
      writeRepo(root, { version: '2.58.0' });
      assert.equal(await runWith(['carriers', '--version', VERSION]), ExitCode.failed);
      assert.ok(lines.some((line) => line.startsWith('FAIL packages/teams-js/package.json version is 2.58.0')));
    });

    it('fails when the README and test app disagree on the hash', async () => {
      writeRepo(root, { htmlIntegrity: computeSri(Buffer.from('other')) });
      assert.equal(await runWith(['carriers', '--version', VERSION]), ExitCode.failed);
      assert.ok(lines.includes('FAIL carriers share one integrity hash (found 2)'));
      assert.equal(carrierIntegrity(readCarriers(root)), undefined);
    });

    it('fails when an integrity attribute is not sha384', async () => {
      writeRepo(root, { integrity: 'sha256-abc', htmlIntegrity: 'sha256-abc' });
      assert.equal(await runWith(['carriers', '--version', VERSION]), ExitCode.failed);
    });
  });

  describe('artifact', () => {
    it('passes when the CI bundle hashes to the carrier SRI', async () => {
      writeRepo(root);
      const file = writeArtifact(root, VERSION, BUNDLE);
      assert.equal(
        await runWith(['artifact', '--version', VERSION, '--file', file]),
        ExitCode.passed,
        lines.join('\n'),
      );
    });

    it('passes for a relative CDNFeed path given from the download folder', async () => {
      writeRepo(root);
      writeArtifact(root, VERSION, BUNDLE);
      const previous = process.cwd();
      process.chdir(path.join(root, 'download'));
      try {
        const relative = `CDNFeed/${VERSION}/js/MicrosoftTeams.min.js`;
        assert.equal(
          await runWith(['artifact', '--version', VERSION, '--file', relative]),
          ExitCode.passed,
          lines.join('\n'),
        );
      } finally {
        process.chdir(previous);
      }
    });

    it('fails when the CI bundle differs from the bundle the carriers were built from', async () => {
      writeRepo(root);
      const file = writeArtifact(root, VERSION, Buffer.from('a different build'));
      assert.equal(await runWith(['artifact', '--version', VERSION, '--file', file]), ExitCode.failed);
    });

    it('fails when the bundle is not in a CDNFeed folder named for the version (a stale CI run)', async () => {
      writeRepo(root);
      const file = writeArtifact(root, '2.58.0', BUNDLE);
      assert.equal(await runWith(['artifact', '--version', VERSION, '--file', file]), ExitCode.failed);
      assert.ok(
        lines.some((line) => line.startsWith('FAIL') && line.includes('CDNFeed')),
        lines.join('\n'),
      );
    });

    it('ignores _manifest but fails when CDNFeed holds more than one version folder', async () => {
      writeRepo(root);
      const file = writeArtifact(root, VERSION, BUNDLE);
      fs.mkdirSync(path.join(root, 'download', 'CDNFeed', '_manifest'));
      assert.equal(
        await runWith(['artifact', '--version', VERSION, '--file', file]),
        ExitCode.passed,
        lines.join('\n'),
      );
      writeArtifact(root, '2.58.0', BUNDLE);
      lines = [];
      assert.equal(await runWith(['artifact', '--version', VERSION, '--file', file]), ExitCode.failed);
      assert.ok(
        lines.some((line) => line.startsWith('FAIL') && line.includes('2.58.0')),
        lines.join('\n'),
      );
    });

    it('requires --file', async () => {
      writeRepo(root);
      assert.equal(await runWith(['artifact', '--version', VERSION]), ExitCode.usage);
    });
  });

  describe('check-version', () => {
    it('passes only when npm, the Prod CDN and the GitHub tag are all absent', async () => {
      const { fetchImpl, requested } = fakeFetch({});
      assert.equal(await runWith(['check-version', '--version', VERSION], fetchImpl), ExitCode.passed);
      for (const url of [
        registryVersion(NPM, VERSION),
        cdnScriptUrl(VERSION, 'prod'),
        `https://api.github.com/repos/OfficeDev/microsoft-teams-library-js/git/ref/tags/v${VERSION}`,
      ]) {
        assert.ok(requested.includes(url), url);
      }
    });

    it('fails when a mirror already lists the version, even if the registry says 404', async () => {
      const { fetchImpl } = fakeFetch(jsdelivrRoutes({ versions: [VERSION], tags: { latest: VERSION } }));
      assert.equal(await runWith(['check-version', '--version', VERSION], fetchImpl), ExitCode.failed);
    });

    it('is inconclusive when only a proxy says the version is absent', async () => {
      const { fetchImpl } = fakeFetch(unreachable(registryVersion(NPM, VERSION), registryTags(NPM)));
      const argv = ['check-version', '--version', VERSION, '--registry', PROXY];
      assert.equal(await runWith(argv, fetchImpl), ExitCode.unreachable, lines.join('\n'));
    });

    it('treats a registry.npmjs.org server error as inconclusive, never as free', async () => {
      const { fetchImpl } = fakeFetch({ [registryVersion(NPM, VERSION)]: response(503) });
      assert.equal(await runWith(['check-version', '--version', VERSION], fetchImpl), ExitCode.unreachable);
    });

    for (const [name, body] of [
      ['an empty object', {}],
      ['another version', { version: '2.58.0' }],
    ]) {
      it(`treats a registry 200 with ${name} as inconclusive, never as free`, async () => {
        const { fetchImpl } = fakeFetch({ [registryVersion(NPM, VERSION)]: response(200, body) });
        assert.equal(await runWith(['check-version', '--version', VERSION], fetchImpl), ExitCode.unreachable);
        assert.ok(
          lines.some((line) => line.startsWith('UNREACHABLE npm')),
          lines.join('\n'),
        );
      });
    }

    it('fails when the version is already on the CDN', async () => {
      const { fetchImpl } = fakeFetch({ [cdnScriptUrl(VERSION, 'prod')]: response(200, BUNDLE) });
      assert.equal(await runWith(['check-version', '--version', VERSION], fetchImpl), ExitCode.failed);
    });

    it('treats a network error as inconclusive, never as free', async () => {
      const { fetchImpl } = fakeFetch({
        [`https://registry.npmjs.org/@microsoft%2fteams-js/${VERSION}`]: new Error('TLS handshake failed'),
      });
      assert.equal(await runWith(['check-version', '--version', VERSION], fetchImpl), ExitCode.unreachable);
      assert.ok(lines.some((line) => line.startsWith('UNREACHABLE npm')));
    });

    it('treats a rate limit as inconclusive', async () => {
      const { fetchImpl } = fakeFetch({
        [`https://api.github.com/repos/OfficeDev/microsoft-teams-library-js/git/ref/tags/v${VERSION}`]: response(403),
      });
      assert.equal(await runWith(['check-version', '--version', VERSION], fetchImpl), ExitCode.unreachable);
    });

    it('also asks an alternative https registry, without a trailing slash', async () => {
      const { fetchImpl, requested } = fakeFetch({});
      await runWith(['check-version', '--version', VERSION, '--registry', 'https://mirror.example/npm/'], fetchImpl);
      assert.ok(requested.includes(`https://mirror.example/npm/@microsoft%2fteams-js/${VERSION}`), requested.join());
    });

    it('rejects a non-https registry and a malformed version', async () => {
      assert.equal(
        await runWith(['check-version', '--version', VERSION, '--registry', 'http://mirror.example']),
        ExitCode.usage,
      );
      assert.equal(await runWith(['check-version', '--version', '2.59.0/../x']), ExitCode.usage);
    });
  });

  describe('published', () => {
    const npmRoutes = (version, tags) => ({
      [`https://registry.npmjs.org/@microsoft%2fteams-js/${version}`]: response(200, { version }),
      'https://registry.npmjs.org/-/package/@microsoft%2fteams-js/dist-tags': response(200, tags),
    });

    it('passes when the Prod CDN bytes match the carrier SRI and latest points at the version', async () => {
      writeRepo(root);
      const { fetchImpl } = fakeFetch({
        [cdnScriptUrl(VERSION, 'prod')]: response(200, BUNDLE),
        ...npmRoutes(VERSION, { latest: VERSION, beta: '2.59.0-beta.3' }),
      });
      assert.equal(await runWith(['published', '--version', VERSION, '--dist-tag', 'latest'], fetchImpl), 0);
    });

    it('fails when npm has the version but the CDN does not (half published)', async () => {
      writeRepo(root);
      const { fetchImpl } = fakeFetch(npmRoutes(VERSION, { latest: VERSION }));
      assert.equal(await runWith(['published', '--version', VERSION], fetchImpl), ExitCode.failed);
      assert.ok(lines.some((line) => line.startsWith('FAIL CDN') && line.includes('HTTP 404')));
    });

    it('fails when the CDN serves different bytes', async () => {
      writeRepo(root);
      const { fetchImpl } = fakeFetch({
        [cdnScriptUrl(VERSION, 'prod')]: response(200, Buffer.from('tampered')),
        ...npmRoutes(VERSION, { latest: VERSION }),
      });
      assert.equal(await runWith(['published', '--version', VERSION], fetchImpl), ExitCode.failed);
    });

    it('is inconclusive, not failed, when the registry answers 200 without the version', async () => {
      writeRepo(root);
      const { fetchImpl } = fakeFetch({
        [cdnScriptUrl(VERSION, 'prod')]: response(200, BUNDLE),
        [`https://registry.npmjs.org/@microsoft%2fteams-js/${VERSION}`]: response(200, {}),
      });
      assert.equal(await runWith(['published', '--version', VERSION], fetchImpl), ExitCode.unreachable);
      assert.ok(
        lines.some((line) => line.startsWith('UNREACHABLE npm')),
        lines.join('\n'),
      );
    });

    it('fails when latest still points at the previous version', async () => {
      writeRepo(root);
      const { fetchImpl } = fakeFetch({
        [cdnScriptUrl(VERSION, 'prod')]: response(200, BUNDLE),
        ...npmRoutes(VERSION, { latest: '2.58.0' }),
      });
      assert.equal(await runWith(['published', '--version', VERSION, '--dist-tag', 'latest'], fetchImpl), 1);
    });

    it('checks an SDF beta on the SDF CDN against an explicit SRI', async () => {
      const beta = '2.60.0-beta.0';
      const { fetchImpl, requested } = fakeFetch({
        [cdnScriptUrl(beta, 'sdf')]: response(200, BUNDLE),
        ...npmRoutes(beta, { latest: VERSION, beta }),
      });
      const argv = ['published', '--version', beta, '--environment', 'sdf', '--dist-tag', 'beta'];
      assert.equal(await runWith([...argv, '--expected-sri', BUNDLE_SRI], fetchImpl), ExitCode.passed);
      assert.equal(requested[0], `https://res-sdf.cdn.office.net/teams-js/${beta}/js/MicrosoftTeams.min.js`);
    });

    it('requires an explicit SRI for SDF', async () => {
      assert.equal(await runWith(['published', '--version', '2.60.0-beta.0', '--environment', 'sdf']), 2);
    });

    it('rejects an unknown environment', async () => {
      assert.equal(await runWith(['published', '--version', VERSION, '--environment', 'toString']), 2);
    });

    it('fails when the CDN has the version but registry.npmjs.org does not (half published)', async () => {
      writeRepo(root);
      const { fetchImpl } = fakeFetch({
        [cdnScriptUrl(VERSION, 'prod')]: response(200, BUNDLE),
        [registryTags(NPM)]: response(200, { latest: '2.58.0' }),
      });
      assert.equal(await runWith(['published', '--version', VERSION], fetchImpl), ExitCode.failed);
      assert.ok(
        lines.some((line) => line.startsWith('FAIL npm')),
        lines.join('\n'),
      );
    });

    it('is inconclusive, not failed, when only a lagging proxy answers', async () => {
      writeRepo(root);
      const { fetchImpl } = fakeFetch({
        [cdnScriptUrl(VERSION, 'prod')]: response(200, BUNDLE),
        ...unreachable(registryVersion(NPM, VERSION), registryTags(NPM)),
        ...registryRoutes(PROXY, { versions: [], tags: { latest: '2.58.0' } }),
      });
      const argv = ['published', '--version', VERSION, '--dist-tag', 'latest', '--registry', PROXY];
      assert.equal(await runWith(argv, fetchImpl), ExitCode.unreachable, lines.join('\n'));
    });

    it('never passes on a proxy-only read', async () => {
      writeRepo(root);
      const { fetchImpl } = fakeFetch({
        [cdnScriptUrl(VERSION, 'prod')]: response(200, BUNDLE),
        ...unreachable(registryVersion(NPM, VERSION), registryTags(NPM)),
        ...registryRoutes(PROXY, { versions: [VERSION], tags: { latest: VERSION } }),
      });
      const argv = ['published', '--version', VERSION, '--dist-tag', 'latest', '--registry', PROXY];
      assert.equal(await runWith(argv, fetchImpl), ExitCode.unreachable, lines.join('\n'));
    });

    it('confirms the version from public mirrors when registry.npmjs.org is unreachable, but not the dist-tag', async () => {
      writeRepo(root);
      const { fetchImpl } = fakeFetch({
        [cdnScriptUrl(VERSION, 'prod')]: response(200, BUNDLE),
        ...unreachable(registryVersion(NPM, VERSION), registryTags(NPM)),
        ...registryRoutes(PROXY, { versions: [], tags: { latest: '2.58.0' } }),
        ...jsdelivrRoutes({ versions: [VERSION], tags: { latest: VERSION } }),
        [unpkg(VERSION)]: response(200, { version: VERSION }),
        [unpkg('latest')]: response(200, { version: VERSION }),
      });
      const withoutTag = ['published', '--version', VERSION, '--registry', PROXY];
      assert.equal(await runWith(withoutTag, fetchImpl), ExitCode.passed, lines.join('\n'));
      lines = [];
      const argv = [...withoutTag, '--dist-tag', 'latest'];
      assert.equal(await runWith(argv, fetchImpl), ExitCode.unreachable, lines.join('\n'));
    });

    it('treats a CDN server error as inconclusive, not as missing', async () => {
      writeRepo(root);
      const { fetchImpl } = fakeFetch({
        [cdnScriptUrl(VERSION, 'prod')]: response(503),
        ...npmRoutes(VERSION, { latest: VERSION }),
      });
      assert.equal(await runWith(['published', '--version', VERSION], fetchImpl), ExitCode.unreachable);
    });

    it('treats a non-JSON registry answer as inconclusive instead of crashing', async () => {
      writeRepo(root);
      const { fetchImpl } = fakeFetch({
        [cdnScriptUrl(VERSION, 'prod')]: response(200, BUNDLE),
        [registryVersion(NPM, VERSION)]: response(200, '<html>proxy login</html>'),
        [registryTags(NPM)]: response(200, '<html>proxy login</html>'),
      });
      const code = await runWith(['published', '--version', VERSION, '--dist-tag', 'latest'], fetchImpl);
      assert.equal(code, ExitCode.unreachable, lines.join('\n'));
    });

    describe('npm source rules', () => {
      const publishedArgv = (...extra) => ['published', '--version', VERSION, ...extra];
      const cdnOk = () => ({ [cdnScriptUrl(VERSION, 'prod')]: response(200, BUNDLE) });
      const npmUnreachable = () => unreachable(registryVersion(NPM, VERSION), registryTags(NPM));

      it('a proxy alone never confirms the version', async () => {
        writeRepo(root);
        const { fetchImpl } = fakeFetch({
          ...cdnOk(),
          ...npmUnreachable(),
          ...registryRoutes(PROXY, { versions: [VERSION] }),
        });
        assert.equal(
          await runWith(publishedArgv('--registry', PROXY), fetchImpl),
          ExitCode.unreachable,
          lines.join('\n'),
        );
      });

      it('a proxy alone never confirms a dist-tag, even when mirrors confirm the version', async () => {
        writeRepo(root);
        const { fetchImpl } = fakeFetch({
          ...cdnOk(),
          ...npmUnreachable(),
          ...registryRoutes(PROXY, { versions: [VERSION], tags: { latest: VERSION } }),
          ...jsdelivrRoutes({ versions: [VERSION] }),
        });
        const argv = publishedArgv('--dist-tag', 'latest', '--registry', PROXY);
        assert.equal(await runWith(argv, fetchImpl), ExitCode.unreachable, lines.join('\n'));
        assert.ok(
          lines.some((line) => line.startsWith('UNREACHABLE npm dist-tag latest')),
          lines.join('\n'),
        );
      });

      it('a stale mirror latest is inconclusive, not a pass', async () => {
        writeRepo(root);
        const { fetchImpl } = fakeFetch({
          ...cdnOk(),
          ...npmUnreachable(),
          ...jsdelivrRoutes({ versions: [VERSION], tags: { latest: '2.58.0' } }),
          [unpkg('latest')]: response(200, { version: '2.58.0' }),
        });
        const code = await runWith(publishedArgv('--dist-tag', 'latest'), fetchImpl);
        assert.equal(code, ExitCode.unreachable, lines.join('\n'));
      });

      it('a mirror latest equal to the version is inconclusive, because npm latest may have moved on since', async () => {
        writeRepo(root);
        const { fetchImpl } = fakeFetch({
          ...cdnOk(),
          ...npmUnreachable(),
          ...jsdelivrRoutes({ versions: [VERSION], tags: { latest: VERSION } }),
          [unpkg(VERSION)]: response(200, { version: VERSION }),
          [unpkg('latest')]: response(200, { version: VERSION }),
        });
        const code = await runWith(publishedArgv('--dist-tag', 'latest'), fetchImpl);
        assert.equal(code, ExitCode.unreachable, lines.join('\n'));
        assert.ok(
          lines.some((line) => line.startsWith('PASS npm: 2.59.0 is published')),
          lines.join('\n'),
        );
        assert.ok(
          lines.some((line) => line.startsWith('UNREACHABLE npm dist-tag latest')),
          lines.join('\n'),
        );
      });

      it('a proxy latest alone never decides a dist-tag, even when it is newer', async () => {
        writeRepo(root);
        const { fetchImpl } = fakeFetch({
          ...cdnOk(),
          ...npmUnreachable(),
          ...registryRoutes(PROXY, { versions: [VERSION], tags: { latest: '2.60.0' } }),
          ...jsdelivrRoutes({ versions: [VERSION] }),
        });
        const argv = publishedArgv('--dist-tag', 'latest', '--registry', PROXY);
        assert.equal(await runWith(argv, fetchImpl), ExitCode.unreachable, lines.join('\n'));
      });

      it('a mirror latest newer than the version fails', async () => {
        writeRepo(root);
        const { fetchImpl } = fakeFetch({
          ...cdnOk(),
          ...npmUnreachable(),
          ...jsdelivrRoutes({ versions: [VERSION], tags: { latest: '2.60.0' } }),
        });
        assert.equal(
          await runWith(publishedArgv('--dist-tag', 'latest'), fetchImpl),
          ExitCode.failed,
          lines.join('\n'),
        );
      });

      it('registry.npmjs.org 404 while a mirror lists the version is a disagreement, not a pass', async () => {
        writeRepo(root);
        const { fetchImpl } = fakeFetch({ ...cdnOk(), ...jsdelivrRoutes({ versions: [VERSION] }) });
        assert.equal(await runWith(publishedArgv(), fetchImpl), ExitCode.unreachable, lines.join('\n'));
        assert.ok(
          lines.some((line) => line.includes('disagree')),
          lines.join('\n'),
        );
      });

      it('registry.npmjs.org answering 200 with a different version is inconclusive, not absence', async () => {
        writeRepo(root);
        const { fetchImpl } = fakeFetch({
          ...cdnOk(),
          [registryVersion(NPM, VERSION)]: response(200, { version: '2.58.0' }),
        });
        assert.equal(await runWith(publishedArgv(), fetchImpl), ExitCode.unreachable, lines.join('\n'));
      });

      it('a JSON answer that is not an object is inconclusive', async () => {
        writeRepo(root);
        const { fetchImpl } = fakeFetch({
          ...cdnOk(),
          [registryVersion(NPM, VERSION)]: response(200, { version: VERSION }),
          [registryTags(NPM)]: response(200, '"latest"'),
        });
        const code = await runWith(publishedArgv('--dist-tag', 'latest'), fetchImpl);
        assert.equal(code, ExitCode.unreachable, lines.join('\n'));
        lines = [];
        const nullVersion = fakeFetch({ ...cdnOk(), [registryVersion(NPM, VERSION)]: response(200, 'null') });
        assert.equal(await runWith(publishedArgv(), nullVersion.fetchImpl), ExitCode.unreachable, lines.join('\n'));
      });
    });
  });

  describe('domains', () => {
    it('passes when the live list equals the source', async () => {
      writeRepo(root);
      const { fetchImpl } = fakeFetch({ [validDomainsUrl('prod')]: response(200, DOMAINS) });
      assert.equal(await runWith(['domains'], fetchImpl), ExitCode.passed);
    });

    it('fails when the live list differs and names the differing origins', async () => {
      writeRepo(root);
      const live = { validOrigins: ['teams.microsoft.com', 'old.example.com'] };
      const { fetchImpl } = fakeFetch({ [validDomainsUrl('prod')]: response(200, live) });
      assert.equal(await runWith(['domains'], fetchImpl), ExitCode.failed);
      assert.match(lines[0], /missing live: \[\*\.teams\.microsoft\.com\], only live: \[old\.example\.com\]/);
    });

    for (const live of [
      { validOrigins: 5 },
      { validOrigins: {} },
      { validOrigins: 'teams.microsoft.com' },
      { validOrigins: ['teams.microsoft.com', 7] },
      { other: [] },
      [],
    ]) {
      it(`is inconclusive, not a crash or a diff, for a live payload of ${JSON.stringify(live)}`, async () => {
        writeRepo(root);
        const { fetchImpl } = fakeFetch({ [validDomainsUrl('prod')]: response(200, live) });
        assert.equal(await runWith(['domains'], fetchImpl), ExitCode.unreachable, lines.join('\n'));
        assert.ok(
          lines.some((line) => line.startsWith('UNREACHABLE') && line.includes('validOrigins')),
          lines.join('\n'),
        );
      });
    }

    it('only checks the Prod list; the SDF list is never refreshed by a DDL run', async () => {
      writeRepo(root);
      assert.equal(await runWith(['domains', '--environment', 'sdf']), ExitCode.usage);
    });
  });

  describe('github-release', () => {
    for (const [name, tagName] of [
      ['another release', 'v2.58.0'],
      ['no tag_name', undefined],
      ['an array tag_name', [`v${VERSION}`]],
    ]) {
      it(`is inconclusive when the release by tag returns ${name}`, async () => {
        const routes = githubRoutes({ prerelease: true });
        routes[`${GITHUB_REPO_API}/releases/tags/v${VERSION}`] = response(200, {
          tag_name: tagName,
          prerelease: true,
          draft: false,
        });
        const { fetchImpl } = fakeFetch(routes);
        const argv = ['github-release', '--version', VERSION, '--expect', 'prerelease'];
        assert.equal(await runWith(argv, fetchImpl), ExitCode.unreachable, lines.join('\n'));
      });
    }

    it('passes for a pre-release whose tag carries the bump', async () => {
      const { fetchImpl } = fakeFetch(githubRoutes({ prerelease: true }));
      const argv = ['github-release', '--version', VERSION, '--expect', 'prerelease'];
      assert.equal(await runWith(argv, fetchImpl), ExitCode.passed, lines.join('\n'));
    });

    it('fails when the tag was cut before the bump landed', async () => {
      const { fetchImpl } = fakeFetch(githubRoutes({ prerelease: true, tagVersion: '2.58.0' }));
      const argv = ['github-release', '--version', VERSION, '--expect', 'prerelease'];
      assert.equal(await runWith(argv, fetchImpl), ExitCode.failed);
      assert.ok(
        lines.some((line) => line.startsWith('FAIL') && line.includes('2.58.0')),
        lines.join('\n'),
      );
    });

    it('fails when there is no release, or only a draft', async () => {
      const argv = ['github-release', '--version', VERSION, '--expect', 'prerelease'];
      assert.equal(await runWith(argv, fakeFetch({}).fetchImpl), ExitCode.failed);
      const draft = fakeFetch(githubRoutes({ prerelease: true, draft: true }));
      assert.equal(await runWith(argv, draft.fetchImpl), ExitCode.failed);
    });

    it('passes Latest only when promoted and marked latest', async () => {
      const argv = ['github-release', '--version', VERSION, '--expect', 'latest'];
      const promoted = fakeFetch(githubRoutes({ prerelease: false, latestTag: `v${VERSION}` }));
      assert.equal(await runWith(argv, promoted.fetchImpl), ExitCode.passed, lines.join('\n'));
    });

    it('fails Latest while still a pre-release', async () => {
      const argv = ['github-release', '--version', VERSION, '--expect', 'latest'];
      const { fetchImpl } = fakeFetch(githubRoutes({ prerelease: true, latestTag: 'v2.58.0' }));
      assert.equal(await runWith(argv, fetchImpl), ExitCode.failed);
    });

    it('fails Latest when another release is marked latest', async () => {
      const argv = ['github-release', '--version', VERSION, '--expect', 'latest'];
      const { fetchImpl } = fakeFetch(githubRoutes({ prerelease: false, latestTag: 'v2.58.0' }));
      assert.equal(await runWith(argv, fetchImpl), ExitCode.failed);
    });

    it('requires --expect prerelease or latest', async () => {
      assert.equal(await runWith(['github-release', '--version', VERSION]), ExitCode.usage);
      assert.ok(lines.at(-1).includes('--expect'), lines.join('\n'));
      assert.equal(await runWith(['github-release', '--version', VERSION, '--expect', 'draft']), ExitCode.usage);
      assert.ok(lines.at(-1).includes('--expect'), lines.join('\n'));
    });

    it('sends GITHUB_TOKEN as a bearer token when it is set', async () => {
      env = { GITHUB_TOKEN: 'test-token' };
      const { fetchImpl, options } = fakeFetch(githubRoutes({ prerelease: true }));
      await runWith(['github-release', '--version', VERSION, '--expect', 'prerelease'], fetchImpl);
      assert.ok(options.length > 0);
      assert.ok(options.every((init) => init.headers.Authorization === 'Bearer test-token'));
    });
    it('fails a pre-release whose tag is not at the release branch head', async () => {
      const { fetchImpl } = fakeFetch(githubRoutes({ prerelease: true, branchSha: 'b'.repeat(40) }));
      const argv = ['github-release', '--version', VERSION, '--expect', 'prerelease'];
      assert.equal(await runWith(argv, fetchImpl), ExitCode.failed);
      assert.ok(
        lines.some((line) => line.startsWith('FAIL') && line.includes('release/')),
        lines.join('\n'),
      );
    });

    it('follows an annotated tag to its commit', async () => {
      const head = 'c'.repeat(40);
      const routes = githubRoutes({ prerelease: true, tagSha: 'd'.repeat(40), branchSha: head, annotatedTarget: head });
      const argv = ['github-release', '--version', VERSION, '--expect', 'prerelease'];
      assert.equal(await runWith(argv, fakeFetch(routes).fetchImpl), ExitCode.passed, lines.join('\n'));
    });

    it('fails a pre-release that was also marked Latest', async () => {
      const { fetchImpl } = fakeFetch(githubRoutes({ prerelease: true, latestTag: `v${VERSION}` }));
      const argv = ['github-release', '--version', VERSION, '--expect', 'prerelease'];
      assert.equal(await runWith(argv, fetchImpl), ExitCode.failed);
    });

    it('fails --expect prerelease when the release is not marked pre-release', async () => {
      const { fetchImpl } = fakeFetch(githubRoutes({ prerelease: false }));
      const argv = ['github-release', '--version', VERSION, '--expect', 'prerelease'];
      assert.equal(await runWith(argv, fetchImpl), ExitCode.failed);
    });

    const contentsUrl = `${GITHUB_REPO_API}/contents/packages/teams-js/package.json?ref=v${VERSION}`;
    for (const [name, url, body, options = {}] of [
      ['a release without draft or prerelease', `${GITHUB_REPO_API}/releases/tags/v${VERSION}`, {}],
      [
        'a release whose prerelease is not a boolean',
        `${GITHUB_REPO_API}/releases/tags/v${VERSION}`,
        { tag_name: `v${VERSION}`, prerelease: 'false', draft: false },
      ],
      ['a Latest release without tag_name', `${GITHUB_REPO_API}/releases/latest`, {}],
      ['package.json contents without content', contentsUrl, {}],
      [
        'package.json contents that are not JSON',
        contentsUrl,
        { encoding: 'base64', content: Buffer.from('not json').toString('base64') },
      ],
      ['package.json contents too large to inline', contentsUrl, { encoding: 'none', content: '' }],
      [
        'package.json contents whose version is not a string',
        contentsUrl,
        { encoding: 'base64', content: Buffer.from(JSON.stringify({ version: 259 })).toString('base64') },
      ],
      ['a tag ref without object', `${GITHUB_REPO_API}/git/ref/tags/v${VERSION}`, {}],
      [
        'an annotated tag without object',
        `${GITHUB_REPO_API}/git/tags/${'d'.repeat(40)}`,
        {},
        { tagSha: 'd'.repeat(40), annotatedTarget: 'a'.repeat(40), branchSha: 'a'.repeat(40) },
      ],
      ['a release branch ref without a sha', `${GITHUB_REPO_API}/git/ref/heads/release/${VERSION}`, { object: {} }],
    ]) {
      it(`treats ${name} as inconclusive, never as a pass or a crash`, async () => {
        for (const expect of ['prerelease', 'latest']) {
          const routes = githubRoutes({
            prerelease: expect === 'prerelease',
            latestTag: expect === 'latest' ? `v${VERSION}` : 'v2.58.0',
            ...options,
          });
          routes[url] = response(200, body);
          const argv = ['github-release', '--version', VERSION, '--expect', expect];
          assert.equal(await runWith(argv, fakeFetch(routes).fetchImpl), ExitCode.unreachable, lines.join('\n'));
        }
      });
    }
  });

  describe('beta-version', () => {
    const tags = (latest, extraRoutes = {}) =>
      fakeFetch({ [registryTags(NPM)]: response(200, { latest, beta: '2.59.0-beta.0' }), ...extraRoutes }).fetchImpl;

    it('passes a beta of the next version', async () => {
      assert.equal(await runWith(['beta-version', '--version', '2.60.0-beta.0'], tags('2.59.0')), ExitCode.passed);
    });

    it('fails a beta of a version that already shipped', async () => {
      assert.equal(await runWith(['beta-version', '--version', '2.59.0-beta.1'], tags('2.59.0')), ExitCode.failed);
      assert.equal(await runWith(['beta-version', '--version', '2.58.0-beta.3'], tags('2.59.0')), ExitCode.failed);
    });

    it('compares numerically, not as text', async () => {
      assert.equal(await runWith(['beta-version', '--version', '2.100.0-beta.0'], tags('2.99.0')), ExitCode.passed);
    });

    it('rejects a version that is not a beta', async () => {
      assert.equal(await runWith(['beta-version', '--version', '2.60.0'], tags('2.59.0')), ExitCode.usage);
      assert.ok(lines.at(-1).includes('-beta.'), lines.join('\n'));
    });

    it('fails when the Prod CDN already has the base version, even if a lagging proxy says otherwise', async () => {
      const { fetchImpl } = fakeFetch({
        ...unreachable(registryTags(NPM)),
        ...registryRoutes(PROXY, { tags: { latest: '2.58.0' } }),
        [cdnScriptUrl(VERSION, 'prod')]: response(200, BUNDLE),
      });
      const argv = ['beta-version', '--version', '2.59.0-beta.1', '--registry', PROXY];
      assert.equal(await runWith(argv, fetchImpl), ExitCode.failed, lines.join('\n'));
    });

    it('fails when tag v<base> already exists', async () => {
      const tagUrl = `https://api.github.com/repos/OfficeDev/microsoft-teams-library-js/git/ref/tags/v${VERSION}`;
      const { fetchImpl } = fakeFetch({
        ...unreachable(registryTags(NPM)),
        [tagUrl]: response(200, { object: { type: 'commit', sha: 'a'.repeat(40) } }),
      });
      assert.equal(await runWith(['beta-version', '--version', '2.59.0-beta.1'], fetchImpl), ExitCode.failed);
    });

    it('takes the highest latest across sources', async () => {
      const { fetchImpl } = fakeFetch({
        ...unreachable(registryTags(NPM)),
        ...registryRoutes(PROXY, { tags: { latest: '2.58.0' } }),
        ...jsdelivrRoutes({ versions: [VERSION], tags: { latest: VERSION } }),
      });
      const argv = ['beta-version', '--version', '2.59.0-beta.1', '--registry', PROXY];
      assert.equal(await runWith(argv, fetchImpl), ExitCode.failed, lines.join('\n'));
    });

    it('uses the GitHub Latest release when npm is unreachable', async () => {
      const { fetchImpl } = fakeFetch({
        ...unreachable(registryTags(NPM)),
        [`${GITHUB_REPO_API}/releases/latest`]: response(200, { tag_name: 'v2.59.0' }),
      });
      assert.equal(
        await runWith(['beta-version', '--version', '2.60.0-beta.0'], fetchImpl),
        ExitCode.passed,
        lines.join('\n'),
      );
      assert.ok(
        lines.some((line) => line.startsWith('PASS') && line.includes('GitHub Latest release')),
        lines.join('\n'),
      );
    });

    it('fails a beta of an older patch line when npm is unreachable but GitHub Latest is newer', async () => {
      const { fetchImpl } = fakeFetch({
        ...unreachable(registryTags(NPM)),
        [`${GITHUB_REPO_API}/releases/latest`]: response(200, { tag_name: 'v2.59.0' }),
      });
      assert.equal(
        await runWith(['beta-version', '--version', '2.58.1-beta.0'], fetchImpl),
        ExitCode.failed,
        lines.join('\n'),
      );
    });

    it('is inconclusive when neither npm nor GitHub can say what latest is', async () => {
      const { fetchImpl } = fakeFetch(unreachable(registryTags(NPM), `${GITHUB_REPO_API}/releases/latest`));
      assert.equal(
        await runWith(['beta-version', '--version', '2.58.1-beta.0'], fetchImpl),
        ExitCode.unreachable,
        lines.join('\n'),
      );
    });

    it('never passes on a lagging proxy or mirror latest alone, since 2.59.0 may have shipped since', async () => {
      for (const lagging of [
        registryRoutes(PROXY, { tags: { latest: '2.58.0' } }),
        jsdelivrRoutes({ versions: ['2.58.0'], tags: { latest: '2.58.0' } }),
      ]) {
        const { fetchImpl } = fakeFetch({
          ...unreachable(registryTags(NPM), `${GITHUB_REPO_API}/releases/latest`),
          ...lagging,
        });
        const argv = ['beta-version', '--version', '2.58.1-beta.0', '--registry', PROXY];
        assert.equal(await runWith(argv, fetchImpl), ExitCode.unreachable, lines.join('\n'));
      }
    });

    it('fails on a proxy latest alone when it already rules the beta out', async () => {
      const { fetchImpl } = fakeFetch({
        ...unreachable(registryTags(NPM), `${GITHUB_REPO_API}/releases/latest`),
        ...registryRoutes(PROXY, { tags: { latest: '2.59.0' } }),
      });
      const argv = ['beta-version', '--version', '2.58.1-beta.0', '--registry', PROXY];
      assert.equal(await runWith(argv, fetchImpl), ExitCode.failed, lines.join('\n'));
    });

    it('is inconclusive when the Prod CDN cannot be reached', async () => {
      const { fetchImpl } = fakeFetch({
        ...unreachable(registryTags(NPM), cdnScriptUrl('2.60.0', 'prod')),
      });
      assert.equal(await runWith(['beta-version', '--version', '2.60.0-beta.0'], fetchImpl), ExitCode.unreachable);
    });

    for (const tagName of [['v2.59.0'], { name: 'v2.59.0' }, 2.59]) {
      it(`does not count a GitHub Latest tag_name of ${JSON.stringify(tagName)} when npm is unreachable`, async () => {
        const { fetchImpl } = fakeFetch({
          ...unreachable(registryTags(NPM)),
          [`${GITHUB_REPO_API}/releases/latest`]: response(200, { tag_name: tagName }),
        });
        assert.equal(
          await runWith(['beta-version', '--version', '2.60.0-beta.0'], fetchImpl),
          ExitCode.unreachable,
          lines.join('\n'),
        );
      });
    }

    it('does not crash when dist-tags has no latest', async () => {
      const { fetchImpl } = fakeFetch({
        [registryTags(NPM)]: response(200, { beta: '2.59.0-beta.0' }),
        [`${GITHUB_REPO_API}/releases/latest`]: response(200, { tag_name: 'v2.59.0' }),
      });
      assert.equal(await runWith(['beta-version', '--version', '2.60.0-beta.0'], fetchImpl), ExitCode.passed);
    });
  });

  describe('pipeline-config', () => {
    it('passes when Prod publishes with tag latest and artifact retention is v6 or later', async () => {
      writePipelineConfig(root);
      assert.equal(await runWith(['pipeline-config']), ExitCode.passed, lines.join('\n'));
    });

    it('fails when prod-release.yml has no Prod validation task', async () => {
      writePipelineConfig(root, { validation: '      - stage: Prod_Validation' });
      assert.equal(await runWith(['pipeline-config']), ExitCode.failed, lines.join('\n'));
      assert.ok(
        lines.some(
          (line) => line.startsWith('FAIL tools/releases/prod-release.yml') && line.includes('validate-prod-build.ps1'),
        ),
        lines.join('\n'),
      );
    });

    for (const [name, change] of [
      [
        'disabled',
        (yaml) =>
          yaml.replace(
            "                  targetType: 'filePath'",
            "                  targetType: 'filePath'\n                enabled: false",
          ),
      ],
      [
        'commented out',
        (yaml) => yaml.replace('              - task: PowerShell@2', '              # - task: PowerShell@2'),
      ],
    ]) {
      it(`fails when the Prod validation task is ${name}`, async () => {
        writePipelineConfig(root, { validation: change(PROD_VALIDATION) });
        assert.equal(await runWith(['pipeline-config']), ExitCode.failed, lines.join('\n'));
      });
    }

    for (const [name, dependsOn] of [
      ['an empty list', '        dependsOn: []'],
      ['another stage', '        dependsOn: Other_Stage'],
      ['no dependsOn', ''],
      ['a commented-out entry', '        dependsOn:\n          # - Prod_Validation'],
    ]) {
      it(`fails when the Lockbox stage depends on ${name}`, async () => {
        writePipelineConfig(root, { lockboxDependsOn: dependsOn });
        assert.equal(await runWith(['pipeline-config']), ExitCode.failed, lines.join('\n'));
        assert.ok(
          lines.some((line) => line.startsWith('FAIL') && line.includes('Prod_Lockbox_Approval_Deployment')),
          lines.join('\n'),
        );
      });
    }

    for (const [name, dependsOn] of [
      ['an inline value', '        dependsOn: Prod_Validation'],
      ['a flow list', "        dependsOn: [Other_Stage, 'Prod_Validation']"],
    ]) {
      it(`passes when the Lockbox stage depends on Prod_Validation as ${name}`, async () => {
        writePipelineConfig(root, { lockboxDependsOn: dependsOn });
        assert.equal(await runWith(['pipeline-config']), ExitCode.passed, lines.join('\n'));
      });
    }

    it('fails when the Prod validation stage runs a different script', async () => {
      writePipelineConfig(root, {
        validation: PROD_VALIDATION.replace('validate-prod-build.ps1', 'view-published-packages-urls.ps1'),
      });
      assert.equal(await runWith(['pipeline-config']), ExitCode.failed, lines.join('\n'));
    });

    it("does not take a later stage's dependsOn for the Lockbox stage", async () => {
      writePipelineConfig(root, { lockboxDependsOn: '' });
      const yaml = path.join(root, 'tools/releases/prod-release.yml');
      fs.appendFileSync(yaml, '\n      - stage: Later\n        dependsOn:\n          - Prod_Validation\n');
      assert.equal(await runWith(['pipeline-config']), ExitCode.failed, lines.join('\n'));
    });

    it("reads the Lockbox stage's dependsOn when a job's dependsOn comes first", async () => {
      writePipelineConfig(root, { lockboxDependsOn: '' });
      const yaml = path.join(root, 'tools/releases/prod-release.yml');
      const text = fs
        .readFileSync(yaml, 'utf8')
        .replace('- job: Agent_job', '- job: Agent_job\n            dependsOn: []');
      fs.writeFileSync(yaml, `${text}\n        dependsOn:\n          - Prod_Validation\n`);
      assert.equal(await runWith(['pipeline-config']), ExitCode.passed, lines.join('\n'));
    });

    it("does not take a job's dependsOn for the Lockbox stage", async () => {
      writePipelineConfig(root, { lockboxDependsOn: '' });
      const yaml = path.join(root, 'tools/releases/prod-release.yml');
      const text = fs.readFileSync(yaml, 'utf8');
      fs.writeFileSync(
        yaml,
        text.replace('- job: Agent_job', '- job: Agent_job\n            dependsOn: Prod_Validation'),
      );
      assert.equal(await runWith(['pipeline-config']), ExitCode.failed, lines.join('\n'));
    });

    it('reads a dependsOn list written at the same indent as its key', async () => {
      writePipelineConfig(root, { lockboxDependsOn: '        dependsOn:\n        - Prod_Validation' });
      assert.equal(await runWith(['pipeline-config']), ExitCode.passed, lines.join('\n'));
    });
    it('fails when the validation task runs only in the Lockbox stage, after the approval', async () => {
      writePipelineConfig(root, {
        validation: PROD_VALIDATION.replace('validate-prod-build.ps1', 'view-published-packages-urls.ps1'),
      });
      const yaml = path.join(root, 'tools/releases/prod-release.yml');
      fs.appendFileSync(
        yaml,
        [
          '',
          '              - task: PowerShell@2',
          '                inputs:',
          "                  filePath: 'tools/releases/powershell-commands/validate-prod-build.ps1'",
          '',
        ].join('\n'),
      );
      assert.equal(await runWith(['pipeline-config']), ExitCode.failed, lines.join('\n'));
      assert.ok(
        lines.some(
          (line) => line.startsWith('FAIL tools/releases/prod-release.yml') && line.includes('validate-prod-build.ps1'),
        ),
        lines.join('\n'),
      );
    });

    it('fails when the Prod_Validation stage is missing even if the task and dependency are there', async () => {
      writePipelineConfig(root, { validation: PROD_VALIDATION.replace('stage: Prod_Validation', 'stage: Renamed') });
      assert.equal(await runWith(['pipeline-config']), ExitCode.failed, lines.join('\n'));
    });
    for (const [name, options] of [
      ['has no Check_Skip stage', { sdfSkipGate: '' }],
      [
        'has the Decide step commented out',
        { sdfSkipGate: SDF_SKIP_GATE.replace('- task: PowerShell@2', '# - task: PowerShell@2') },
      ],
      [
        'has the Decide step disabled',
        {
          sdfSkipGate: SDF_SKIP_GATE.replace(
            '                name: Decide',
            '                name: Decide\n                enabled: false',
          ),
        },
      ],
      [
        'runs another script in the Decide step',
        { sdfSkipGate: SDF_SKIP_GATE.replace('sdf-beta-schedule.js', 'other.js') },
      ],
      [
        'names the skip script only in a comment',
        {
          sdfSkipGate: SDF_SKIP_GATE.replace(
            "node '$(Pipeline.Workspace)/scripts/sdf-beta-schedule.js'",
            'node other.js # sdf-beta-schedule.js',
          ),
        },
      ],
      [
        'renames the Check job the publish output names',
        { sdfSkipGate: SDF_SKIP_GATE.replace('job: Check', 'job: Other') },
      ],
      ['has a Lockbox stage that depends on nothing', { sdfLockboxDependsOn: '        dependsOn: []' }],
      ['has a Lockbox stage with no condition', { sdfLockboxCondition: '' }],
      ['has a Lockbox stage condition of succeeded() only', { sdfLockboxCondition: '        condition: succeeded()' }],
      [
        'has the Lockbox stage condition commented out',
        { sdfLockboxCondition: SDF_LOCKBOX_CONDITION.replace('condition:', '# condition:') },
      ],
      [
        'publishes a scheduled run when the publish output is false',
        { sdfLockboxCondition: SDF_LOCKBOX_CONDITION.replace("publish'], 'true'", "publish'], 'false'") },
      ],
      [
        'drops the manual-run branch from the Lockbox stage condition',
        {
          sdfLockboxCondition:
            "        condition: and(succeeded(), eq(dependencies.Check_Skip.outputs['Check.Decide.publish'], 'true'))",
        },
      ],
      [
        'compares Build.Reason with a spaced-out Schedule literal',
        { sdfLockboxCondition: SDF_LOCKBOX_CONDITION.replace("'Schedule'", "'Sched ule'") },
      ],
      [
        'has the skip script only in a PowerShell block comment',
        {
          sdfSkipGate: SDF_SKIP_GATE.replace(
            "node '$(Pipeline.Workspace)/scripts/sdf-beta-schedule.js'",
            "<# node '$(Pipeline.Workspace)/scripts/sdf-beta-schedule.js' #>",
          ),
        },
      ],
      [
        'runs a different script whose name ends in sdf-beta-schedule.js',
        { sdfSkipGate: SDF_SKIP_GATE.replace('scripts/sdf-beta-schedule.js', 'scripts/not-sdf-beta-schedule.js') },
      ],
      [
        'names the skip script after a command other than node',
        { sdfSkipGate: SDF_SKIP_GATE.replace("node '$(Pipeline", "echo '$(Pipeline") },
      ],
      [
        'puts --reason on a second line of a literal block, which runs as its own command',
        {
          sdfSkipGate: SDF_SKIP_GATE.replace('script: >-', 'script: |').replace(
            "sdf-beta-schedule.js'",
            "sdf-beta-schedule.js' --alias pipe",
          ),
        },
      ],
      [
        'ends the skip command with ; before --reason',
        {
          sdfSkipGate: SDF_SKIP_GATE.replace("sdf-beta-schedule.js'", "sdf-beta-schedule.js' --alias pipe;"),
        },
      ],
      [
        'comments out --reason with #',
        {
          sdfSkipGate: SDF_SKIP_GATE.replace("sdf-beta-schedule.js'", "sdf-beta-schedule.js' --alias #"),
        },
      ],
      [
        'passes the skip script an argument that is not an option pair, which makes it throw',
        { sdfSkipGate: SDF_SKIP_GATE.replace("sdf-beta-schedule.js'", "sdf-beta-schedule.js' stray words") },
      ],
      [
        'splits the skip command with a blank line, which a folded block keeps as a line break',
        {
          sdfSkipGate: SDF_SKIP_GATE.replace("sdf-beta-schedule.js'\n", "sdf-beta-schedule.js' --alias pipe\n\n"),
        },
      ],
      [
        'runs only an output-setting command, with the skip command in env.script',
        {
          sdfSkipGate: SDF_SKIP_GATE.replace(
            [
              '                  script: >-',
              "                    node '$(Pipeline.Workspace)/scripts/sdf-beta-schedule.js'",
              "                    --reason '$(Build.Reason)'",
            ].join('\n'),
            "                  script: Write-Host 'publish'",
          ).replace(
            '                env:',
            '                env:\n                  script: node scripts/sdf-beta-schedule.js --reason Schedule',
          ),
        },
      ],
      [
        'continues a plain script value on an indented line with --reason Manual',
        {
          sdfSkipGate: SDF_SKIP_GATE.replace(
            [
              '                  script: >-',
              "                    node '$(Pipeline.Workspace)/scripts/sdf-beta-schedule.js'",
              "                    --reason '$(Build.Reason)'",
            ].join('\n'),
            [
              '                  script: node scripts/sdf-beta-schedule.js --reason Schedule',
              '                    --reason Manual',
            ].join('\n'),
          ),
        },
      ],
      [
        'runs Decide from a file, which ignores the inline script',
        {
          sdfSkipGate: SDF_SKIP_GATE.replace(
            '                  targetType: inline',
            "                  targetType: filePath\n                  filePath: 'tools/other.ps1'",
          ),
        },
      ],
      ['runs Decide as a Bash task', { sdfSkipGate: SDF_SKIP_GATE.replace('task: PowerShell@2', 'task: Bash@3') }],
      [
        'gives Decide a second script input before the real one',
        {
          sdfSkipGate: SDF_SKIP_GATE.replace(
            '                  script: >-',
            '                  script: Write-Host publish\n                  script: >-',
          ),
        },
      ],
      [
        'gives Decide a second inputs mapping before the real one',
        {
          sdfSkipGate: SDF_SKIP_GATE.replace(
            '                inputs:',
            '                inputs:\n                  targetType: inline\n                  script: Write-Host publish\n                inputs:',
          ),
        },
      ],
      [
        'sets Decide targetType to filePath',
        { sdfSkipGate: SDF_SKIP_GATE.replace('targetType: inline', 'targetType: filePath') },
      ],
      [
        'leaves out Decide targetType, which defaults to filePath',
        { sdfSkipGate: SDF_SKIP_GATE.replace('                  targetType: inline\n', '') },
      ],
      [
        'quotes the script key',
        { sdfSkipGate: SDF_SKIP_GATE.replace('                  script: >-', "                  'script': >-") },
      ],
      [
        'writes the Decide inputs as a flow mapping',
        {
          sdfSkipGate: SDF_SKIP_GATE.replace(
            [
              '                inputs:',
              '                  targetType: inline',
              '                  script: >-',
              "                    node '$(Pipeline.Workspace)/scripts/sdf-beta-schedule.js'",
              "                    --reason '$(Build.Reason)'",
            ].join('\n'),
            '                inputs: { targetType: inline, script: node scripts/sdf-beta-schedule.js --reason Schedule }',
          ),
        },
      ],
      [
        'gives Decide an input the check does not know',
        {
          sdfSkipGate: SDF_SKIP_GATE.replace(
            '                  targetType: inline',
            '                  targetType: inline\n                  arguments: -Publish',
          ),
        },
      ],
      [
        'gives Decide a task key the check does not know, such as continueOnError',
        {
          sdfSkipGate: SDF_SKIP_GATE.replace(
            '                name: Decide',
            '                name: Decide\n                continueOnError: true',
          ),
        },
      ],
      [
        'runs node --eval with a path-like value ending in the script name',
        {
          sdfSkipGate: SDF_SKIP_GATE.replace(
            "node '$(Pipeline.Workspace)/scripts/sdf-beta-schedule.js'",
            "node '--eval=console.log(1)//sdf-beta-schedule.js'",
          ),
        },
      ],
      [
        'passes --now, which overrides the date the skip rule uses',
        {
          sdfSkipGate: SDF_SKIP_GATE.replace(
            "--reason '$(Build.Reason)'",
            "--reason '$(Build.Reason)'\n                    --now 2026-11-11T18:00:00Z",
          ),
        },
      ],
      [
        'passes an option twice',
        {
          sdfSkipGate: SDF_SKIP_GATE.replace(
            "--reason '$(Build.Reason)'",
            "--alias pipe\n                    --reason '$(Build.Reason)'\n                    --alias other",
          ),
        },
      ],
      [
        'gives Decide condition: false, so it never runs and every scheduled beta skips',
        {
          sdfSkipGate: SDF_SKIP_GATE.replace(
            "                condition: eq(variables['Build.Reason'], 'Schedule')",
            '                condition: false',
          ),
        },
      ],
      [
        'gives Decide a condition written on the next line',
        {
          sdfSkipGate: SDF_SKIP_GATE.replace(
            "                condition: eq(variables['Build.Reason'], 'Schedule')",
            '                condition:\n                  false',
          ),
        },
      ],
      [
        'prints the skip command with Write-Host instead of running it',
        {
          sdfSkipGate: SDF_SKIP_GATE.replace(
            "node '$(Pipeline.Workspace)/scripts/sdf-beta-schedule.js'",
            "Write-Host node '$(Pipeline.Workspace)/scripts/sdf-beta-schedule.js'",
          ),
        },
      ],
      [
        'has the skip command only inside a quoted string',
        {
          sdfSkipGate: SDF_SKIP_GATE.replace(
            [
              "                    node '$(Pipeline.Workspace)/scripts/sdf-beta-schedule.js'",
              "                    --reason '$(Build.Reason)'",
            ].join('\n'),
            '                    Write-Host "e.g. node scripts/sdf-beta-schedule.js --reason Schedule"',
          ),
        },
      ],
      [
        'runs a second command after the skip script in a literal block',
        {
          sdfSkipGate: SDF_SKIP_GATE.replace('script: >-', 'script: |').replace(
            "                    --reason '$(Build.Reason)'",
            "                    Write-Host '##vso[task.setvariable variable=publish;isOutput=true]true'",
          ),
        },
      ],
      [
        'does not pass --reason to the skip script',
        { sdfSkipGate: SDF_SKIP_GATE.replace("\n                    --reason '$(Build.Reason)'", '') },
      ],
      [
        'passes --reason Manual to the skip script',
        { sdfSkipGate: SDF_SKIP_GATE.replace("--reason '$(Build.Reason)'", '--reason Manual') },
      ],
      [
        'passes --reason twice, the last one Manual',
        {
          sdfSkipGate: SDF_SKIP_GATE.replace(
            "--reason '$(Build.Reason)'",
            "--reason '$(Build.Reason)'\n                    --reason Manual",
          ),
        },
      ],
      [
        'wraps the Lockbox stage condition in or(true, ...)',
        { sdfLockboxCondition: `${SDF_LOCKBOX_CONDITION.replace('condition: and(', 'condition: or(true, and(')})` },
      ],
      [
        'negates the Lockbox stage condition',
        { sdfLockboxCondition: `${SDF_LOCKBOX_CONDITION.replace('condition: and(', 'condition: not(and(')})` },
      ],
      [
        'names the skip script only in the Decide display name',
        {
          sdfSkipGate: SDF_SKIP_GATE.replace(
            '                name: Decide',
            '                name: Decide\n                displayName: Apply the sdf-beta-schedule.js skip rule',
          ).replace(
            "node '$(Pipeline.Workspace)/scripts/sdf-beta-schedule.js'",
            'Write-Host "##vso[task.setvariable variable=publish;isOutput=true]true"',
          ),
        },
      ],
      [
        'runs the skip script as Decide only in a job other than Check',
        {
          sdfSkipGate: [
            SDF_SKIP_GATE.replace('                name: Decide', '                name: Before'),
            '          - job: Other',
            '            steps:',
            '              - task: PowerShell@2',
            '                name: Decide',
            '                inputs:',
            '                  script: node sdf-beta-schedule.js',
          ].join('\n'),
        },
      ],
    ]) {
      it(`fails when sdf-release.yml ${name}`, async () => {
        writePipelineConfig(root, options);
        assert.equal(await runWith(['pipeline-config']), ExitCode.failed, lines.join('\n'));
        assert.ok(
          lines.some((line) => line.startsWith('FAIL tools/releases/sdf-release.yml') && line.includes('Check_Skip')),
          lines.join('\n'),
        );
      });
    }

    for (const [name, options] of [
      [
        'double quotes and extra spaces in the Lockbox stage condition',
        {
          sdfLockboxCondition:
            '        condition: and( succeeded(), or( ne(variables["Build.Reason"], "Schedule"), ' +
            'eq(dependencies.Check_Skip.outputs["Check.Decide.publish"], "true") ) )',
        },
      ],
      [
        'the or() branches of the Lockbox stage condition in the other order',
        {
          sdfLockboxCondition:
            "        condition: and(succeeded(), or(eq(dependencies.Check_Skip.outputs['Check.Decide.publish'], 'true'), " +
            "ne(variables['Build.Reason'], 'Schedule')))",
        },
      ],
      [
        'no Decide condition, since a manual run publishes anyway',
        {
          sdfSkipGate: SDF_SKIP_GATE.replace(
            "                condition: eq(variables['Build.Reason'], 'Schedule')\n",
            '',
          ),
        },
      ],
      [
        'a one-line Decide script',
        {
          sdfSkipGate: SDF_SKIP_GATE.replace(
            [
              '                  script: >-',
              "                    node '$(Pipeline.Workspace)/scripts/sdf-beta-schedule.js'",
              "                    --reason '$(Build.Reason)'",
            ].join('\n'),
            '                  script: node $(Pipeline.Workspace)/scripts/sdf-beta-schedule.js --reason Schedule',
          ),
        },
      ],
      [
        'a literal one-line block running NODE with Windows path separators',
        {
          sdfSkipGate: SDF_SKIP_GATE.replace(
            [
              '                  script: >-',
              "                    node '$(Pipeline.Workspace)/scripts/sdf-beta-schedule.js'",
              "                    --reason '$(Build.Reason)'",
            ].join('\n'),
            [
              '                  script: |',
              "                    NODE '$(Pipeline.Workspace)\\scripts\\sdf-beta-schedule.js' --reason '$(Build.Reason)' --alias \"pipe\"",
            ].join('\n'),
          ),
        },
      ],
    ]) {
      it(`passes the SDF skip gate with ${name}`, async () => {
        writePipelineConfig(root, options);
        assert.equal(await runWith(['pipeline-config']), ExitCode.passed, lines.join('\n'));
      });
    }

    it("takes the SDF Lockbox stage's own condition, not a job's", async () => {
      writePipelineConfig(root, { sdfLockboxCondition: '' });
      const sdf = path.join(root, 'tools/releases/sdf-release.yml');
      fs.writeFileSync(
        sdf,
        fs
          .readFileSync(sdf, 'utf8')
          .replace('          - job: Agent_job', `          - job: Agent_job\n    ${SDF_LOCKBOX_CONDITION}`),
      );
      assert.equal(await runWith(['pipeline-config']), ExitCode.failed, lines.join('\n'));
    });

    for (const [name, setting] of [
      ['condition: false', '                condition: false'],
      ['a condition that can skip it', "                condition: eq(variables['Build.Reason'], 'Schedule')"],
      ['continueOnError: true', '                continueOnError: true'],
      ["continueOnError: 'True'", "                continueOnError: 'True'"],
      ['a template expression for continueOnError', '                continueOnError: ${{ true }}'],
      ['a variable for continueOnError', '                continueOnError: $(ignoreValidation)'],
      ['continueOnError: true written on the next line', '                continueOnError:\n                  true'],
      ['condition: false written on the next line', '                condition:\n                  false'],
      [
        'continueOnError: false continued on the next line',
        '                continueOnError: false\n                  true',
      ],
    ]) {
      it(`fails when the Prod validation task has ${name}`, async () => {
        writePipelineConfig(root, {
          validation: PROD_VALIDATION.replace(
            '                displayName: Check the pinned CI build',
            `                displayName: Check the pinned CI build\n${setting}`,
          ),
        });
        assert.equal(await runWith(['pipeline-config']), ExitCode.failed, lines.join('\n'));
        assert.ok(
          lines.some(
            (line) =>
              line.startsWith('FAIL tools/releases/prod-release.yml') && line.includes('validate-prod-build.ps1'),
          ),
          lines.join('\n'),
        );
      });
    }

    for (const [name, setting] of [
      ['continueOnError: true', '                continueOnError: true'],
      ['condition: false', '                condition: false'],
      ["a quoted 'continueOnError' key", "                'continueOnError': true"],
    ]) {
      it(`fails when the Prod validation task has ${name} after a quoted 'inputs' key`, async () => {
        const validation = `${PROD_VALIDATION.replace(
          '                displayName: Check the pinned CI build\n',
          '',
        ).replace('                inputs:', "                'inputs':")}\n${setting}`;
        writePipelineConfig(root, { validation });
        assert.equal(await runWith(['pipeline-config']), ExitCode.failed, lines.join('\n'));
      });
    }

    for (const [name, after, setting] of [
      ['condition: succeeded()', 'displayName', '                condition: succeeded()'],
      ['continueOnError: false', 'displayName', '                continueOnError: false'],
      ['continueOnError with no value, which is null', 'displayName', '                continueOnError:'],
      ['a commented-out continueOnError: true', 'displayName', '                # continueOnError: true'],
      ['continueOnError: true only under inputs', 'targetType', '                  continueOnError: true'],
    ]) {
      it(`passes when the Prod validation task has ${name}`, async () => {
        const anchor =
          after === 'displayName'
            ? '                displayName: Check the pinned CI build'
            : "                  targetType: 'filePath'";
        writePipelineConfig(root, { validation: PROD_VALIDATION.replace(anchor, `${anchor}\n${setting}`) });
        assert.equal(await runWith(['pipeline-config']), ExitCode.passed, lines.join('\n'));
      });
    }

    it('fails when the Prod publish task says tag beta', async () => {
      writePipelineConfig(root, { prodTag: 'beta' });
      assert.equal(await runWith(['pipeline-config']), ExitCode.failed);
    });

    it('fails when Prod publishes with the Beta product state', async () => {
      writePipelineConfig(root, { prodState: 'Beta' });
      assert.equal(await runWith(['pipeline-config']), ExitCode.failed);
    });

    it('fails when artifact retention is on a Node 16 version', async () => {
      writePipelineConfig(root, { retention: 3 });
      assert.equal(await runWith(['pipeline-config']), ExitCode.failed);
      assert.ok(
        lines.some((line) => line.startsWith('FAIL') && line.includes('AssetRetention@3')),
        lines.join('\n'),
      );
    });

    for (const file of [
      'tools/releases/prod-release.yml',
      'tools/releases/sdf-release.yml',
      'tools/releases/ddl-release.yml',
      'tools/yaml-templates/security.yml',
    ]) {
      it(`fails when ${file} has no artifact retention task`, async () => {
        writePipelineConfig(root);
        const yaml = path.join(root, file);
        fs.writeFileSync(yaml, fs.readFileSync(yaml, 'utf8').replace(/^.*AssetRetention@6.*$/m, ''));
        assert.equal(await runWith(['pipeline-config']), ExitCode.failed, lines.join('\n'));
        assert.ok(
          lines.some((line) => line.startsWith(`FAIL ${file}`) && line.includes('AssetRetention')),
          lines.join('\n'),
        );
      });
    }

    it('does not count a commented-out artifact retention task', async () => {
      writePipelineConfig(root);
      const yaml = path.join(root, 'tools/releases/prod-release.yml');
      fs.writeFileSync(
        yaml,
        fs.readFileSync(yaml, 'utf8').replace('- task: AssetRetention@6', '# - task: AssetRetention@6'),
      );
      assert.equal(await runWith(['pipeline-config']), ExitCode.failed, lines.join('\n'));
    });

    for (const file of ['tools/releases/prod-release.yml', 'tools/releases/sdf-release.yml']) {
      it(`fails when ${file} has its publish task commented out`, async () => {
        writePipelineConfig(root);
        const yaml = path.join(root, file);
        const commented = fs
          .readFileSync(yaml, 'utf8')
          .split('\n')
          .map((line) => (line.includes('AssetRetention') ? line : line.replace(/^(\s*)/, '$1# ')))
          .join('\n');
        fs.writeFileSync(yaml, commented);
        assert.equal(await runWith(['pipeline-config']), ExitCode.failed, lines.join('\n'));
        assert.ok(
          lines.some((line) => line.startsWith(`FAIL ${file}`) && line.includes('EsrpRelease')),
          lines.join('\n'),
        );
      });
    }

    it('does not let a commented Latest hide an active double-quoted Beta product state', async () => {
      writePipelineConfig(root);
      const prod = path.join(root, 'tools/releases/prod-release.yml');
      fs.writeFileSync(
        prod,
        fs
          .readFileSync(prod, 'utf8')
          .replace(
            "                  productstate: 'Latest'",
            '                  # productstate: \'Latest\'\n                  productstate: "Beta"',
          ),
      );
      assert.equal(await runWith(['pipeline-config']), ExitCode.failed, lines.join('\n'));
      assert.ok(
        lines.some((line) => line.startsWith('FAIL tools/releases/prod-release.yml') && line.includes('Beta')),
        lines.join('\n'),
      );
    });

    it('fails when the Prod product state is unquoted Beta', async () => {
      writePipelineConfig(root);
      const prod = path.join(root, 'tools/releases/prod-release.yml');
      fs.writeFileSync(prod, fs.readFileSync(prod, 'utf8').replace("productstate: 'Latest'", 'productstate: Beta'));
      assert.equal(await runWith(['pipeline-config']), ExitCode.failed, lines.join('\n'));
    });

    it('accepts double-quoted, unquoted and trailing-comment product states', async () => {
      writePipelineConfig(root);
      const prod = path.join(root, 'tools/releases/prod-release.yml');
      const sdf = path.join(root, 'tools/releases/sdf-release.yml');
      fs.writeFileSync(prod, fs.readFileSync(prod, 'utf8').replace("productstate: 'Latest'", 'productstate: "Latest"'));
      fs.writeFileSync(sdf, fs.readFileSync(sdf, 'utf8').replace("productstate: 'Beta'", 'productstate: Beta # SDF'));
      assert.equal(await runWith(['pipeline-config']), ExitCode.passed, lines.join('\n'));
    });

    const editProd = (from, to) => {
      const prod = path.join(root, 'tools/releases/prod-release.yml');
      const text = fs.readFileSync(prod, 'utf8');
      assert.ok(text.includes(from), `fixture has ${from}`);
      fs.writeFileSync(prod, text.replace(from, to));
    };

    it('does not let a disabled sibling task disable the task before it', async () => {
      writePipelineConfig(root);
      editProd(
        '              - task: EsrpRelease@10',
        '              - task: PowerShell@2\n                enabled: false\n              - task: EsrpRelease@10',
      );
      assert.equal(await runWith(['pipeline-config']), ExitCode.passed, lines.join('\n'));
    });

    it('keeps a # inside a quoted display name', async () => {
      writePipelineConfig(root);
      editProd(
        'displayName: Publish to npm (tag latest) - ESRP release',
        'displayName: "Step #1: Publish to npm (tag latest)"',
      );
      assert.equal(await runWith(['pipeline-config']), ExitCode.passed, lines.join('\n'));
    });

    it('accepts an explicitly enabled publish task', async () => {
      writePipelineConfig(root);
      editProd('- task: EsrpRelease@10', '- task: EsrpRelease@10\n                enabled: true');
      assert.equal(await runWith(['pipeline-config']), ExitCode.passed, lines.join('\n'));
    });

    for (const [name, from, to] of [
      ['has no product state', "                  productstate: 'Latest'", ''],
      [
        'repeats productstate with Beta',
        "productstate: 'Latest'",
        "productstate: 'Latest'\n                  productstate: 'Beta'",
      ],
      ['names no npm tag', 'Publish to npm (tag latest) - ESRP release', 'Publish to npm - ESRP release'],
    ]) {
      it(`fails when the Prod publish task ${name}`, async () => {
        writePipelineConfig(root);
        editProd(from, to);
        assert.equal(await runWith(['pipeline-config']), ExitCode.failed, lines.join('\n'));
      });
    }

    for (const task of ['EsrpRelease@10', 'AssetRetention@6']) {
      it(`fails when the Prod ${task} task is disabled`, async () => {
        writePipelineConfig(root);
        const prod = path.join(root, 'tools/releases/prod-release.yml');
        fs.writeFileSync(
          prod,
          fs.readFileSync(prod, 'utf8').replace(`- task: ${task}`, `- task: ${task}\n                enabled: false`),
        );
        assert.equal(await runWith(['pipeline-config']), ExitCode.failed, lines.join('\n'));
      });
    }

    it('fails when Prod has a second, Beta, publish task', async () => {
      writePipelineConfig(root);
      const prod = path.join(root, 'tools/releases/prod-release.yml');
      const text = fs.readFileSync(prod, 'utf8');
      const publish = text.slice(text.indexOf('              - task: EsrpRelease@10'));
      fs.writeFileSync(prod, `${text}\n${publish.replace("'Latest'", "'Beta'")}`);
      assert.equal(await runWith(['pipeline-config']), ExitCode.failed, lines.join('\n'));
    });

    const asScriptText = (yaml, indicator) =>
      [
        '              - task: PowerShell@2',
        '                inputs:',
        `                  script: ${indicator}`,
        ...yaml.split('\n').map((line) => `                    ${line.trim() ? line.trimStart() : ''}`),
      ].join('\n');

    for (const indicator of ['|', '>-', '|+2']) {
      it(`does not count tasks written inside a ${indicator} script block`, async () => {
        writePipelineConfig(root);
        for (const file of ['tools/releases/prod-release.yml', 'tools/releases/ddl-release.yml']) {
          const yaml = path.join(root, file);
          fs.writeFileSync(yaml, asScriptText(fs.readFileSync(yaml, 'utf8'), indicator));
        }
        assert.equal(await runWith(['pipeline-config']), ExitCode.failed, lines.join('\n'));
        assert.ok(
          lines.some((line) => line.startsWith('FAIL tools/releases/prod-release.yml') && line.includes('EsrpRelease')),
          lines.join('\n'),
        );
        assert.ok(
          lines.some(
            (line) => line.startsWith('FAIL tools/releases/ddl-release.yml') && line.includes('AssetRetention'),
          ),
          lines.join('\n'),
        );
      });
    }

    it('reads a property that follows a script block in the same task', async () => {
      writePipelineConfig(root);
      const prod = path.join(root, 'tools/releases/prod-release.yml');
      fs.writeFileSync(
        prod,
        fs
          .readFileSync(prod, 'utf8')
          .replace(
            "                  productstate: 'Latest'",
            "                  script: |\n                    echo publishing\n                  productstate: 'Latest'",
          ),
      );
      assert.equal(await runWith(['pipeline-config']), ExitCode.passed, lines.join('\n'));
    });

    it('reads the tasks after a block scalar has ended', async () => {
      writePipelineConfig(root);
      const prod = path.join(root, 'tools/releases/prod-release.yml');
      fs.writeFileSync(prod, `steps:\n  - script: |\n      echo hi\njobs:\n${fs.readFileSync(prod, 'utf8')}`);
      assert.equal(await runWith(['pipeline-config']), ExitCode.passed, lines.join('\n'));
    });

    it('reads the real tasks around a script block that mentions other values', async () => {
      writePipelineConfig(root);
      const prod = path.join(root, 'tools/releases/prod-release.yml');
      const script = asScriptText("- task: EsrpRelease@10\n  enabled: false\n  productstate: 'Beta'", '|');
      fs.writeFileSync(prod, `${script}\n${fs.readFileSync(prod, 'utf8')}\n${script}`);
      assert.equal(await runWith(['pipeline-config']), ExitCode.passed, lines.join('\n'));
    });

    it('fails when the SDF publish task says tag latest', async () => {
      writePipelineConfig(root);
      const sdf = path.join(root, 'tools/releases/sdf-release.yml');
      fs.writeFileSync(sdf, fs.readFileSync(sdf, 'utf8').replace('(tag beta)', '(tag latest)'));
      assert.equal(await runWith(['pipeline-config']), ExitCode.failed);
      assert.ok(
        lines.some((line) => line.startsWith('FAIL tools/releases/sdf-release.yml')),
        lines.join('\n'),
      );
    });
  });

  describe('announcement', () => {
    const draft = (version) =>
      [
        `teams-js v${VERSION} has been released to npm and CDN`,
        `https://www.npmjs.com/package/@microsoft/teams-js/v/${version}`,
        `https://res.cdn.office.net/teams-js/${VERSION}/js/MicrosoftTeams.min.js`,
      ].join('\n');

    it('passes when every link names the version', async () => {
      const file = path.join(root, 'announcement.txt');
      fs.writeFileSync(file, draft(VERSION));
      assert.equal(await runWith(['announcement', '--version', VERSION, '--file', file]), ExitCode.passed);
    });

    it('fails when a link names the previous version', async () => {
      const file = path.join(root, 'announcement.txt');
      fs.writeFileSync(file, draft('2.58.0'));
      assert.equal(await runWith(['announcement', '--version', VERSION, '--file', file]), ExitCode.failed);
      assert.ok(
        lines.some((line) => line.startsWith('FAIL') && line.includes('2.58.0')),
        lines.join('\n'),
      );
    });

    it('fails when the npm or CDN link is missing', async () => {
      const file = path.join(root, 'announcement.txt');
      fs.writeFileSync(file, `teams-js v${VERSION} has been released to npm and CDN`);
      assert.equal(await runWith(['announcement', '--version', VERSION, '--file', file]), ExitCode.failed);
    });

    it('reads the version from a link with a query or fragment', async () => {
      const file = path.join(root, 'announcement.txt');
      fs.writeFileSync(
        file,
        [
          `https://www.npmjs.com/package/@microsoft/teams-js/v/${VERSION}?activeTab=versions`,
          `https://res.cdn.office.net/teams-js/${VERSION}/js/MicrosoftTeams.min.js#sri`,
          `https://github.com/OfficeDev/microsoft-teams-library-js/releases/tag/v${VERSION}?x=1`,
        ].join('\n'),
      );
      const argv = ['announcement', '--version', VERSION, '--file', file];
      assert.equal(await runWith(argv), ExitCode.passed, lines.join('\n'));
    });

    it('does not count an SDF CDN link as the Prod CDN link', async () => {
      const file = path.join(root, 'announcement.txt');
      fs.writeFileSync(
        file,
        [
          `https://www.npmjs.com/package/@microsoft/teams-js/v/${VERSION}`,
          `https://res-sdf.cdn.office.net/teams-js/${VERSION}/js/MicrosoftTeams.min.js`,
        ].join('\n'),
      );
      const argv = ['announcement', '--version', VERSION, '--file', file];
      assert.equal(await runWith(argv), ExitCode.failed, lines.join('\n'));
    });

    it('checks a GitHub release link whose owner and repository differ in case', async () => {
      const file = path.join(root, 'announcement.txt');
      fs.writeFileSync(
        file,
        [draft(VERSION), 'https://github.com/officedev/Microsoft-Teams-Library-JS/releases/tag/v2.58.0'].join('\n'),
      );
      const argv = ['announcement', '--version', VERSION, '--file', file];
      assert.equal(await runWith(argv), ExitCode.failed, lines.join('\n'));
      assert.ok(
        lines.some((line) => line.startsWith('FAIL') && line.includes('GitHub release') && line.includes('2.58.0')),
        lines.join('\n'),
      );
    });
    it('ignores a link on another host whose path looks like a release link', async () => {
      const file = path.join(root, 'announcement.txt');
      fs.writeFileSync(
        file,
        [draft(VERSION), 'https://example.com/res.cdn.office.net/teams-js/2.58.0/js/MicrosoftTeams.min.js'].join('\n'),
      );
      const argv = ['announcement', '--version', VERSION, '--file', file];
      assert.equal(await runWith(argv), ExitCode.passed, lines.join('\n'));
    });
  });

  describe('consumed-changes', () => {
    it('passes when no pending change file repeats an entry the release shipped', async () => {
      writeCleanup(root, {
        changelog: RELEASED_CHANGELOG,
        changeFiles: [
          ['@microsoft-teams-js-new.json', 'Added `brandNew` capability.'],
          ['@microsoft-teams-js-released.json', `Released ${VERSION}`, 'none'],
        ],
      });
      assert.equal(
        await runWith(['consumed-changes', '--version', VERSION, '--prep-commit', 'abc1234']),
        ExitCode.passed,
        lines.join('\n'),
      );
    });

    it('fails for each change file the release already consumed, naming it', async () => {
      writeCleanup(root, {
        changelog: RELEASED_CHANGELOG,
        changeFiles: [
          ['@microsoft-teams-js-clipboard.json', 'Added `clipboard.read` permission APIs.'],
          ['@microsoft-teams-js-lna.json', 'Added `localNetworkAccess` permission APIs.  '],
          ['@microsoft-teams-js-origins.json', 'Added Copilot Studio origins to the valid-origins artifact.', 'patch'],
          ['@microsoft-teams-js-new.json', 'Added `brandNew` capability.'],
        ],
      });
      listDeletedChangeFiles = (commit) =>
        commit === 'abc1234'
          ? ['@microsoft-teams-js-clipboard.json', '@microsoft-teams-js-lna.json', '@microsoft-teams-js-origins.json']
          : [];
      const argv = ['consumed-changes', '--version', VERSION, '--prep-commit', 'abc1234'];
      assert.equal(await runWith(argv), ExitCode.failed);
      const failures = lines.filter((line) => line.startsWith('FAIL'));
      assert.equal(failures.length, 3, lines.join('\n'));
      assert.ok(failures.some((line) => line.includes('@microsoft-teams-js-clipboard.json')));
    });

    it('ignores entries from older releases', async () => {
      writeCleanup(root, {
        changelog: RELEASED_CHANGELOG,
        changeFiles: [['@microsoft-teams-js-old.json', 'Added `stageView.self.isCloseResultSupported`.']],
      });
      assert.equal(
        await runWith(['consumed-changes', '--version', VERSION, '--prep-commit', 'abc1234']),
        ExitCode.passed,
        lines.join('\n'),
      );
    });

    it('fails when the CHANGELOG has no section for the version', async () => {
      writeCleanup(root, { changelog: RELEASED_CHANGELOG, changeFiles: [] });
      assert.equal(
        await runWith(['consumed-changes', '--version', '2.60.0', '--prep-commit', 'abc1234']),
        ExitCode.failed,
      );
    });

    it('matches a comment whose whitespace or line breaks differ from the CHANGELOG entry', async () => {
      const wrapped = RELEASED_CHANGELOG.replace(
        '- Added `clipboard.read` permission APIs.',
        '- Added `clipboard.read`\n  permission APIs.',
      );
      writeCleanup(root, {
        changelog: wrapped,
        changeFiles: [['@microsoft-teams-js-clipboard.json', 'Added  `clipboard.read`\npermission APIs.']],
      });
      assert.equal(
        await runWith(['consumed-changes', '--version', VERSION, '--prep-commit', 'abc1234']),
        ExitCode.unreachable,
        lines.join('\n'),
      );
      assert.ok(
        lines.some((line) => line.startsWith('UNREACHABLE change/@microsoft-teams-js-clipboard.json')),
        lines.join('\n'),
      );
    });

    it('with --prep-commit, also fails for a change file the prep PR deleted, even with an edited comment', async () => {
      writeCleanup(root, {
        changelog: RELEASED_CHANGELOG,
        changeFiles: [['@microsoft-teams-js-clipboard.json', 'Added clipboard read APIs (edited).']],
      });
      listDeletedChangeFiles = (commit) => (commit === 'abc1234' ? ['@microsoft-teams-js-clipboard.json'] : []);
      const argv = ['consumed-changes', '--version', VERSION, '--prep-commit', 'abc1234'];
      assert.equal(await runWith(argv), ExitCode.failed, lines.join('\n'));
    });

    it('never tells you to delete a new change whose comment only matches a released entry', async () => {
      writeCleanup(root, {
        changelog: RELEASED_CHANGELOG,
        changeFiles: [['@microsoft-teams-js-new-same-text.json', 'Added `clipboard.read` permission APIs.']],
      });
      listDeletedChangeFiles = (commit) => (commit === 'abc1234' ? ['@microsoft-teams-js-clipboard.json'] : []);
      const argv = ['consumed-changes', '--version', VERSION, '--prep-commit', 'abc1234'];
      assert.equal(await runWith(argv), ExitCode.unreachable, lines.join('\n'));
      assert.ok(
        lines.every((line) => !line.startsWith('FAIL')),
        lines.join('\n'),
      );
      assert.ok(
        lines.some((line) => line.includes('@microsoft-teams-js-new-same-text.json') && line.includes('keep it')),
        lines.join('\n'),
      );
    });

    it('reads a released entry that continues after a blank line', async () => {
      const changelog = RELEASED_CHANGELOG.replace(
        '- Added `localNetworkAccess` permission APIs.',
        '- Added `localNetworkAccess` permission APIs.\n\n  The host must advertise `permissions.lna`.',
      );
      const comment = 'Added `localNetworkAccess` permission APIs.\n\nThe host must advertise `permissions.lna`.';
      writeCleanup(root, { changelog, changeFiles: [['@microsoft-teams-js-lna-2.json', comment]] });
      const argv = ['consumed-changes', '--version', VERSION, '--prep-commit', 'abc1234'];
      assert.equal(await runWith(argv), ExitCode.unreachable, lines.join('\n'));
    });

    it('ends a released entry at the next unindented line', async () => {
      const changelog = RELEASED_CHANGELOG.replace(
        '- Added `localNetworkAccess` permission APIs.\n',
        '- Added `localNetworkAccess` permission APIs.\n\nSome note under the list.\n',
      );
      writeCleanup(root, {
        changelog,
        changeFiles: [
          ['@microsoft-teams-js-new.json', 'Added `localNetworkAccess` permission APIs. Some note under the list.'],
        ],
      });
      const argv = ['consumed-changes', '--version', VERSION, '--prep-commit', 'abc1234'];
      assert.equal(await runWith(argv), ExitCode.passed, lines.join('\n'));
    });

    it('requires --prep-commit, since without it a re-added change file passes', async () => {
      writeCleanup(root, {
        changelog: RELEASED_CHANGELOG,
        changeFiles: [['@microsoft-teams-js-clipboard.json', 'Added clipboard read APIs (edited).']],
      });
      listDeletedChangeFiles = () => ['@microsoft-teams-js-clipboard.json'];
      assert.equal(await runWith(['consumed-changes', '--version', VERSION]), ExitCode.usage, lines.join('\n'));
      assert.match(lines.join('\n'), /--prep-commit <prep PR squash commit> is required/);
    });

    it('rejects a --prep-commit that is not a commit SHA', async () => {
      writeCleanup(root, { changelog: RELEASED_CHANGELOG, changeFiles: [] });
      for (const value of ['HEAD', 'abc12', 'main~1', 'g'.repeat(40)]) {
        lines = [];
        const argv = ['consumed-changes', '--version', VERSION, '--prep-commit', value];
        assert.equal(await runWith(argv), ExitCode.usage, value);
        assert.match(lines.join('\n'), /must be a commit SHA/, value);
      }
    });

    it('is inconclusive when the prep commit deleted no change files, since a real prep commit always does', async () => {
      writeCleanup(root, {
        changelog: RELEASED_CHANGELOG,
        changeFiles: [['@microsoft-teams-js-clipboard.json', 'Added clipboard read APIs (edited).']],
      });
      listDeletedChangeFiles = () => [];
      const argv = ['consumed-changes', '--version', VERSION, '--prep-commit', 'abc1234'];
      assert.equal(await runWith(argv), ExitCode.unreachable, lines.join('\n'));
      assert.ok(
        lines.some((line) => line.startsWith('UNREACHABLE') && line.includes('abc1234') && line.includes('deleted no')),
        lines.join('\n'),
      );
      assert.ok(!lines.some((line) => line.startsWith('PASS')), lines.join('\n'));
    });

    it('is inconclusive, not a crash, when git cannot read the prep commit', async () => {
      writeCleanup(root, { changelog: RELEASED_CHANGELOG, changeFiles: [] });
      listDeletedChangeFiles = () => {
        throw Object.assign(new Error('fatal: bad object abc1234'), { status: 128 });
      };
      const argv = ['consumed-changes', '--version', VERSION, '--prep-commit', 'abc1234'];
      assert.equal(await runWith(argv), ExitCode.unreachable, lines.join('\n'));
      assert.ok(
        lines.some((line) => line.startsWith('UNREACHABLE') && line.includes('bad object')),
        lines.join('\n'),
      );
    });

    it('is inconclusive for a real merge commit, whose combined diff lists no deletions', async () => {
      const git = (...args) =>
        childProcess.execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@example.com', ...args], {
          cwd: root,
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'ignore'],
        });
      writeCleanup(root, {
        changelog: RELEASED_CHANGELOG,
        changeFiles: [['@microsoft-teams-js-clipboard.json', 'Added clipboard read APIs (edited).']],
      });
      git('init', '-q', '-b', 'main');
      git('add', '-A');
      git('commit', '-q', '-m', 'base');
      git('switch', '-q', '-c', 'release');
      git('rm', '-q', 'change/@microsoft-teams-js-clipboard.json');
      git('commit', '-q', '-m', 'prep');
      git('switch', '-q', 'main');
      git('merge', '-q', '--no-ff', '-m', 'merge release', 'release');
      const mergeCommit = git('rev-parse', 'HEAD').trim();
      git('checkout', '-q', 'HEAD~1', '--', 'change/@microsoft-teams-js-clipboard.json');
      listDeletedChangeFiles = undefined;
      const argv = ['consumed-changes', '--version', VERSION, '--prep-commit', mergeCommit];
      assert.equal(await runWith(argv), ExitCode.unreachable, lines.join('\n'));
      lines = [];
      const prepCommit = git('rev-parse', 'release').trim();
      assert.equal(
        await runWith(['consumed-changes', '--version', VERSION, '--prep-commit', prepCommit]),
        ExitCode.failed,
        lines.join('\n'),
      );
    });
  });

  describe('merged-back', () => {
    it('passes when main has the version section in its CHANGELOG', async () => {
      const changelog = `# Change Log - @microsoft/teams-js\n\n## ${VERSION}\n\nWed\n\n## 2.58.0\n`;
      const { fetchImpl } = fakeFetch({ [MAIN_CHANGELOG]: response(200, Buffer.from(changelog)) });
      assert.equal(await runWith(['merged-back', '--version', VERSION], fetchImpl), ExitCode.passed);
    });

    it('fails when main lacks the section, even if a longer version starts the same', async () => {
      const changelog = `# Change Log - @microsoft/teams-js\n\n## ${VERSION}1\n\n## 2.58.0\n`;
      const { fetchImpl } = fakeFetch({ [MAIN_CHANGELOG]: response(200, Buffer.from(changelog)) });
      assert.equal(await runWith(['merged-back', '--version', VERSION], fetchImpl), ExitCode.failed);
    });
  });

  describe('size', () => {
    it('reports bytes and the change from the previous version', async () => {
      const { fetchImpl } = fakeFetch({
        [cdnScriptUrl(VERSION, 'prod')]: response(200, Buffer.alloc(1100)),
        [cdnScriptUrl('2.58.0', 'prod')]: response(200, Buffer.alloc(1000)),
      });
      assert.equal(await runWith(['size', '--version', VERSION, '--previous', '2.58.0'], fetchImpl), 0);
      assert.deepEqual(lines, [`INFO ${VERSION} is 1100 bytes; 2.58.0 was 1000 bytes; change +100 bytes (+10.00%)`]);
    });

    it('fails when either version is missing from the CDN', async () => {
      const { fetchImpl } = fakeFetch({ [cdnScriptUrl(VERSION, 'prod')]: response(200, Buffer.alloc(10)) });
      assert.equal(await runWith(['size', '--version', VERSION, '--previous', '2.58.0'], fetchImpl), 1);
    });

    it('reports a shrink with a minus sign', async () => {
      const { fetchImpl } = fakeFetch({
        [cdnScriptUrl(VERSION, 'prod')]: response(200, Buffer.alloc(900)),
        [cdnScriptUrl('2.58.0', 'prod')]: response(200, Buffer.alloc(1000)),
      });
      assert.equal(await runWith(['size', '--version', VERSION, '--previous', '2.58.0'], fetchImpl), 0);
      assert.deepEqual(lines, [`INFO ${VERSION} is 900 bytes; 2.58.0 was 1000 bytes; change -100 bytes (-10.00%)`]);
    });
  });

  describe('flags, timeouts and help', () => {
    it('is inconclusive, not failed, when a 200 response body stalls', async () => {
      writeRepo(root);
      const published = fakeFetch({
        [cdnScriptUrl(VERSION, 'prod')]: stalledBody(),
        [registryVersion(NPM, VERSION)]: response(200, { version: VERSION }),
      });
      assert.equal(
        await runWith(['published', '--version', VERSION], published.fetchImpl),
        ExitCode.unreachable,
        lines.join('\n'),
      );
      assert.ok(
        lines.some((line) => line.startsWith('UNREACHABLE CDN')),
        lines.join('\n'),
      );
      lines = [];
      const mergedBack = fakeFetch({ [MAIN_CHANGELOG]: stalledBody() });
      assert.equal(await runWith(['merged-back', '--version', VERSION], mergedBack.fetchImpl), ExitCode.unreachable);
      lines = [];
      const size = fakeFetch({
        [cdnScriptUrl(VERSION, 'prod')]: stalledBody(),
        [cdnScriptUrl('2.58.0', 'prod')]: response(200, BUNDLE),
      });
      const argv = ['size', '--version', VERSION, '--previous', '2.58.0'];
      assert.equal(await runWith(argv, size.fetchImpl), ExitCode.unreachable, lines.join('\n'));
    });
    it('rejects unknown or misspelled flags instead of ignoring them', async () => {
      writeRepo(root);
      assert.equal(await runWith(['carriers', '--version', VERSION, '--bogus', 'x']), ExitCode.usage);
      assert.ok(lines.at(-1).includes('--bogus'), lines.join('\n'));
      assert.equal(
        await runWith(['published', '--version', VERSION, '--dist_tag', 'latest']),
        ExitCode.usage,
        lines.join('\n'),
      );
    });

    it('rejects a repeated flag', async () => {
      assert.equal(await runWith(['links', '--version', VERSION, '--version', '2.58.0']), ExitCode.usage);
    });

    it('prints help listing every command, marking optional flags', async () => {
      assert.equal(await runWith(['help']), ExitCode.passed);
      const text = lines.join('\n');
      for (const command of ['check-version', 'published', 'beta-version', 'consumed-changes', 'pipeline-config']) {
        assert.ok(text.includes(command), command);
      }
      assert.ok(text.includes('check-version --version [--registry]'), text);
      assert.ok(text.includes('consumed-changes --version --prep-commit:'), text);
    });

    it('gives every request a timeout and reports a timeout as inconclusive', async () => {
      const seen = [];
      const fetchImpl = async (url, init) => {
        seen.push(init && init.signal);
        const error = new Error('The operation was aborted due to timeout');
        error.name = 'TimeoutError';
        throw error;
      };
      assert.equal(await runWith(['merged-back', '--version', VERSION], fetchImpl), ExitCode.unreachable);
      assert.ok(seen.length > 0 && seen.every((signal) => signal instanceof AbortSignal));
    });
  });

  describe('versions follow SemVer', () => {
    for (const version of ['02.59.0', '2.059.0', '2.59.0-beta..1', '2.59.0-beta.01', '2.59.0-', '2.59.0-beta.1.']) {
      it(`rejects --version ${version}`, async () => {
        assert.equal(await runWith(['links', '--version', version]), ExitCode.usage);
      });
    }

    it('accepts canonical versions', async () => {
      for (const version of ['2.59.0', '2.60.0-beta.0', '2.60.0-beta.10', '10.0.0-rc.1-x']) {
        lines = [];
        assert.equal(await runWith(['links', '--version', version]), ExitCode.passed, version);
      }
    });

    it('orders a numeric prerelease identifier below an alphanumeric one', async () => {
      writeRepo(root);
      const version = '2.60.0-2';
      const { fetchImpl } = fakeFetch({
        [cdnScriptUrl(version, 'prod')]: response(200, BUNDLE),
        ...unreachable(registryVersion(NPM, version), registryTags(NPM)),
        ...jsdelivrRoutes({ versions: [version], tags: { beta: '2.60.0-1alpha' } }),
      });
      const argv = ['published', '--version', version, '--dist-tag', 'beta'];
      assert.equal(await runWith(argv, fetchImpl), ExitCode.failed, lines.join('\n'));
    });
  });

  describe('malformed input never crashes', () => {
    const NPM_TAGS = 'https://registry.npmjs.org/-/package/@microsoft%2fteams-js/dist-tags';

    for (const tag of ['constructor', 'toString', '__proto__', 'hasOwnProperty']) {
      it(`--dist-tag ${tag} is a clean result, not a crash`, async () => {
        writeRepo(root);
        const { fetchImpl } = fakeFetch({
          [cdnScriptUrl(VERSION, 'prod')]: response(200, BUNDLE),
          [`https://registry.npmjs.org/@microsoft%2fteams-js/${VERSION}`]: response(200, { version: VERSION }),
          [NPM_TAGS]: response(200, { latest: VERSION }),
        });
        const code = await runWith(['published', '--version', VERSION, '--dist-tag', tag], fetchImpl);
        assert.ok([ExitCode.failed, ExitCode.unreachable].includes(code), `${code}\n${lines.join('\n')}`);
      });
    }

    it('rejects --__proto__ as an unknown flag instead of dropping it', async () => {
      assert.equal(await runWith(['links', '--version', VERSION, '--__proto__', 'x']), ExitCode.usage);
    });

    for (const [name, source, message] of [
      ['not JSON', 'not json', /not valid JSON/],
      ['validOrigins an object', '{"validOrigins": {}}', /validOrigins/],
      ['null', 'null', /validOrigins/],
    ]) {
      it(`fails cleanly when the source valid-domains file is ${name}`, async () => {
        writeRepo(root);
        fs.writeFileSync(path.join(root, 'packages/teams-js/src/artifactsForCDN/validDomains.json'), source);
        const { fetchImpl } = fakeFetch({ [validDomainsUrl('prod')]: response(200, DOMAINS) });
        assert.equal(await runWith(['domains'], fetchImpl), ExitCode.failed, lines.join('\n'));
        assert.match(lines.join('\n'), message);
      });
    }

    it('reads a change file with a UTF-8 BOM', async () => {
      writeCleanup(root, { changelog: RELEASED_CHANGELOG, changeFiles: [] });
      const body = { type: 'minor', comment: 'Added `clipboard.read` permission APIs.' };
      fs.writeFileSync(path.join(root, 'change', 'bom.json'), `\ufeff${JSON.stringify(body)}`);
      const argv = ['consumed-changes', '--version', VERSION, '--prep-commit', 'abc1234'];
      assert.equal(await runWith(argv), ExitCode.unreachable, lines.join('\n'));
    });

    for (const [name, text] of [
      ['malformed JSON', '{oops'],
      ['null', 'null'],
      ['an object with no comment', '{}'],
      ['a non-string comment', '{"comment": 5}'],
    ]) {
      it(`fails naming a change file that is ${name}`, async () => {
        writeCleanup(root, { changelog: RELEASED_CHANGELOG, changeFiles: [] });
        fs.writeFileSync(path.join(root, 'change', 'bad.json'), text);
        const argv = ['consumed-changes', '--version', VERSION, '--prep-commit', 'abc1234'];
        assert.equal(await runWith(argv), ExitCode.failed, lines.join('\n'));
        assert.ok(
          lines.some((line) => line.startsWith('FAIL') && line.includes('bad.json')),
          lines.join('\n'),
        );
      });
    }

    it('reads a package.json with a UTF-8 BOM', async () => {
      writeRepo(root);
      const file = path.join(root, 'packages/teams-js/package.json');
      fs.writeFileSync(file, `\ufeff${fs.readFileSync(file, 'utf8')}`);
      assert.equal(await runWith(['carriers', '--version', VERSION]), ExitCode.passed, lines.join('\n'));
    });

    it('fails naming a package.json that is not JSON', async () => {
      writeRepo(root);
      fs.writeFileSync(path.join(root, 'packages/teams-js/package.json'), 'null');
      assert.equal(await runWith(['carriers', '--version', VERSION]), ExitCode.failed, lines.join('\n'));
    });

    for (const thrown of [null, undefined, 'boom', 42]) {
      it(`reports a fetch that throws ${String(thrown)} as inconclusive`, async () => {
        const fetchImpl = async () => {
          throw thrown;
        };
        assert.equal(await runWith(['merged-back', '--version', VERSION], fetchImpl), ExitCode.unreachable);
      });
    }
  });
  describe('a 404 or 200 that is not from the origin', () => {
    for (const [name, body] of [
      ['unrelated JSON', { error: 'upstream unavailable' }],
      ['an unrelated JSON string', '"upstream unavailable"'],
      ['null', 'null'],
      ['an empty object', {}],
    ]) {
      it(`check-version is inconclusive when the registry 404 is ${name}`, async () => {
        const { fetchImpl } = fakeFetch({ [registryVersion(NPM, '2.60.0')]: response(404, body) });
        assert.equal(await runWith(['check-version', '--version', '2.60.0'], fetchImpl), ExitCode.unreachable);
      });

      it(`check-version is inconclusive when the GitHub tag 404 is ${name}`, async () => {
        const { fetchImpl } = fakeFetch({ [`${GITHUB_REPO_API}/git/ref/tags/v2.60.0`]: response(404, body) });
        assert.equal(await runWith(['check-version', '--version', '2.60.0'], fetchImpl), ExitCode.unreachable);
      });
    }

    it('published is inconclusive when the CDN 404 is not a blob-not-found answer', async () => {
      writeRepo(root);
      const { fetchImpl } = fakeFetch({
        [cdnScriptUrl(VERSION, 'prod')]: response(404, HTML_404),
        [registryVersion(NPM, VERSION)]: response(200, { version: VERSION }),
      });
      assert.equal(
        await runWith(['published', '--version', VERSION], fetchImpl),
        ExitCode.unreachable,
        lines.join('\n'),
      );
    });

    it('size is inconclusive when the CDN 404 is not a blob-not-found answer', async () => {
      const { fetchImpl } = fakeFetch({
        [cdnScriptUrl(VERSION, 'prod')]: response(404, HTML_404),
        [cdnScriptUrl('2.58.0', 'prod')]: response(200, BUNDLE),
      });
      assert.equal(
        await runWith(['size', '--version', VERSION, '--previous', '2.58.0'], fetchImpl),
        ExitCode.unreachable,
        lines.join('\n'),
      );
    });

    it('check-version is inconclusive when the registry 404 is an HTML page', async () => {
      const { fetchImpl } = fakeFetch({
        [registryVersion(NPM, '2.60.0')]: response(404, HTML_404),
      });
      assert.equal(await runWith(['check-version', '--version', '2.60.0'], fetchImpl), ExitCode.unreachable);
    });

    it('check-version is inconclusive when the Prod CDN 404 is not a blob-not-found answer', async () => {
      const { fetchImpl } = fakeFetch({
        [cdnScriptUrl('2.60.0', 'prod')]: response(404, HTML_404),
      });
      assert.equal(await runWith(['check-version', '--version', '2.60.0'], fetchImpl), ExitCode.unreachable);
      assert.ok(
        lines.some((line) => line.startsWith('UNREACHABLE Prod CDN')),
        lines.join('\n'),
      );
    });

    it('check-version is inconclusive when the GitHub tag 404 is not GitHub JSON', async () => {
      const { fetchImpl } = fakeFetch({
        [`${GITHUB_REPO_API}/git/ref/tags/v2.60.0`]: response(404, HTML_404),
      });
      assert.equal(await runWith(['check-version', '--version', '2.60.0'], fetchImpl), ExitCode.unreachable);
    });

    it('check-version still passes on the real 404 answers', async () => {
      const { fetchImpl } = fakeFetch({});
      assert.equal(
        await runWith(['check-version', '--version', '2.60.0'], fetchImpl),
        ExitCode.passed,
        lines.join('\n'),
      );
    });

    it('github-release is inconclusive when a release 404 is an HTML page', async () => {
      const routes = githubRoutes({ prerelease: true });
      routes[`${GITHUB_REPO_API}/releases/tags/v${VERSION}`] = response(404, HTML_404);
      const { fetchImpl } = fakeFetch(routes);
      const argv = ['github-release', '--version', VERSION, '--expect', 'prerelease'];
      assert.equal(await runWith(argv, fetchImpl), ExitCode.unreachable, lines.join('\n'));
    });

    it('merged-back is inconclusive when a 200 is not the CHANGELOG', async () => {
      const { fetchImpl } = fakeFetch({ [MAIN_CHANGELOG]: response(200, HTML_404) });
      assert.equal(await runWith(['merged-back', '--version', VERSION], fetchImpl), ExitCode.unreachable);
    });

    it('is inconclusive for a malformed GitHub ref', async () => {
      const routes = githubRoutes({ prerelease: true });
      routes[`${GITHUB_REPO_API}/git/ref/tags/v${VERSION}`] = response(200, { object: { type: 'commit', sha: 'zz' } });
      const { fetchImpl } = fakeFetch(routes);
      const argv = ['github-release', '--version', VERSION, '--expect', 'prerelease'];
      assert.equal(await runWith(argv, fetchImpl), ExitCode.unreachable, lines.join('\n'));
    });
  });

  describe('preflight', () => {
    const MAIN_CI_RUNS = `${GITHUB_REPO_API}/actions/workflows/main.yml/runs?branch=main&event=push&status=completed&per_page=1`;
    const RUN_URL = 'https://github.com/OfficeDev/microsoft-teams-library-js/actions/runs/1';
    const ciRun = (conclusion) =>
      response(200, { workflow_runs: [{ conclusion, html_url: RUN_URL, head_sha: 'b'.repeat(40) }] });
    const healthy = (extra = {}) =>
      fakeFetch({
        [registryTags(NPM)]: response(200, { latest: '2.58.0', beta: '2.59.0-beta.0' }),
        [MAIN_CI_RUNS]: ciRun('success'),
        ...extra,
      });
    const setUp = ({ changeFiles = [['@microsoft-teams-js-new.json', 'Added `brandNew`.', 'minor']] } = {}) => {
      writeRepo(root, { version: '2.58.0' });
      writePipelineConfig(root);
      writeCleanup(root, { changelog: RELEASED_CHANGELOG, changeFiles });
    };

    it('passes with a pending bump, good pipeline YAML, a reachable registry and green CI', async () => {
      setUp();
      assert.equal(await runWith(['preflight'], healthy().fetchImpl), ExitCode.passed, lines.join('\n'));
      const text = lines.join('\n');
      assert.match(text, /^PASS 1 pending change file \(minor 1\)/m);
      assert.match(text, /^INFO the pending change files bump 2\.58\.0 to 2\.59\.0/m);
      assert.match(text, /^INFO npm .*latest 2\.58\.0, beta 2\.59\.0-beta\.0/m);
      assert.match(text, /^PASS .*main\.yml.*succeeded/m);
      assert.match(text, /^INFO not checked here: .*Lockbox/m);
    });

    it('fails when there are no pending change files', async () => {
      setUp({ changeFiles: [] });
      assert.equal(await runWith(['preflight'], healthy().fetchImpl), ExitCode.failed, lines.join('\n'));
      assert.ok(
        lines.some((line) => line.startsWith('FAIL') && line.includes('nothing to release')),
        lines.join('\n'),
      );
    });

    it('fails when the change folder is missing', async () => {
      setUp({ changeFiles: [] });
      fs.rmSync(path.join(root, 'change'), { recursive: true });
      assert.equal(await runWith(['preflight'], healthy().fetchImpl), ExitCode.failed, lines.join('\n'));
    });

    it('fails when every pending change file is type none', async () => {
      setUp({ changeFiles: [['@microsoft-teams-js-released.json', 'Released 2.58.0', 'none']] });
      assert.equal(await runWith(['preflight'], healthy().fetchImpl), ExitCode.failed, lines.join('\n'));
      assert.ok(
        lines.some((line) => line.startsWith('FAIL') && line.includes('none')),
        lines.join('\n'),
      );
    });

    it('takes the highest bump across change files', async () => {
      setUp({
        changeFiles: [
          ['@microsoft-teams-js-a.json', 'A fix.', 'patch'],
          ['@microsoft-teams-js-b.json', 'A feature.', 'minor'],
          ['@microsoft-teams-js-c.json', 'Released 2.58.0', 'none'],
        ],
      });
      assert.equal(await runWith(['preflight'], healthy().fetchImpl), ExitCode.passed, lines.join('\n'));
      assert.match(lines.join('\n'), /^PASS 3 pending change files \(minor 1, none 1, patch 1\)/m);
      assert.match(lines.join('\n'), /bump 2\.58\.0 to 2\.59\.0/);
    });

    it('bumps a patch the way beachball does', async () => {
      setUp({ changeFiles: [['@microsoft-teams-js-a.json', 'A fix.', 'patch']] });
      assert.equal(await runWith(['preflight'], healthy().fetchImpl), ExitCode.passed, lines.join('\n'));
      assert.match(lines.join('\n'), /bump 2\.58\.0 to 2\.58\.1/);
    });

    for (const type of ['major', 'prerelease']) {
      it(`fails a ${type} change file, which beachball.config.js disallows`, async () => {
        setUp({ changeFiles: [['@microsoft-teams-js-a.json', 'Breaking.', type]] });
        assert.equal(await runWith(['preflight'], healthy().fetchImpl), ExitCode.failed, lines.join('\n'));
        assert.ok(
          lines.some((line) => line.startsWith('FAIL') && line.includes(type) && line.includes('beachball.config.js')),
          lines.join('\n'),
        );
        assert.ok(!lines.some((line) => line.includes('3.0.0')), lines.join('\n'));
      });
    }

    const changeFile = (fields) =>
      JSON.stringify({
        type: 'minor',
        comment: 'x',
        packageName: '@microsoft/teams-js',
        dependentChangeType: 'patch',
        ...fields,
      });
    for (const [name, contents] of [
      ['not JSON', '{ "type": '],
      ['an unknown type', changeFile({ type: 'feature' })],
      ['a prototype key as its type', changeFile({ type: '__proto__' })],
      ['toString as its type', changeFile({ type: 'toString' })],
      ['an array', '[]'],
      ['null', 'null'],
      ['missing its package name', changeFile({ packageName: undefined })],
      ['for another package', changeFile({ packageName: '@microsoft/other' })],
      ['missing its comment', changeFile({ comment: undefined })],
      ['missing its dependentChangeType', changeFile({ dependentChangeType: undefined })],
      ['an unknown dependentChangeType', changeFile({ dependentChangeType: 'sometimes' })],
      ['a grouped change file', JSON.stringify({ changes: [JSON.parse(changeFile({}))] })],
    ]) {
      it(`fails, naming the file, when a change file is ${name}`, async () => {
        setUp();
        fs.writeFileSync(path.join(root, 'change', '@microsoft-teams-js-bad.json'), contents);
        assert.equal(await runWith(['preflight'], healthy().fetchImpl), ExitCode.failed, lines.join('\n'));
        assert.ok(
          lines.some((line) => line.startsWith('FAIL') && line.includes('@microsoft-teams-js-bad.json')),
          lines.join('\n'),
        );
      });
    }

    it('fails cleanly, naming it, when a folder in change/ is named like a change file', async () => {
      setUp();
      fs.mkdirSync(path.join(root, 'change', 'odd.json'));
      assert.equal(await runWith(['preflight'], healthy().fetchImpl), ExitCode.failed, lines.join('\n'));
      assert.ok(
        lines.some((line) => line.startsWith('FAIL') && line.includes('change/odd.json')),
        lines.join('\n'),
      );
    });

    it('fails when the checkout is already on a prerelease version', async () => {
      setUp();
      writeRepo(root, { version: '2.59.0-beta.0' });
      assert.equal(await runWith(['preflight'], healthy().fetchImpl), ExitCode.failed, lines.join('\n'));
      assert.ok(
        lines.some((line) => line.startsWith('FAIL') && line.includes('2.59.0-beta.0')),
        lines.join('\n'),
      );
      assert.ok(!lines.some((line) => line.includes('bump 2.59.0-beta.0')), lines.join('\n'));
    });

    it('ignores files in the change folder that are not JSON', async () => {
      setUp();
      fs.writeFileSync(path.join(root, 'change', 'README.md'), 'notes');
      assert.equal(await runWith(['preflight'], healthy().fetchImpl), ExitCode.passed, lines.join('\n'));
    });

    it('fails when the pipeline YAML would publish Prod with the wrong tag', async () => {
      setUp();
      writePipelineConfig(root, { prodTag: 'beta' });
      assert.equal(await runWith(['preflight'], healthy().fetchImpl), ExitCode.failed, lines.join('\n'));
    });

    it('fails, with the run link, when the latest completed main CI run did not succeed', async () => {
      setUp();
      const { fetchImpl } = healthy({ [MAIN_CI_RUNS]: ciRun('failure') });
      assert.equal(await runWith(['preflight'], fetchImpl), ExitCode.failed, lines.join('\n'));
      const failure = lines.find((line) => line.startsWith('FAIL') && line.includes('ended failure'));
      assert.ok(failure, lines.join('\n'));
      assert.equal(/\((https:\/\/[^)\s]+)\)/.exec(failure)?.[1], RUN_URL, failure);
    });

    for (const [name, body] of [
      ['no runs', { workflow_runs: [] }],
      ['a malformed run list', { workflow_runs: 'x' }],
      ['a run without a conclusion', { workflow_runs: [{ html_url: RUN_URL }] }],
    ]) {
      it(`is inconclusive when the CI answer has ${name}`, async () => {
        setUp();
        const { fetchImpl } = healthy({ [MAIN_CI_RUNS]: response(200, body) });
        assert.equal(await runWith(['preflight'], fetchImpl), ExitCode.unreachable, lines.join('\n'));
      });
    }

    it('is inconclusive, not failed, when the npm registry cannot be reached', async () => {
      setUp();
      const { fetchImpl } = healthy(unreachable(registryTags(NPM)));
      assert.equal(await runWith(['preflight'], fetchImpl), ExitCode.unreachable, lines.join('\n'));
      assert.ok(
        lines.some((line) => line.startsWith('UNREACHABLE') && line.includes('dist-tags')),
        lines.join('\n'),
      );
    });

    it('is inconclusive when the registry answers without a latest version', async () => {
      setUp();
      const { fetchImpl } = healthy({ [registryTags(NPM)]: response(200, { latest: 42 }) });
      assert.equal(await runWith(['preflight'], fetchImpl), ExitCode.unreachable, lines.join('\n'));
    });

    it('with --registry, still needs registry.npmjs.org; the proxy alone never passes', async () => {
      setUp();
      const { fetchImpl, requested } = healthy({
        ...unreachable(registryTags(NPM)),
        [registryTags(PROXY)]: response(200, { latest: '2.58.0' }),
      });
      assert.equal(
        await runWith(['preflight', '--registry', PROXY], fetchImpl),
        ExitCode.unreachable,
        lines.join('\n'),
      );
      assert.ok(requested.includes(registryTags(NPM)), requested.join('\n'));
      assert.ok(
        lines.some((line) => line.startsWith('INFO') && line.includes('(proxy)') && line.includes('2.58.0')),
        lines.join('\n'),
      );
    });

    it('with --version, passes when the version is free and its release branch does not exist', async () => {
      setUp();
      const { fetchImpl, requested } = healthy();
      assert.equal(await runWith(['preflight', '--version', '2.59.0'], fetchImpl), ExitCode.passed, lines.join('\n'));
      assert.ok(requested.includes(`${GITHUB_REPO_API}/git/ref/heads/release/2.59.0`), requested.join('\n'));
      assert.ok(requested.includes(cdnScriptUrl('2.59.0', 'prod')), requested.join('\n'));
    });

    it('with --version, fails when release/<v> already exists', async () => {
      setUp();
      const { fetchImpl } = healthy({
        [`${GITHUB_REPO_API}/git/ref/heads/release/2.59.0`]: response(200, { name: 'release/2.59.0' }),
      });
      assert.equal(await runWith(['preflight', '--version', '2.59.0'], fetchImpl), ExitCode.failed, lines.join('\n'));
      assert.ok(
        lines.some((line) => line.startsWith('FAIL') && line.includes('release/2.59.0')),
        lines.join('\n'),
      );
    });

    it('with --version, fails when it is not the version the change files produce', async () => {
      setUp();
      const argv = ['preflight', '--version', '2.58.1'];
      assert.equal(await runWith(argv, healthy().fetchImpl), ExitCode.failed, lines.join('\n'));
      assert.ok(
        lines.some((line) => line.startsWith('FAIL') && line.includes('2.58.1') && line.includes('2.59.0')),
        lines.join('\n'),
      );
    });

    it('with --version, fails when the version is already on npm', async () => {
      setUp();
      const { fetchImpl } = healthy({ [registryVersion(NPM, '2.59.0')]: response(200, { version: '2.59.0' }) });
      assert.equal(await runWith(['preflight', '--version', '2.59.0'], fetchImpl), ExitCode.failed, lines.join('\n'));
    });

    it('rejects a beta --version; a Prod pre-flight is for a release version', async () => {
      setUp();
      assert.equal(await runWith(['preflight', '--version', '2.59.0-beta.0']), ExitCode.usage, lines.join('\n'));
    });

    it('needs a checkout', async () => {
      const code = await run(['preflight'], { repoRoot: undefined, fetchImpl: throwingFetch, log, env });
      assert.equal(code, ExitCode.usage);
    });
  });

  describe('announcement-draft', () => {
    const write = (changelog) => {
      fs.mkdirSync(path.join(root, 'packages', 'teams-js'), { recursive: true });
      fs.writeFileSync(path.join(root, 'packages', 'teams-js', 'CHANGELOG.md'), changelog);
    };
    const draftOf = () => {
      const start = lines.findIndex((line) => line.startsWith('INFO announcement draft'));
      assert.ok(start !== -1, lines.join('\n'));
      return lines[start].split('\n').slice(1).join('\n');
    };

    it('drafts the announcement from the CHANGELOG section, and its links pass the announcement check', async () => {
      write(RELEASED_CHANGELOG);
      assert.equal(await runWith(['announcement-draft', '--version', VERSION]), ExitCode.passed, lines.join('\n'));
      const draft = draftOf();
      const links = publicLinks(VERSION);
      assert.ok(draft.startsWith(`TeamsJS v${VERSION} Release\n`), draft);
      assert.ok(draft.includes(`teams-js v${VERSION} has been released to npm and CDN`), draft);
      for (const url of Object.values(links)) {
        assert.ok(draft.includes(url), url);
      }
      assert.ok(
        draft.includes(
          'Minor changes\n- Added `clipboard.read` permission APIs.\n- Added `localNetworkAccess` permission APIs.',
        ),
        draft,
      );
      assert.ok(draft.includes('Patches\n- Added Copilot Studio origins to the valid-origins artifact.'), draft);
      assert.ok(!draft.includes('stageView'), 'took an entry from the next section');
      assert.ok(!draft.includes('GMT'), 'copied the date line');
      assert.ok(
        lines.some((line) => line === `PASS every npm link names ${VERSION}`),
        lines.join('\n'),
      );
    });

    it('fails when the CHANGELOG has no section for the version', async () => {
      write(RELEASED_CHANGELOG);
      assert.equal(await runWith(['announcement-draft', '--version', '2.60.0']), ExitCode.failed, lines.join('\n'));
      assert.ok(
        lines.some((line) => line.startsWith('FAIL') && line.includes('## 2.60.0')),
        lines.join('\n'),
      );
      assert.ok(!lines.some((line) => line.startsWith('INFO announcement draft')), lines.join('\n'));
    });

    it('fails when the section has no entries', async () => {
      write(
        ['# Change Log - @microsoft/teams-js', '', `## ${VERSION}`, '', 'Wed, 04 Nov 2026', '', '## 2.58.0'].join('\n'),
      );
      assert.equal(await runWith(['announcement-draft', '--version', VERSION]), ExitCode.failed, lines.join('\n'));
    });

    it('keeps an indented heading and what follows it in the entry', async () => {
      write(
        [
          `## ${VERSION}`,
          '### Minor changes',
          '- Added `newApi`.',
          '  #### Migration',
          '  Call `newApi` instead of `oldApi`, see https://www.npmjs.com/package/@microsoft/teams-js/v/2.58.0',
          '## 2.58.0',
        ].join('\n'),
      );
      assert.equal(await runWith(['announcement-draft', '--version', VERSION]), ExitCode.failed, lines.join('\n'));
      const draft = draftOf();
      assert.ok(draft.includes('#### Migration Call `newApi` instead of `oldApi`'), draft);
    });

    it('fails on an unexpected heading at the start of a line inside the section', async () => {
      write([`## ${VERSION}`, '### Patches', '- A fix.', '#### Notes', '- Lost note.', '## 2.58.0'].join('\n'));
      assert.equal(await runWith(['announcement-draft', '--version', VERSION]), ExitCode.failed, lines.join('\n'));
      assert.ok(
        lines.some((line) => line.startsWith('FAIL') && line.includes('#### Notes')),
        lines.join('\n'),
      );
      assert.ok(!lines.some((line) => line.startsWith('INFO announcement draft')), lines.join('\n'));
    });

    it('fails on a column-0 ## heading inside a multiline comment instead of ending the section there', async () => {
      write(
        [
          `## ${VERSION}`,
          '### Minor changes',
          '- Added `newApi`.',
          '## Migration',
          'Call `newApi` instead of `oldApi`.',
          '### Patches',
          '- A later fix.',
          '## 2.58.0',
        ].join('\n'),
      );
      assert.equal(await runWith(['announcement-draft', '--version', VERSION]), ExitCode.failed, lines.join('\n'));
      assert.ok(
        lines.some((line) => line.startsWith('FAIL') && line.includes('## Migration')),
        lines.join('\n'),
      );
      assert.ok(!lines.some((line) => line.startsWith('INFO announcement draft')), lines.join('\n'));
    });

    it('ends the section at a prerelease version heading', async () => {
      write([`## ${VERSION}`, '### Patches', '- A fix.', '## 2.58.0-beta.1', '### Patches', '- Beta fix.'].join('\n'));
      assert.equal(await runWith(['announcement-draft', '--version', VERSION]), ExitCode.passed, lines.join('\n'));
      assert.ok(!draftOf().includes('Beta fix.'), draftOf());
    });

    it('keeps a second paragraph that beachball writes at column 0, and checks its links', async () => {
      write(
        [
          `## ${VERSION}`,
          '',
          'Wed, 04 Nov 2026 19:13:09 GMT',
          '',
          '### Minor changes',
          '',
          '- Added `newApi`.',
          '',
          'Call `newApi` instead of `oldApi`, see https://www.npmjs.com/package/@microsoft/teams-js/v/2.58.0',
          '- Another change.',
          '',
          '## 2.58.0',
        ].join('\n'),
      );
      assert.equal(await runWith(['announcement-draft', '--version', VERSION]), ExitCode.failed, lines.join('\n'));
      const draft = draftOf();
      assert.ok(draft.includes('- Added `newApi`. Call `newApi` instead of `oldApi`'), draft);
      assert.ok(draft.includes('- Another change.'), draft);
    });

    for (const [name, section] of [
      ['under a heading before any entry', ['### Patches', '', 'A loose note.', '- A fix.']],
      ['before the first ### heading', ['', 'Wed, 04 Nov 2026', '', 'A loose note.', '', '### Patches', '- A fix.']],
    ]) {
      it(`fails on text that belongs to no entry ${name}`, async () => {
        write([`## ${VERSION}`, ...section, '## 2.58.0'].join('\n'));
        assert.equal(await runWith(['announcement-draft', '--version', VERSION]), ExitCode.failed, lines.join('\n'));
        assert.ok(
          lines.some((line) => line.startsWith('FAIL') && line.includes('A loose note.')),
          lines.join('\n'),
        );
        assert.ok(!lines.some((line) => line.startsWith('INFO announcement draft')), lines.join('\n'));
      });
    }

    it('fails instead of dropping an entry that sits before the first ### heading', async () => {
      write([`## ${VERSION}`, '- Orphan entry.', '### Patches', '- Ordinary fix.', '## 2.58.0'].join('\n'));
      assert.equal(await runWith(['announcement-draft', '--version', VERSION]), ExitCode.failed, lines.join('\n'));
      assert.ok(!lines.some((line) => line.startsWith('INFO announcement draft')), lines.join('\n'));
    });

    it('only takes a version heading at the start of a line, allowing trailing spaces', async () => {
      write(
        [
          '## 2.60.0',
          '### Patches',
          '- Prior entry',
          `  ## ${VERSION}`,
          '  continuation',
          '### Patches',
          '- Wrongly captured.',
          `## ${VERSION}  `,
          '### Patches',
          '- The real entry.',
          '## 2.58.0',
        ].join('\n'),
      );
      assert.equal(await runWith(['announcement-draft', '--version', VERSION]), ExitCode.passed, lines.join('\n'));
      const draft = draftOf();
      assert.ok(draft.includes('- The real entry.'), draft);
      assert.ok(!draft.includes('Wrongly captured'), draft);
    });

    it('keeps every heading in order and joins an entry that wraps or has a second paragraph', async () => {
      write(
        [
          `## ${VERSION}`,
          '',
          '### Major changes',
          '',
          '- Removed `legacy`.',
          '',
          '### Patches',
          '',
          '- Fixed a race',
          '  in `app.initialize`.',
          '',
          '  It only affected hosts that reply twice.',
          '- Another fix.',
          '',
          '## 2.58.0',
        ].join('\r\n'),
      );
      assert.equal(await runWith(['announcement-draft', '--version', VERSION]), ExitCode.passed, lines.join('\n'));
      const draft = draftOf();
      assert.ok(
        draft.includes(
          'Major changes\n- Removed `legacy`.\n\nPatches\n' +
            '- Fixed a race in `app.initialize`. It only affected hosts that reply twice.\n- Another fix.',
        ),
        draft,
      );
      assert.ok(!draft.includes('\r'), 'kept a carriage return');
    });

    it('fails the draft when a CHANGELOG entry links another version', async () => {
      write(
        RELEASED_CHANGELOG.replace(
          '- Added `localNetworkAccess` permission APIs.',
          '- Added `localNetworkAccess` (see https://www.npmjs.com/package/@microsoft/teams-js/v/2.58.0).',
        ),
      );
      assert.equal(await runWith(['announcement-draft', '--version', VERSION]), ExitCode.failed, lines.join('\n'));
      assert.ok(
        lines.some((line) => line.startsWith('FAIL') && line.includes('2.58.0')),
        lines.join('\n'),
      );
    });

    it('rejects a beta version; betas are never announced', async () => {
      write(RELEASED_CHANGELOG);
      assert.equal(await runWith(['announcement-draft', '--version', '2.60.0-beta.0']), ExitCode.usage);
    });

    it('needs a checkout', async () => {
      const code = await run(['announcement-draft', '--version', VERSION], {
        repoRoot: undefined,
        fetchImpl: throwingFetch,
        log,
        env,
      });
      assert.equal(code, ExitCode.usage);
    });
  });

  describe('links and usage', () => {
    it('prints the public links only', async () => {
      assert.equal(await runWith(['links', '--version', VERSION]), ExitCode.passed);
      assert.deepEqual(publicLinks(VERSION), {
        npm: `https://www.npmjs.com/package/@microsoft/teams-js/v/${VERSION}`,
        cdn: `https://res.cdn.office.net/teams-js/${VERSION}/js/MicrosoftTeams.min.js`,
        githubRelease: `https://github.com/OfficeDev/microsoft-teams-library-js/releases/tag/v${VERSION}`,
      });
    });

    it('prints the SRI of a file', async () => {
      const file = path.join(root, 'MicrosoftTeams.min.js');
      fs.writeFileSync(file, BUNDLE);
      assert.equal(await runWith(['sri', '--file', file]), ExitCode.passed);
      assert.deepEqual(lines, [`INFO ${BUNDLE_SRI} ${file}`]);
      assert.equal(await runWith(['sri']), ExitCode.usage);
    });

    it('rejects unknown commands and dangling flags', async () => {
      assert.equal(await runWith(['publish', '--version', VERSION]), ExitCode.usage);
      assert.equal(await runWith(['carriers', '--version']), ExitCode.usage);
      assert.equal(await runWith(['constructor']), ExitCode.usage);
    });
  });

  describe('which checkout', () => {
    const runOutside = (argv, fetchImpl = throwingFetch) =>
      run(argv, { repoRoot: undefined, fetchImpl, log, env, listDeletedChangeFiles });

    it('gives a usage error for a checkout command run outside a checkout', async () => {
      for (const argv of [
        ['carriers', '--version', VERSION],
        ['domains'],
        ['pipeline-config'],
        ['consumed-changes', '--version', VERSION, '--prep-commit', 'abc1234'],
        ['published', '--version', VERSION],
      ]) {
        lines = [];
        assert.equal(await runOutside(argv), ExitCode.usage, argv.join(' '));
        assert.match(lines.join('\n'), /^USAGE \S+ reads the checkout; run it inside a microsoft-teams-library-js/);
      }
    });

    it('still checks a release with an explicit SRI outside a checkout', async () => {
      const { fetchImpl } = fakeFetch({
        [cdnScriptUrl(VERSION, 'prod')]: response(200, BUNDLE),
        [`https://registry.npmjs.org/@microsoft%2fteams-js/${VERSION}`]: response(200, { version: VERSION }),
      });
      const argv = ['published', '--version', VERSION, '--expected-sri', BUNDLE_SRI];
      assert.equal(await runOutside(argv, fetchImpl), ExitCode.passed, lines.join('\n'));
    });

    it('gives a usage error, not a crash, when a checkout file is missing', async () => {
      assert.equal(await runWith(['carriers', '--version', VERSION]), ExitCode.usage);
      assert.match(lines.join('\n'), /^USAGE cannot read .*package\.json; run inside a microsoft-teams-library-js/);
    });

    it('gives a usage error, not a crash, when --file does not exist', async () => {
      const file = path.join(root, 'missing.txt');
      assert.equal(await runWith(['announcement', '--version', VERSION, '--file', file]), ExitCode.usage);
      assert.match(lines.join('\n'), /^USAGE cannot read .*missing\.txt/);
    });

    it('resolves the checkout from the working directory with git', () => {
      const calls = [];
      const runGit = (args, options) => {
        calls.push({ args, cwd: options.cwd });
        return '/work/microsoft-teams-library-js\n';
      };
      assert.equal(
        resolveRepoRoot('/work/microsoft-teams-library-js/packages', runGit),
        '/work/microsoft-teams-library-js',
      );
      assert.deepEqual(calls, [
        { args: ['rev-parse', '--show-toplevel'], cwd: '/work/microsoft-teams-library-js/packages' },
      ]);
      const notARepository = () => {
        throw new Error('fatal: not a git repository');
      };
      assert.equal(resolveRepoRoot('/tmp', notARepository), undefined);
    });

    it('checks the checkout it runs in, even from a copy of the script elsewhere', () => {
      const script = path.join(root, 'elsewhere', 'check-release.js');
      fs.mkdirSync(path.dirname(script), { recursive: true });
      fs.copyFileSync(path.join(__dirname, 'check-release.js'), script);
      const checkout = path.join(root, 'checkout');
      writeRepo(checkout);
      childProcess.execFileSync('git', ['init', '-q'], { cwd: checkout });
      const spawn = (cwd) =>
        childProcess.spawnSync(process.execPath, [script, 'carriers', '--version', VERSION], {
          cwd,
          encoding: 'utf8',
          env: { ...process.env, GIT_CEILING_DIRECTORIES: root },
        });

      const inside = spawn(path.join(checkout, 'packages'));
      assert.equal(inside.status, ExitCode.passed, inside.stdout + inside.stderr);

      const outside = spawn(path.join(root, 'elsewhere'));
      assert.equal(outside.status, ExitCode.usage, outside.stdout + outside.stderr);
      assert.match(outside.stdout, /^USAGE carriers reads the checkout/);
      assert.equal(outside.stderr, '');
    });
  });
});
