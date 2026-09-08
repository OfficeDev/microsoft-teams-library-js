const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const { readCandidate } = require('./release-candidate');

test('actual candidate CLI reads pinned data only and cannot produce a publication receipt', (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'release-candidate-'));
  t.after(() => fs.rmSync(directory, { recursive: true }));
  const packageFile = path.join(directory, 'package.json');
  const changelogFile = path.join(directory, 'CHANGELOG.md');
  const outputFile = path.join(directory, 'candidate.json');
  fs.writeFileSync(packageFile, '{"name":"@microsoft/teams-js","version":"3.0.0"}');
  fs.writeFileSync(changelogFile, '## 3.0.0\n\nSynthetic change\n');
  const args = ['release/3.0.0', 'a'.repeat(40), 'b'.repeat(40), packageFile, changelogFile];
  const result = spawnSync(process.execPath, [path.join(__dirname, 'release-candidate.js'), ...args, outputFile]);
  assert.equal(result.status, 0, result.stderr.toString());
  const candidate = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
  assert.equal(candidate.status, 'unverified-candidate');
  assert.equal(candidate.source, args[1]);
  assert.equal('complete' in candidate, false);
  assert.equal('targets' in candidate, false);
  assert.throws(() => readCandidate('release/3.1.0', ...args.slice(1)), /does not match/);
  assert.throws(() => readCandidate('release/3.0.0', 'main', ...args.slice(2)), /identity/);
  assert.throws(() => readCandidate('test/3.0.0', ...args.slice(1)), /identity/);
  assert.notEqual(
    spawnSync(process.execPath, [path.join(__dirname, 'release-candidate.js'), ...args, outputFile]).status,
    0,
  );
});
