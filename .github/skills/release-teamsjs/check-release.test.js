'use strict';

// Run with: node --test .github/skills/release-teamsjs/check-release.test.js
const assert = require('node:assert/strict');
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
  const bytes = Buffer.isBuffer(body) ? body : Buffer.from(JSON.stringify(body ?? {}));
  return {
    status,
    arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    json: async () => JSON.parse(bytes.toString('utf8')),
    text: async () => bytes.toString('utf8'),
  };
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

function githubRoutes({ version = VERSION, prerelease, draft = false, tagVersion = version, latestTag }) {
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
  return routes;
}

describe('check-release', () => {
  let root;
  let lines;
  let env;
  const log = (line) => lines.push(line);
  const runWith = (argv, fetchImpl) => run(argv, { repoRoot: root, fetchImpl, log, env });

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'release-teamsjs-'));
    lines = [];
    env = {};
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
      const file = path.join(root, 'MicrosoftTeams.min.js');
      fs.writeFileSync(file, BUNDLE);
      assert.equal(await runWith(['artifact', '--version', VERSION, '--file', file]), ExitCode.passed);
    });

    it('fails when the CI bundle differs from the bundle the carriers were built from', async () => {
      writeRepo(root);
      const file = path.join(root, 'MicrosoftTeams.min.js');
      fs.writeFileSync(file, Buffer.from('a different build'));
      assert.equal(await runWith(['artifact', '--version', VERSION, '--file', file]), ExitCode.failed);
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
      assert.deepEqual(requested, [
        `https://registry.npmjs.org/@microsoft%2fteams-js/${VERSION}`,
        cdnScriptUrl(VERSION, 'prod'),
        `https://api.github.com/repos/OfficeDev/microsoft-teams-library-js/git/ref/tags/v${VERSION}`,
      ]);
    });

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

    it('uses an alternative https registry without a trailing slash', async () => {
      const { fetchImpl, requested } = fakeFetch({});
      await runWith(['check-version', '--version', VERSION, '--registry', 'https://mirror.example/npm/'], fetchImpl);
      assert.equal(requested[0], `https://mirror.example/npm/@microsoft%2fteams-js/${VERSION}`);
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
});
