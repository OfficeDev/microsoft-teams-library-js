const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const {
  canonical,
  planDigest,
  producePlan,
  validatePlan,
  verifyPublication,
  requireCompleteReceipt,
  readInventory,
} = require('./release-plan');
const { fixture, identity, npmBytes, cdnFiles, now } = require('./test/release-fixtures');

function responses(plan) {
  return new Map([
    [
      `https://registry.npmjs.org/@microsoft%2Fteams-js/${plan.release.version}`,
      JSON.stringify({
        name: plan.release.component,
        version: plan.release.version,
        gitHead: plan.source.commit,
        dist: { tarball: plan.targets[0].destination, integrity: plan.targets[0].integrity },
      }),
    ],
    [plan.targets[0].destination, npmBytes],
    ...plan.targets.slice(1).map((target) => [target.destination, cdnFiles[target.artifact]]),
  ]);
}

test('plan identity is canonical, source/build/tooling/content bound, and preserves the complete inventory', () => {
  const { plan } = fixture();
  assert.equal(plan.targets.length, 3);
  assert.equal(planDigest(plan), planDigest(Object.fromEntries(Object.entries(plan).reverse())));
  for (const edit of [
    (value) => {
      value.source.commit = 'f'.repeat(40);
    },
    (value) => {
      value.build.evidenceId = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
    },
    (value) => {
      value.tooling.revision = 'f'.repeat(40);
    },
    (value) => {
      value.targets.pop();
    },
  ]) {
    const changed = structuredClone(plan);
    edit(changed);
    assert.notEqual(planDigest(changed), planDigest(plan));
  }
  const changed = producePlan(structuredClone(identity), Buffer.from('different package'), cdnFiles);
  assert.notEqual(planDigest(changed), planDigest(plan));
});

for (const [name, edit] of [
  [
    'empty targets',
    (plan) => {
      plan.targets = [];
    },
  ],
  [
    'missing npm',
    (plan) => {
      plan.targets.shift();
    },
  ],
  [
    'duplicate target',
    (plan) => {
      plan.targets.push(plan.targets[1]);
    },
  ],
  [
    'unknown fields',
    (plan) => {
      plan.authorization = 'never stored';
    },
  ],
  [
    'private endpoint',
    (plan) => {
      plan.targets[0].destination = 'https://example.invalid/feed';
    },
  ],
  [
    'unresolved build',
    (plan) => {
      plan.build.evidenceId = '<build>';
    },
  ],
  [
    'branch source',
    (plan) => {
      plan.source.commit = 'main';
    },
  ],
  [
    'version leading zero',
    (plan) => {
      plan.release.version = '03.0.0';
    },
  ],
  [
    'channel mismatch',
    (plan) => {
      plan.release.channel = 'prerelease';
    },
  ],
  [
    'malformed SRI',
    (plan) => {
      plan.targets[0].integrity = 'sha512-no';
    },
  ],
  [
    'path traversal',
    (plan) => {
      plan.targets[1].artifact = 'js/../secret.js';
    },
  ],
]) {
  test(`rejects ${name}`, () => {
    const { plan } = fixture();
    edit(plan);
    assert.throws(() => validatePlan(plan));
  });
}

test('semantic prerelease publication cannot be mistaken for the supported production destination', () => {
  const input = structuredClone(identity);
  input.release.version = '3.0.0-beta.1';
  input.release.channel = 'prerelease';
  assert.throws(() => producePlan(input, npmBytes, cdnFiles), /separately approved destination adapter/);
  input.release.version = '3.0.0-beta.01';
  assert.throws(() => producePlan(input, npmBytes, cdnFiles), /version/);
});

