const assert = require('node:assert/strict');
const { execFile } = require('node:child_process');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const { promisify } = require('node:util');
const { GitHubClient, finalizeRelease, readTag } = require('./create-github-release');
const { fixture, source, identity, npmBytes, cdnFiles } = require('./test/release-fixtures');

function clientFixture() {
  const refs = new Map();
  const annotations = new Map();
  const releases = new Map();
  const writes = [];
  const client = {
    getTagReference: async (tag) => refs.get(tag),
    getAnnotatedTag: async (sha) => annotations.get(sha),
    createTagReference: async (tag, sha) => {
      writes.push(['ref', tag, sha]);
      assert.equal(refs.has(tag), false);
      refs.set(tag, { ref: `refs/tags/${tag}`, object: { type: annotations.has(sha) ? 'tag' : 'commit', sha } });
    },
    createAnnotatedTag: async (tag, sha, digest) => {
      writes.push(['annotation', tag]);
      const objectSha = 'd'.repeat(40);
      annotations.set(objectSha, { message: `teamsjs-plan-sha256:${digest}`, object: { type: 'commit', sha } });
      return { sha: objectSha };
    },
    getReleaseByTag: async (tag) => releases.get(tag),
    createRelease: async (release) => {
      writes.push(['release', release]);
      releases.set(release.tag_name, release);
    },
  };
  return { client, refs, annotations, releases, writes };
}

test('creates immutable plan candidate and annotated final tag only after all targets match', async () => {
  const state = clientFixture();
  const input = fixture();
  const result = await finalizeRelease({ ...input, client: state.client });
  assert.equal(result.candidateTag, `candidate/3.0.0/${input.approvedDigest}`);
  assert.equal((await readTag(state.client, result.tag)).sha, source);
  assert.equal((await readTag(state.client, result.tag)).annotation, `teamsjs-plan-sha256:${input.approvedDigest}`);
  assert.equal(state.releases.get(result.tag).prerelease, true);
  assert.equal(state.releases.get(result.tag).make_latest, 'false');
  const count = state.writes.length;
  assert.equal((await finalizeRelease({ ...input, client: state.client })).action, 'unchanged');
  assert.equal(state.writes.length, count);
});

test('external promotion never triggers a release edit or moves a final reference', async () => {
  const state = clientFixture();
  const input = fixture();
  await finalizeRelease({ ...input, client: state.client });
  state.releases.get('v3.0.0').prerelease = false;
  const original = structuredClone([...state.refs]);
  const writes = state.writes.length;
  await finalizeRelease({ ...input, client: state.client });
  assert.deepEqual([...state.refs], original);
  assert.equal(state.writes.length, writes);
  assert.equal(state.releases.get('v3.0.0').prerelease, false);
  assert.equal('updateTagReference' in state.client, false);
});

test('server-normalized annotation newline preserves identity on retries', async () => {
  const state = clientFixture();
  const input = fixture();
  await finalizeRelease({ ...input, client: state.client });
  state.annotations.get('d'.repeat(40)).message += '\n';
  const writes = state.writes.length;
  await finalizeRelease({ ...input, client: state.client });
  assert.equal(state.writes.length, writes);
});

for (const [name, edit] of [
  [
    'incomplete',
    (input) => {
      input.receipt.complete = false;
    },
  ],
  [
    'missing CDN',
    (input) => {
      input.receipt.observations.pop();
    },
  ],
  [
    'wrong source',
    (input) => {
      input.approvedSource = 'f'.repeat(40);
    },
  ],
  [
    'wrong plan',
    (input) => {
      input.approvedDigest = 'f'.repeat(64);
    },
  ],
  [
    'stale',
    (input) => {
      input.now += 16 * 60 * 1000;
    },
  ],
  [
    'unknown target',
    (input) => {
      input.receipt.observations[1].state = 'unknown';
    },
  ],
]) {
  test(`refuses ${name} publication evidence before any write`, async () => {
    const state = clientFixture();
    const input = fixture();
    edit(input);
    await assert.rejects(finalizeRelease({ ...input, client: state.client }));
    assert.deepEqual(state.writes, []);
  });
}

