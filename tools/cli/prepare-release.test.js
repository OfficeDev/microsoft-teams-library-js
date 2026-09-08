const assert = require('assert');
const { after, test } = require('node:test');
const { randomUUID } = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const repositoryRoot = path.resolve(__dirname, '../..');
const helperPath = path.join(__dirname, 'prepare-release.js');
const testRoot = path.join(repositoryRoot, `.release-helper-tests-${randomUUID()}`);
const actualGit = run(process.platform === 'win32' ? 'where.exe' : 'which', ['git'])
  .stdout.trim()
  .split(/\r?\n/)[0];
const beachballBin =
  process.env.PREPARE_RELEASE_TEST_BEACHBALL_BIN ||
  require.resolve('beachball/bin/beachball.js', { paths: [repositoryRoot] });

fs.mkdirSync(testRoot, { recursive: true });
after(() => fs.rmSync(testRoot, { recursive: true, force: true }));

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    encoding: 'utf8',
    env: options.env || process.env,
    maxBuffer: 10 * 1024 * 1024,
  });
  if (options.check !== false && (result.error || result.status !== 0)) {
    throw result.error || new Error(`${command} ${args.join(' ')} failed:\n${result.stdout}\n${result.stderr}`);
  }
  return result;
}

function write(repoPath, relativePath, content) {
  const absolutePath = path.join(repoPath, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content);
}

function git(repoPath, args) {
  return run(actualGit, ['-C', repoPath, ...args]).stdout.trim();
}

function createRepository({ changeTypes = ['patch'], disallowedChangeTypes = ['major', 'prerelease'] } = {}) {
  const repoPath = path.join(testRoot, `repo-${randomUUID()}`);
  fs.mkdirSync(repoPath, { recursive: true });
  write(
    repoPath,
    'package.json',
    `${JSON.stringify(
      {
        name: 'release-helper-fixture',
        private: true,
        packageManager: 'pnpm@9.15.9',
        workspaces: ['packages/*'],
      },
      null,
      2,
    )}\n`,
  );
  write(
    repoPath,
    'packages/teams-js/package.json',
    `${JSON.stringify({ name: '@microsoft/teams-js', version: '1.2.3' }, null, 2)}\n`,
  );
  write(repoPath, 'packages/teams-js/CHANGELOG.md', '# Changelog\n');
  write(
    repoPath,
    'beachball.config.js',
    `module.exports = {
  branch: 'origin/main',
  bumpDeps: false,
  disallowedChangeTypes: ${JSON.stringify(disallowedChangeTypes)},
  generateChangelog: true,
  publish: false,
  push: false,
  scope: ['packages/teams-js'],
};
`,
  );
  write(repoPath, 'pnpm-lock.yaml', "lockfileVersion: '9.0'\nimporters: {}\n");
  changeTypes.forEach((type, index) => {
    write(
      repoPath,
      `change/change-${index}.json`,
      `${JSON.stringify(
        {
          type,
          comment: `Synthetic ${type} change`,
          packageName: '@microsoft/teams-js',
          email: 'contributor@example.invalid',
          dependentChangeType: 'patch',
        },
        null,
        2,
      )}\n`,
    );
  });
  git(repoPath, ['init', '--quiet']);
  git(repoPath, ['config', 'user.name', 'Release Helper Test']);
  git(repoPath, ['config', 'user.email', 'release-helper@example.invalid']);
  git(repoPath, ['add', '.']);
  git(repoPath, ['commit', '--quiet', '-m', 'Create synthetic release repository']);
  return repoPath;
}

function writeCommandDouble(binPath, name, source) {
  write(binPath, `${name}.js`, source);
  write(binPath, name, `#!/bin/sh\nexec node "$(dirname "$0")/${name}.js" "$@"\n`);
  write(binPath, `${name}.cmd`, `@echo off\r\nnode "%~dp0${name}.js" %*\r\n`);
  fs.chmodSync(path.join(binPath, name), 0o755);
}

function fakePnpmEnvironment(markerPath, extra = {}) {
  const binPath = path.join(testRoot, `bin-${randomUUID()}`);
  fs.mkdirSync(binPath, { recursive: true });
  writeCommandDouble(
    binPath,
    'pnpm',
    `const fs = require('fs');
const count = fs.existsSync(process.env.PNPM_MARKER)
  ? fs.readFileSync(process.env.PNPM_MARKER, 'utf8').trim().split(/\\r?\\n/).filter(Boolean).length
  : 0;
fs.appendFileSync(process.env.PNPM_MARKER, 'called\\n');
process.exitCode = count >= Number(process.env.PNPM_FAIL_AFTER || Number.MAX_SAFE_INTEGER) ? 23 : 0;
`,
  );
  const commandPath = extra.PATH || process.env.PATH;
  return {
    ...process.env,
    ...extra,
    NODE_ENV: 'test',
    PREPARE_RELEASE_TEST_BEACHBALL_BIN: beachballBin,
    PATH: `${binPath}${path.delimiter}${commandPath}`,
    PNPM_MARKER: markerPath,
  };
}

