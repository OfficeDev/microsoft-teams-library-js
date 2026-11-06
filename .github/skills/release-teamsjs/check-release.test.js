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

function writeRepo(root, { version = VERSION, integrity = BUNDLE_SRI, htmlIntegrity = integrity } = {}) {
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
      `<script src="https://res.cdn.office.net/teams-js/${version}/js/MicrosoftTeams.min.js"`,
      `  integrity="${integrity}"`,
      `<script src="node_modules/@microsoft/teams-js@${version}/dist/MicrosoftTeams.min.js"></script>`,
    ].join('\n'),
  );
  write(
    'apps/teams-test-app/index_cdn.html',
    `<script src="https://res.cdn.office.net/teams-js/${version}/js/MicrosoftTeams.min.js"\n integrity="${htmlIntegrity}"`,
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
    return route ?? response(404);
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

function writePipelineConfig(root, { prodTag = 'latest', prodState = 'Latest', retention = 6 } = {}) {
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
  write('tools/releases/prod-release.yml', publish(prodTag, prodState));
  write('tools/releases/sdf-release.yml', publish('beta', 'Beta'));
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
    listDeletedChangeFiles = () => [];
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

    it('only checks the Prod list; the SDF list is never refreshed by a DDL run', async () => {
      writeRepo(root);
      assert.equal(await runWith(['domains', '--environment', 'sdf']), ExitCode.usage);
    });
  });

  describe('github-release', () => {
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

    it('is inconclusive when the Prod CDN cannot be reached', async () => {
      const { fetchImpl } = fakeFetch({
        ...unreachable(registryTags(NPM), cdnScriptUrl('2.60.0', 'prod')),
      });
      assert.equal(await runWith(['beta-version', '--version', '2.60.0-beta.0'], fetchImpl), ExitCode.unreachable);
    });

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
      assert.equal(await runWith(['consumed-changes', '--version', VERSION]), ExitCode.passed, lines.join('\n'));
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
      assert.equal(await runWith(['consumed-changes', '--version', VERSION]), ExitCode.failed);
      const failures = lines.filter((line) => line.startsWith('FAIL'));
      assert.equal(failures.length, 3, lines.join('\n'));
      assert.ok(failures.some((line) => line.includes('@microsoft-teams-js-clipboard.json')));
    });

    it('ignores entries from older releases', async () => {
      writeCleanup(root, {
        changelog: RELEASED_CHANGELOG,
        changeFiles: [['@microsoft-teams-js-old.json', 'Added `stageView.self.isCloseResultSupported`.']],
      });
      assert.equal(await runWith(['consumed-changes', '--version', VERSION]), ExitCode.passed, lines.join('\n'));
    });

    it('fails when the CHANGELOG has no section for the version', async () => {
      writeCleanup(root, { changelog: RELEASED_CHANGELOG, changeFiles: [] });
      assert.equal(await runWith(['consumed-changes', '--version', '2.60.0']), ExitCode.failed);
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
      assert.equal(await runWith(['consumed-changes', '--version', VERSION]), ExitCode.failed, lines.join('\n'));
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
  });

  describe('merged-back', () => {
    it('passes when main has the version section in its CHANGELOG', async () => {
      const changelog = `# Change Log\n\n## ${VERSION}\n\nWed\n\n## 2.58.0\n`;
      const { fetchImpl } = fakeFetch({ [MAIN_CHANGELOG]: response(200, Buffer.from(changelog)) });
      assert.equal(await runWith(['merged-back', '--version', VERSION], fetchImpl), ExitCode.passed);
    });

    it('fails when main lacks the section, even if a longer version starts the same', async () => {
      const changelog = `# Change Log\n\n## ${VERSION}1\n\n## 2.58.0\n`;
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
      assert.ok(text.includes('consumed-changes --version [--prep-commit]'), text);
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
        ['consumed-changes', '--version', VERSION],
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