for (const conflict of ['commit', 'plan', 'legacy-lightweight']) {
  test(`refuses existing final tag with conflicting ${conflict} identity without changing it`, async () => {
    const state = clientFixture();
    const input = fixture();
    await finalizeRelease({ ...input, client: state.client });
    const annotation = state.annotations.get('d'.repeat(40));
    if (conflict === 'commit') annotation.object.sha = 'f'.repeat(40);
    if (conflict === 'plan') annotation.message = `teamsjs-plan-sha256:${'f'.repeat(64)}`;
    if (conflict === 'legacy-lightweight') state.refs.get('v3.0.0').object = { type: 'commit', sha: source };
    const original = structuredClone([...state.refs]);
    const writes = state.writes.length;
    await assert.rejects(finalizeRelease({ ...input, client: state.client }), /conflicts/);
    assert.equal(state.writes.length, writes);
    assert.deepEqual([...state.refs], original);
  });
}

test('a denied ref creation cannot be reported as a completed release', async () => {
  const state = clientFixture();
  state.client.createTagReference = async () => {
    throw new Error('HTTP 403');
  };
  await assert.rejects(finalizeRelease({ ...fixture(), client: state.client }), /403/);
  assert.equal(state.releases.size, 0);
});

test('a concurrent conflicting create fails without patch, rollback, or release creation', async () => {
  const state = clientFixture();
  state.client.createTagReference = async (tag) => {
    state.refs.set(tag, { ref: `refs/tags/${tag}`, object: { type: 'commit', sha: 'f'.repeat(40) } });
    throw new Error('HTTP 422 reference exists');
  };
  await assert.rejects(finalizeRelease({ ...fixture(), client: state.client }), /422/);
  assert.equal(state.releases.size, 0);
  assert.equal([...state.refs.values()][0].object.sha, 'f'.repeat(40));
});

test('missing remote persistence fails even after an accepted create request', async () => {
  const state = clientFixture();
  state.client.createTagReference = async () => {};
  await assert.rejects(finalizeRelease({ ...fixture(), client: state.client }), /conflicts/);
  assert.equal(state.releases.size, 0);
});

test('metadata failure retries metadata only and retains the original annotated tag object', async () => {
  const state = clientFixture();
  const input = fixture();
  const create = state.client.createRelease;
  state.client.createRelease = async () => {
    throw new Error('HTTP 503');
  };
  await assert.rejects(finalizeRelease({ ...input, client: state.client }), /503/);
  const refs = structuredClone([...state.refs]);
  const count = state.writes.length;
  state.client.createRelease = create;
  await finalizeRelease({ ...input, client: state.client });
  assert.deepEqual([...state.refs], refs);
  assert.deepEqual(
    state.writes.slice(count).map(([kind]) => kind),
    ['release'],
  );
});

test('GitHub client bounds requests, refuses redirects, separates auth failure from missing ref', async () => {
  let status = 403;
  const client = new GitHubClient({
    token: 'synthetic-token',
    fetchImpl: async (url, options) => {
      const destination = new URL(url);
      assert.equal(destination.origin, 'https://api.github.com');
      assert.ok(destination.pathname.startsWith('/repos/OfficeDev/microsoft-teams-library-js/'));
      assert.equal(options.redirect, 'error');
      assert.ok(options.signal instanceof AbortSignal);
      return { status, ok: status === 200, json: async () => ({}) };
    },
  });
  await assert.rejects(client.getTagReference('v3.0.0'), /403/);
  status = 404;
  assert.equal(await client.getTagReference('v3.0.0'), undefined);
  status = 500;
  await assert.rejects(client.getTagReference('v3.0.0'), /500/);
});