function runHelper(repoPath, args, env) {
  return run(process.execPath, [helperPath, ...args], {
    cwd: repoPath,
    env,
    check: false,
  });
}

function previewArguments(repoPath, expectedVersion) {
  return ['preview', '--source-commit', git(repoPath, ['rev-parse', 'HEAD']), '--expected-version', expectedVersion];
}

test('previews an exact version without changing the source checkout or contributor policy', () => {
  const repoPath = createRepository();
  const markerPath = path.join(testRoot, `pnpm-${randomUUID()}.log`);
  const beforeConfig = fs.readFileSync(path.join(repoPath, 'beachball.config.js'), 'utf8');
  const beforeStatus = git(repoPath, ['status', '--porcelain=v1', '--untracked-files=all']);

  const result = runHelper(repoPath, previewArguments(repoPath, '1.2.4'), fakePnpmEnvironment(markerPath));

  assert.strictEqual(result.status, 0, result.stderr);
  assert.deepStrictEqual(JSON.parse(result.stdout), {
    sourceCommit: git(repoPath, ['rev-parse', 'HEAD']),
    version: '1.2.4',
  });
  assert.strictEqual(git(repoPath, ['status', '--porcelain=v1', '--untracked-files=all']), beforeStatus);
  assert.strictEqual(fs.readFileSync(path.join(repoPath, 'beachball.config.js'), 'utf8'), beforeConfig);
  assert.match(fs.readFileSync(markerPath, 'utf8'), /called/);
});

test('detects untracked files even when ordinary git status hides them', () => {
  const repoPath = createRepository();
  const markerPath = path.join(testRoot, `pnpm-${randomUUID()}.log`);
  git(repoPath, ['config', 'status.showUntrackedFiles', 'no']);
  write(repoPath, 'change/hidden.json', '{}\n');
  assert.strictEqual(git(repoPath, ['status', '--porcelain=v1']), '');

  const result = runHelper(repoPath, previewArguments(repoPath, '1.2.4'), fakePnpmEnvironment(markerPath));

  assert.notStrictEqual(result.status, 0);
  assert.match(result.stderr, /change\/hidden\.json/);
  assert.strictEqual(fs.existsSync(markerPath), false);
  assert.strictEqual(fs.existsSync(path.join(repoPath, 'change/hidden.json')), true);
});

test('fails closed when the lockfile update fails even if Beachball continues', () => {
  const repoPath = createRepository();
  const markerPath = path.join(testRoot, `pnpm-${randomUUID()}.log`);
  const beforePackage = fs.readFileSync(path.join(repoPath, 'packages/teams-js/package.json'), 'utf8');

  const result = runHelper(
    repoPath,
    previewArguments(repoPath, '1.2.4'),
    fakePnpmEnvironment(markerPath, { PNPM_FAIL_AFTER: '1' }),
  );

  assert.notStrictEqual(result.status, 0);
  assert.match(result.stderr, /failed with exit code/);
  assert.strictEqual(fs.readFileSync(path.join(repoPath, 'packages/teams-js/package.json'), 'utf8'), beforePackage);
  assert.strictEqual(git(repoPath, ['status', '--porcelain=v1', '--untracked-files=all']), '');
});

for (const blockedType of ['major', 'prerelease']) {
  test(`the repository policy rejects ${blockedType} before mutating the source checkout`, () => {
    const repoPath = createRepository({ changeTypes: [blockedType] });
    const markerPath = path.join(testRoot, `pnpm-${randomUUID()}.log`);
    const beforeConfig = fs.readFileSync(path.join(repoPath, 'beachball.config.js'), 'utf8');
    const beforePackage = fs.readFileSync(path.join(repoPath, 'packages/teams-js/package.json'), 'utf8');

    const result = runHelper(repoPath, previewArguments(repoPath, '9.9.9'), fakePnpmEnvironment(markerPath));

    assert.notStrictEqual(result.status, 0);
    assert.match(result.stderr, new RegExp(`Disallowed change type.*"${blockedType}"`));
    assert.strictEqual(fs.readFileSync(path.join(repoPath, 'beachball.config.js'), 'utf8'), beforeConfig);
    assert.strictEqual(fs.readFileSync(path.join(repoPath, 'packages/teams-js/package.json'), 'utf8'), beforePackage);
    assert.strictEqual(fs.readFileSync(markerPath, 'utf8'), 'called\n');
  });
}