test('real HTTP doubles verify npm metadata, package bytes, and every CDN object', async (t) => {
  const input = fixture();
  const entries = responses(input.plan);
  const observed = [];
  const server = http.createServer((request, response) => {
    const url = decodeURIComponent(request.url.slice(1));
    observed.push(url);
    const value = entries.get(url);
    response.writeHead(value === undefined ? 404 : 200);
    response.end(value);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => {
    server.close();
    server.closeAllConnections();
  });
  const fetchImpl = (url, options) =>
    fetch(`http://127.0.0.1:${server.address().port}/${encodeURIComponent(url)}`, options);
  const receipt = await verifyPublication(input.plan, { fetchImpl, now: () => now });
  assert.equal(receipt.complete, true);
  assert.deepEqual(receipt, input.receipt);
  requireCompleteReceipt(input.plan, receipt, input.approvedDigest, input.approvedSource, now);
  assert.equal(observed.length, 4);
});

for (const [name, edit, expectedState] of [
  [
    'npm absent/CDN present',
    (entries, plan) => {
      entries.set(plan.targets[0].destination, 404);
    },
    'unknown',
  ],
  [
    'npm present/CDN absent',
    (entries, plan) => {
      entries.set(plan.targets[1].destination, 404);
    },
    'unknown',
  ],
  [
    'auth failure',
    (entries, plan) => {
      entries.set(plan.targets[1].destination, 401);
    },
    'unknown',
  ],
  [
    'malformed metadata',
    (entries) => {
      entries.set([...entries.keys()][0], '<html>');
    },
    'unknown',
  ],
  [
    'wrong npm bytes',
    (entries, plan) => {
      entries.set(plan.targets[0].destination, 'wrong bytes');
    },
    'conflicting',
  ],
  [
    'wrong CDN bytes',
    (entries, plan) => {
      entries.set(plan.targets[2].destination, 'wrong bytes');
    },
    'conflicting',
  ],
  [
    'wrong metadata SRI',
    (entries) => {
      const key = [...entries.keys()][0];
      const value = JSON.parse(entries.get(key));
      value.dist.integrity = 'sha512-wrong';
      entries.set(key, JSON.stringify(value));
    },
    'conflicting',
  ],
  [
    'wrong source metadata',
    (entries) => {
      const key = [...entries.keys()][0];
      const value = JSON.parse(entries.get(key));
      value.gitHead = 'f'.repeat(40);
      entries.set(key, JSON.stringify(value));
    },
    'conflicting',
  ],
]) {
  test(`${name} stays incomplete and still observes every target`, async () => {
    const input = fixture();
    const entries = responses(input.plan);
    edit(entries, input.plan);
    const requested = [];
    const receipt = await verifyPublication(input.plan, {
      now: () => now,
      fetchImpl: async (url, options) => {
        requested.push(url);
        assert.equal(options.redirect, 'error');
        assert.ok(options.signal instanceof AbortSignal);
        const value = entries.get(url);
        return typeof value === 'number' ? new Response(null, { status: value }) : new Response(value);
      },
    });
    assert.equal(receipt.complete, false);
    assert.equal(receipt.observations.length, input.plan.targets.length);
    assert.ok(receipt.observations.some(({ state }) => state === expectedState));
    assert.ok(requested.includes(input.plan.targets[2].destination));
    assert.throws(() => requireCompleteReceipt(input.plan, receipt, input.approvedDigest, input.approvedSource, now));
  });
}

test('network failure is unknown, never absence or a success-shaped fallback', async () => {
  const { plan } = fixture();
  const receipt = await verifyPublication(plan, {
    fetchImpl: async () => {
      throw new Error('timeout');
    },
  });

  assert.equal(receipt.complete, false);
  assert.ok(receipt.observations.every(({ state }) => state === 'unknown'));
});

test('HTTP error bodies are canceled before observing the next target', async () => {
  const { plan } = fixture();
  let canceled = 0;
  const receipt = await verifyPublication(plan, {
    fetchImpl: async () => ({
      status: 403,
      body: {
        cancel: async () => {
          canceled += 1;
        },
      },
    }),
  });
  assert.equal(receipt.complete, false);
  assert.equal(canceled, plan.targets.length);
});

test('complete flag cannot hide duplicate, future, stale or forged observations', () => {
  for (const edit of [
    (receipt) => {
      receipt.observations[1] = receipt.observations[0];
    },
    (receipt) => {
      receipt.observations[0].observedAt = new Date(now + 1).toISOString();
    },
    (receipt) => {
      receipt.observations[0].observedAt = new Date(now - 16 * 60 * 1000).toISOString();
    },
    (receipt) => {
      receipt.observations[0].evidence = 'sha512-forged';
    },
  ]) {
    const input = fixture();
    edit(input.receipt);
    assert.throws(() =>
      requireCompleteReceipt(input.plan, input.receipt, input.approvedDigest, input.approvedSource, now),
    );
  }
});

test('producer CLI hashes approved local outputs, records all files and refuses overwrite or symlinks', (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'release-producer-'));
  t.after(() => fs.rmSync(directory, { recursive: true }));
  const identityFile = path.join(directory, 'identity.json');
  const npmFile = path.join(directory, 'package.tgz');
  const cdnDirectory = path.join(directory, 'cdn');
  const planFile = path.join(directory, 'plan.json');
  fs.mkdirSync(path.join(cdnDirectory, 'js'), { recursive: true });
  fs.writeFileSync(identityFile, JSON.stringify(identity));
  fs.writeFileSync(npmFile, npmBytes);
  for (const [name, bytes] of Object.entries(cdnFiles)) fs.writeFileSync(path.join(cdnDirectory, name), bytes);
  const args = [path.join(__dirname, 'release-plan.js'), 'produce', identityFile, npmFile, cdnDirectory, planFile];
  const result = spawnSync(process.execPath, args, { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), fixture().approvedDigest);
  assert.equal(fs.readFileSync(planFile, 'utf8'), `${canonical(fixture().plan)}\n`);
  assert.notEqual(spawnSync(process.execPath, args).status, 0);
  fs.symlinkSync(npmFile, path.join(cdnDirectory, 'js', 'linked.js'));
  assert.throws(() => readInventory(cdnDirectory), /links/);
});