test('actual producer, verifier and finalizer CLIs rehearse against HTTP doubles without publishing', async (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'release-lifecycle-'));
  t.after(() => fs.rmSync(directory, { recursive: true }));
  const state = clientFixture();
  const { plan, approvedDigest } = fixture();
  let cdnMissing = false;
  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(decodeURIComponent(request.url.slice(1)));
      let body;
      if (url.hostname === 'registry.npmjs.org') {
        body = url.pathname.endsWith('.tgz')
          ? npmBytes
          : {
              name: plan.release.component,
              version: plan.release.version,
              gitHead: source,
              dist: { tarball: plan.targets[0].destination, integrity: plan.targets[0].integrity },
            };
      } else if (url.hostname === 'res.cdn.office.net') {
        body = cdnMissing ? undefined : cdnFiles[url.pathname.split('/').slice(3).join('/')];
      } else {
        assert.equal(url.hostname, 'api.github.com');
        assert.equal(request.headers.authorization, 'Bearer synthetic-token');
        const chunks = [];
        for await (const chunk of request) chunks.push(chunk);
        const input = chunks.length ? JSON.parse(Buffer.concat(chunks)) : undefined;
        const apiPath = decodeURIComponent(url.pathname.replace('/repos/OfficeDev/microsoft-teams-library-js', ''));
        if (request.method === 'GET' && apiPath.startsWith('/git/ref/tags/')) {
          body = await state.client.getTagReference(apiPath.slice('/git/ref/tags/'.length));
        } else if (request.method === 'GET' && apiPath.startsWith('/git/tags/')) {
          body = await state.client.getAnnotatedTag(apiPath.slice('/git/tags/'.length));
        } else if (request.method === 'GET' && apiPath.startsWith('/releases/tags/')) {
          body = await state.client.getReleaseByTag(apiPath.slice('/releases/tags/'.length));
        } else if (request.method === 'POST' && apiPath === '/git/refs') {
          await state.client.createTagReference(input.ref.slice('refs/tags/'.length), input.sha);
          body = {};
        } else if (request.method === 'POST' && apiPath === '/git/tags') {
          body = await state.client.createAnnotatedTag(input.tag, input.object, input.message.split(':')[1]);
        } else if (request.method === 'POST' && apiPath === '/releases') {
          await state.client.createRelease(input);
          body = input;
        } else {
          throw new Error(`Unexpected HTTP mutation: ${request.method} ${apiPath}`);
        }
      }
      response.writeHead(body === undefined ? 404 : 200);
      response.end(Buffer.isBuffer(body) ? body : JSON.stringify(body));
    } catch (error) {
      response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(error.message);
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => {
    server.close();
    server.closeAllConnections();
  });
  const preload = path.join(directory, 'http-double.cjs');
  fs.writeFileSync(
    preload,
    `const originalFetch = globalThis.fetch;
  globalThis.fetch = (url, options) => originalFetch(
    'http://127.0.0.1:${server.address().port}/' + encodeURIComponent(url), options);`,
  );
  const identityFile = path.join(directory, 'identity.json');
  const npmFile = path.join(directory, 'package.tgz');
  const cdnDirectory = path.join(directory, 'cdn');
  const planFile = path.join(directory, 'plan.json');
  const receiptFile = path.join(directory, 'receipt.json');
  fs.writeFileSync(identityFile, JSON.stringify(identity));
  fs.writeFileSync(npmFile, npmBytes);
  fs.mkdirSync(path.join(cdnDirectory, 'js'), { recursive: true });
  for (const [name, bytes] of Object.entries(cdnFiles)) fs.writeFileSync(path.join(cdnDirectory, name), bytes);
  const run = (script, args) =>
    promisify(execFile)(process.execPath, ['--require', preload, path.join(__dirname, script), ...args], {
      env: { ...process.env, NODE_OPTIONS: '', GITHUB_TOKEN: 'synthetic-token', GH_TOKEN: '' },
    });
  const produced = await run('release-plan.js', ['produce', identityFile, npmFile, cdnDirectory, planFile]);
  assert.equal(produced.stdout.trim(), approvedDigest);
  await run('release-plan.js', ['verify', planFile, approvedDigest, source, receiptFile]);
  const args = [planFile, receiptFile, approvedDigest, source];
  cdnMissing = true;
  await assert.rejects(run('create-github-release.js', args), /Incomplete or mismatched receipt/);
  assert.equal(state.writes.length, 0);
  cdnMissing = false;
  await run('create-github-release.js', args);
  assert.equal(state.releases.get('v3.0.0').prerelease, true);
  const writes = state.writes.length;
  state.releases.get('v3.0.0').prerelease = false;
  await run('create-github-release.js', args);
  assert.equal(state.writes.length, writes);
});