test('rejects a prerelease expectation when the full pending set produces a stable minor', () => {
  const repoPath = createRepository({
    changeTypes: ['prerelease', 'minor'],
    disallowedChangeTypes: ['major'],
  });
  const markerPath = path.join(testRoot, `pnpm-${randomUUID()}.log`);

  const result = runHelper(repoPath, previewArguments(repoPath, '1.2.4-0'), fakePnpmEnvironment(markerPath));

  assert.notStrictEqual(result.status, 0);
  assert.match(result.stderr, /has version 1\.3\.0; expected exactly 1\.2\.4-0/);
  assert.strictEqual(git(repoPath, ['status', '--porcelain=v1', '--untracked-files=all']), '');
});

test('does not invoke git push while producing a preview', () => {
  const repoPath = createRepository();
  const markerPath = path.join(testRoot, `pnpm-${randomUUID()}.log`);
  const pushMarkerPath = path.join(testRoot, `push-${randomUUID()}.log`);
  const binPath = path.join(testRoot, `git-bin-${randomUUID()}`);
  fs.mkdirSync(binPath, { recursive: true });
  writeCommandDouble(
    binPath,
    'git',
    `const { spawnSync } = require('child_process');
const fs = require('fs');
if (process.argv.slice(2).includes('push')) {
  fs.appendFileSync(process.env.PUSH_MARKER, 'denied\\n');
  process.exitCode = 91;
} else {
  const result = spawnSync(process.env.ACTUAL_GIT, process.argv.slice(2), { stdio: 'inherit' });
  process.exitCode = result.status;
}
`,
  );
  const env = fakePnpmEnvironment(markerPath, {
    ACTUAL_GIT: actualGit,
    PATH: `${binPath}${path.delimiter}${process.env.PATH}`,
    PUSH_MARKER: pushMarkerPath,
  });

  const result = runHelper(repoPath, previewArguments(repoPath, '1.2.4'), env);

  assert.strictEqual(result.status, 0, result.stderr);
  assert.strictEqual(fs.existsSync(pushMarkerPath), false);
});

test('rejects push and other unsupported CLI arguments before repository mutation', () => {
  const result = run(process.execPath, [helperPath, 'preview', '--push', 'origin'], {
    cwd: repositoryRoot,
    check: false,
  });
  assert.notStrictEqual(result.status, 0);
  assert.match(result.stderr, /Unsupported or incomplete argument: --push/);
});

test('verifies only complete, unstaged preparation output from the pinned source', () => {
  const repoPath = createRepository();
  const sourceCommit = git(repoPath, ['rev-parse', 'HEAD']);
  fs.rmSync(path.join(repoPath, 'change'), { recursive: true });
  write(repoPath, 'apps/teams-test-app/package.json', '{"name":"test-app","version":"1.2.4"}\n');
  write(
    repoPath,
    'apps/teams-test-app/index_cdn.html',
    '<script src="https://res.cdn.office.net/teams-js/1.2.4/js/MicrosoftTeams.min.js" integrity="sha384-test"></script>\n',
  );
  write(repoPath, 'packages/teams-js/package.json', '{"name":"@microsoft/teams-js","version":"1.2.4"}\n');
  write(repoPath, 'packages/teams-js/CHANGELOG.md', '# Changelog\n\n## 1.2.4\n');
  write(
    repoPath,
    'packages/teams-js/README.md',
    '<script src="https://res.cdn.office.net/teams-js/1.2.4/js/MicrosoftTeams.min.js" integrity="sha384-test"></script>\n',
  );

  const result = runHelper(
    repoPath,
    ['verify', '--source-commit', sourceCommit, '--expected-version', '1.2.4'],
    process.env,
  );

  assert.strictEqual(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.strictEqual(output.sourceCommit, sourceCommit);
  assert(output.changedPaths.includes('packages/teams-js/package.json'));

  write(repoPath, 'unexpected.txt', 'not release output\n');
  const rejected = runHelper(
    repoPath,
    ['verify', '--source-commit', sourceCommit, '--expected-version', '1.2.4'],
    process.env,
  );
  assert.notStrictEqual(rejected.status, 0);
  assert.match(rejected.stderr, /unexpected\.txt/);
});
