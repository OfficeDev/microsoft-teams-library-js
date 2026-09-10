const assert = require('assert');
const { after, test } = require('node:test');
const { randomUUID } = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const repositoryRoot = path.resolve(__dirname, '../..');
const helperPath = path.join(__dirname, 'prepare-release.js');
const testRoot = fs.mkdtempSync(path.join(os.tmpdir(), "release helper's tests-"));
const actualGit = run(process.platform === 'win32' ? 'where.exe' : 'which', ['git'])
  .stdout.trim()
  .split(/\r?\n/)[0];
const beachballBin =
  process.env.PREPARE_RELEASE_TEST_BEACHBALL_BIN ||
  require.resolve('beachball/bin/beachball.js', { paths: [repositoryRoot] });
const installedBeachball = path.dirname(path.dirname(beachballBin));

fs.mkdirSync(testRoot, { recursive: true });
after(() => fs.rmSync(testRoot, { recursive: true, force: true }));

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    encoding: 'utf8',
    env: options.env || process.env,
    input: options.input,
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
  write(repoPath, '.gitignore', 'node_modules/\ndist/\n');
  write(
    repoPath,
    'apps/teams-test-app/package.json',
    JSON.stringify({ name: 'test-app', version: '1.2.3' }, null, 2) + '\n',
  );
  const previousScript =
    '<script src="https://res.cdn.office.net/teams-js/1.2.3/js/MicrosoftTeams.min.js" integrity="sha384-previous"></script>\n';
  write(repoPath, 'apps/teams-test-app/index_cdn.html', previousScript);
  write(repoPath, 'packages/teams-js/README.md', previousScript);
  write(repoPath, 'tools/cli/preRelease.js', fs.readFileSync(path.join(__dirname, 'preRelease.js')));
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
  git(repoPath, ['update-ref', 'refs/remotes/origin/main', 'HEAD']);
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
const path = require('path');
const {spawnSync} = require('child_process');
const args = process.argv.slice(2);
if(process.env.CHECK_NO_RELEASE_TOKENS && ['NPM_TOKEN','NODE_AUTH_TOKEN','GITHUB_TOKEN','GH_TOKEN','SYSTEM_ACCESSTOKEN'].some(key=>process.env[key])) throw new Error('Release credentials reached build child');
const count = fs.existsSync(process.env.PNPM_MARKER)
  ? fs.readFileSync(process.env.PNPM_MARKER, 'utf8').trim().split(/\\r?\\n/).filter(Boolean).length
  : 0;
fs.appendFileSync(process.env.PNPM_MARKER, 'called\\n');
if (count >= Number(process.env.PNPM_FAIL_AFTER || Number.MAX_SAFE_INTEGER)) process.exitCode = 23;
else if (args[0] === 'install') {
  fs.mkdirSync('node_modules', {recursive:true});
  if (!fs.existsSync('node_modules/beachball')) fs.symlinkSync(process.env.BEACHBALL_TEST_ROOT, 'node_modules/beachball', 'dir');
} else if (args[0] === 'beachball') {
  process.exitCode = spawnSync(process.execPath, [path.join(process.env.BEACHBALL_TEST_ROOT,'bin/beachball.js'), ...args.slice(1)], {stdio:'inherit'}).status;
} else if (args[0] === 'build') {
  if (process.env.FAIL_BUILD) process.exitCode = 24;
  else {
    fs.mkdirSync('packages/teams-js/dist/umd', {recursive:true});
    const bytes = 'synthetic built bundle';
    fs.writeFileSync('packages/teams-js/dist/umd/MicrosoftTeams.min.js', bytes);
    const integrity = 'sha384-' + require('crypto').createHash('sha384').update(bytes).digest('base64');
    fs.writeFileSync('packages/teams-js/dist/umd/MicrosoftTeams-manifest.json', JSON.stringify({'MicrosoftTeams.min.js':{integrity}}));
  }
} else throw new Error('Unexpected package-manager command: '+args);
`,
  );
  const commandPath = extra.PATH || process.env.PATH;
  return {
    ...process.env,
    ...extra,
    BEACHBALL_TEST_ROOT: path.dirname(path.dirname(beachballBin)),
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

    const result = run(process.execPath, [beachballBin, 'bump'], {
      cwd: repoPath,
      check: false,
      env: fakePnpmEnvironment(markerPath),
    });

    assert.notStrictEqual(result.status, 0);
    assert.match(result.stdout + result.stderr, new RegExp(`Disallowed change type.*"${blockedType}"`));
    assert.strictEqual(fs.readFileSync(path.join(repoPath, 'beachball.config.js'), 'utf8'), beforeConfig);
    assert.strictEqual(fs.readFileSync(path.join(repoPath, 'packages/teams-js/package.json'), 'utf8'), beforePackage);
    assert.strictEqual(fs.existsSync(markerPath), false);
  });
}

test('plain real Beachball bump lets pending minor outrank a prerelease file', () => {
  const repoPath = createRepository({
    changeTypes: ['prerelease', 'minor'],
    disallowedChangeTypes: ['major'],
  });
  const markerPath = path.join(testRoot, `pnpm-${randomUUID()}.log`);

  const result = run(process.execPath, [beachballBin, 'bump'], {
    cwd: repoPath,
    check: false,
    env: fakePnpmEnvironment(markerPath),
  });

  assert.strictEqual(result.status, 0, result.stderr);
  assert.strictEqual(
    JSON.parse(fs.readFileSync(path.join(repoPath, 'packages/teams-js/package.json'))).version,
    '1.3.0',
  );
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
  const bundle = 'synthetic built bundle';
  const integrity = `sha384-${require('crypto').createHash('sha384').update(bundle).digest('base64')}`;
  write(repoPath, 'packages/teams-js/dist/umd/MicrosoftTeams.min.js', bundle);
  write(
    repoPath,
    'apps/teams-test-app/index_cdn.html',
    `<script src="https://res.cdn.office.net/teams-js/1.2.4/js/MicrosoftTeams.min.js" integrity="${integrity}"></script>\n`,
  );
  write(repoPath, 'packages/teams-js/package.json', '{"name":"@microsoft/teams-js","version":"1.2.4"}\n');
  write(repoPath, 'packages/teams-js/CHANGELOG.md', '# Changelog\n\n## 1.2.4\n');
  write(
    repoPath,
    'packages/teams-js/README.md',
    `<script src="https://res.cdn.office.net/teams-js/1.2.4/js/MicrosoftTeams.min.js" integrity="${integrity}"></script>\n`,
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

  write(repoPath, 'packages/teams-js/dist/umd/MicrosoftTeams.min.js', 'changed bytes');
  const wrongBytes = runHelper(
    repoPath,
    ['verify', '--source-commit', sourceCommit, '--expected-version', '1.2.4'],
    process.env,
  );
  assert.notStrictEqual(wrongBytes.status, 0);
  assert.match(wrongBytes.stderr, /do not match built bytes/);
  write(repoPath, 'packages/teams-js/dist/umd/MicrosoftTeams.min.js', bundle);

  write(repoPath, 'unexpected.txt', 'not release output\n');
  const rejected = runHelper(
    repoPath,
    ['verify', '--source-commit', sourceCommit, '--expected-version', '1.2.4'],
    process.env,
  );
  assert.notStrictEqual(rejected.status, 0);
  assert.match(rejected.stderr, /unexpected\.txt/);
});

test('actual installed prompt exposes only the stable contributor choices, not premajor/preminor/prepatch', () => {
  const { getQuestionsForPackage } = require(path.join(installedBeachball, 'lib/changefile/getQuestionsForPackage.js'));
  const pkg = '@microsoft/teams-js';
  const questions = getQuestionsForPackage({
    pkg,
    packageInfos: { [pkg]: { version: '1.2.3', combinedOptions: { disallowedChangeTypes: ['major', 'prerelease'] } } },
    packageGroups: {},
    options: {},
    recentMessages: [],
  });
  assert.deepStrictEqual(
    questions[0].choices.map(({ value }) => value),
    ['patch', 'minor', 'none'],
  );
});

for (const [type, pending, version, prefix] of [
  ['major', ['minor', 'patch'], '2.0.0', null],
  ['premajor', ['minor', 'patch'], '2.0.0-beta.0', 'beta'],
  ['prerelease', [], '1.2.4-beta.0', 'beta'],
]) {
  test(`approved ${type} preparation asserts whole-set version and restores contributor config`, () => {
    const repoPath = createRepository({ changeTypes: pending });
    const source = git(repoPath, ['rev-parse', 'HEAD']);
    const config = fs.readFileSync(path.join(repoPath, 'beachball.config.js'), 'utf8');
    const intent = path.join(testRoot, `intent-${randomUUID()}.json`);
    fs.writeFileSync(
      intent,
      JSON.stringify({ sourceCommit: source, expectedVersion: version, changeType: type, prereleasePrefix: prefix }),
    );
    const args = ['--source-commit', source, '--expected-version', version, '--intent-file', intent];
    const env = fakePnpmEnvironment(path.join(testRoot, `pnpm-${randomUUID()}.log`));
    const preview = runHelper(repoPath, ['preview', ...args], env);
    assert.strictEqual(preview.status, 0, preview.stderr);
    const prepared = runHelper(repoPath, ['prepare', ...args], env);
    assert.strictEqual(prepared.status, 0, prepared.stderr);
    const worktree = JSON.parse(prepared.stdout).worktree;
    try {
      assert.strictEqual(fs.readFileSync(path.join(worktree, 'beachball.config.js'), 'utf8'), config);
      assert.strictEqual(fs.readFileSync(path.join(repoPath, 'beachball.config.js'), 'utf8'), config);
      const staged = runHelper(worktree, ['stage', '--source-commit', source, '--expected-version', version], env);
      assert.strictEqual(staged.status, 0, staged.stderr);
      const checked = runHelper(
        worktree,
        ['check-staged', '--source-commit', source, '--expected-version', version],
        env,
      );
      assert.strictEqual(checked.status, 0, checked.stderr);
      write(worktree, 'unrelated.txt', 'must not reach release commit');
      git(worktree, ['add', 'unrelated.txt']);
      const badIndex = runHelper(
        worktree,
        ['check-staged', '--source-commit', source, '--expected-version', version],
        env,
      );
      assert.notStrictEqual(badIndex.status, 0);
      assert.match(badIndex.stderr, /unexpected paths/);
      assert.strictEqual(git(worktree, ['diff', '--cached', '--name-only', '--', 'beachball.config.js']), '');
      assert.strictEqual(
        fs.existsSync(path.join(worktree, 'change')) &&
          fs.readdirSync(path.join(worktree, 'change')).some((f) => f.endsWith('.json')),
        false,
      );
    } finally {
      git(repoPath, ['worktree', 'remove', '--force', worktree]);
      fs.rmdirSync(path.dirname(worktree));
    }
    assert.strictEqual(git(repoPath, ['status', '--porcelain=v1', '--untracked-files=all']), '');
  });
}

test('approved prerelease intent cannot override a pending stable minor without exact-version failure', () => {
  const repoPath = createRepository({ changeTypes: ['minor', 'patch'] });
  const source = git(repoPath, ['rev-parse', 'HEAD']);
  const intent = path.join(testRoot, `intent-${randomUUID()}.json`);
  fs.writeFileSync(
    intent,
    JSON.stringify({
      sourceCommit: source,
      expectedVersion: '1.2.4-beta.0',
      changeType: 'prerelease',
      prereleasePrefix: 'beta',
    }),
  );
  const result = runHelper(
    repoPath,
    ['preview', '--source-commit', source, '--expected-version', '1.2.4-beta.0', '--intent-file', intent],
    fakePnpmEnvironment(path.join(testRoot, `pnpm-${randomUUID()}.log`)),
  );
  assert.notStrictEqual(result.status, 0);
  assert.match(result.stderr, /Pending change outranks/);
  assert.strictEqual(git(repoPath, ['status', '--porcelain=v1', '--untracked-files=all']), '');
});

test('failed real preRelease entrypoint build leaves no candidate and does not alter the source', () => {
  const repoPath = createRepository();
  const source = git(repoPath, ['rev-parse', 'HEAD']);
  const result = runHelper(
    repoPath,
    ['prepare', '--source-commit', source, '--expected-version', '1.2.4'],
    fakePnpmEnvironment(path.join(testRoot, `pnpm-${randomUUID()}.log`), { FAIL_BUILD: 'true' }),
  );
  assert.notStrictEqual(result.status, 0);
  assert.match(result.stderr, /failed with exit code/);
  assert.strictEqual(git(repoPath, ['status', '--porcelain=v1', '--untracked-files=all']), '');
  assert.strictEqual(git(repoPath, ['worktree', 'list', '--porcelain']).split('worktree ').length, 2);
});

test('git status failure is not interpreted as a clean tree', () => {
  const repoPath = createRepository();
  const args = previewArguments(repoPath, '1.2.4');
  const markerPath = path.join(testRoot, `pnpm-${randomUUID()}.log`);
  const binPath = path.join(testRoot, `git-${randomUUID()}`);
  fs.mkdirSync(binPath);
  writeCommandDouble(
    binPath,
    'git',
    `const {spawnSync}=require('child_process');
if(process.argv.includes('status'))process.exitCode=128;
else process.exitCode=spawnSync(process.env.ACTUAL_GIT,process.argv.slice(2),{stdio:'inherit'}).status;`,
  );
  const result = runHelper(
    repoPath,
    args,
    fakePnpmEnvironment(markerPath, { ACTUAL_GIT: actualGit, PATH: `${binPath}${path.delimiter}${process.env.PATH}` }),
  );
  assert.notStrictEqual(result.status, 0);
  assert.strictEqual(fs.existsSync(markerPath), false);
});

test('runbook fences parse and stop after status, branch, commit, or denied push failures', () => {
  const skill = fs.readFileSync(path.join(repositoryRoot, '.github/skills/release-teamsjs/SKILL.md'), 'utf8');
  const blocks = [...skill.matchAll(/```bash\n([\s\S]*?)```/g)].map((match) => match[1]);
  for (const block of blocks) {
    const result = spawnSync('bash', ['-n'], { input: block, encoding: 'utf8' });
    assert.strictEqual(result.status, 0, result.stderr);
  }
  for (const failedCommand of ['status', 'switch', 'commit', 'push']) {
    const block = blocks.find((value) =>
      failedCommand === 'status'
        ? value.includes('checkout_status=')
        : failedCommand === 'switch'
          ? value.includes(' switch -c ')
          : value.includes(' commit -m '),
    );
    assert(block, `Missing ${failedCommand} fence`);
    const binPath = path.join(testRoot, `shell-${randomUUID()}`);
    fs.mkdirSync(binPath);
    const log = path.join(binPath, 'commands.log');
    writeCommandDouble(
      binPath,
      'git',
      `const fs=require('fs');const args=process.argv.slice(2);
fs.appendFileSync(process.env.COMMAND_LOG,args.join(' ')+'\\n');
if(args.includes(process.env.FAIL_COMMAND)) process.exitCode=71;`,
    );
    writeCommandDouble(binPath, 'node', `process.exitCode=0;`);
    // The command wrappers use the real runtime so that a node double cannot recurse.
    fs.writeFileSync(
      path.join(binPath, 'git'),
      `#!/bin/sh\nexec "${process.execPath}" "$(dirname "$0")/git.js" "$@"\n`,
    );
    fs.writeFileSync(path.join(binPath, 'node'), `#!/bin/sh\nexit 0\n`);
    const result = spawnSync('bash', ['-s'], {
      input: block,
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${binPath}${path.delimiter}${process.env.PATH}`,
        COMMAND_LOG: log,
        FAIL_COMMAND: failedCommand,
        release_worktree: binPath,
        working_branch: 'test/release',
        tooling_root: '/synthetic/tooling',
        source_commit: 'a'.repeat(40),
        version: '1.2.4',
      },
    });
    assert.notStrictEqual(result.status, 0);
    const commands = fs.readFileSync(log, 'utf8').trim().split('\n');
    assert(commands[commands.length - 1].split(' ').includes(failedCommand), commands.join('\n'));
  }
});

for (const type of ['premajor', 'preminor', 'prepatch']) {
  test(`${type} pending changes cannot bypass the approved exception intent`, () => {
    const repoPath = createRepository({ changeTypes: [type] });
    const result = runHelper(
      repoPath,
      previewArguments(repoPath, '2.0.0-0'),
      fakePnpmEnvironment(path.join(testRoot, `pnpm-${randomUUID()}.log`)),
    );
    assert.notStrictEqual(result.status, 0);
    assert.match(result.stderr, /Exceptional pending changes require/);
    assert.strictEqual(git(repoPath, ['status', '--porcelain=v1', '--untracked-files=all']), '');
  });
}

test('grouped minor change cannot be masked by a lower prerelease-prefix intent', () => {
  const repoPath = createRepository({ changeTypes: ['minor'] });
  const file = path.join(repoPath, 'change/change-0.json');
  fs.writeFileSync(file, JSON.stringify({ changes: [JSON.parse(fs.readFileSync(file))] }));
  git(repoPath, ['add', 'change']);
  git(repoPath, ['commit', '--quiet', '-m', 'Group synthetic changes']);
  git(repoPath, ['update-ref', 'refs/remotes/origin/main', 'HEAD']);
  const source = git(repoPath, ['rev-parse', 'HEAD']);
  const intent = path.join(testRoot, `intent-${randomUUID()}.json`);
  fs.writeFileSync(
    intent,
    JSON.stringify({
      sourceCommit: source,
      expectedVersion: '1.2.4-beta.0',
      changeType: 'prerelease',
      prereleasePrefix: 'beta',
    }),
  );
  const result = runHelper(
    repoPath,
    ['preview', '--source-commit', source, '--expected-version', '1.2.4-beta.0', '--intent-file', intent],
    fakePnpmEnvironment(path.join(testRoot, `pnpm-${randomUUID()}.log`)),
  );
  assert.notStrictEqual(result.status, 0);
  assert.match(result.stderr, /Pending change outranks/);
});

test('untrusted local source is rejected before installing dependencies', () => {
  const repoPath = createRepository();
  write(repoPath, 'untrusted.txt', 'local commit not on approved main');
  git(repoPath, ['add', '.']);
  git(repoPath, ['commit', '--quiet', '-m', 'Create untrusted local source']);
  const marker = path.join(testRoot, `pnpm-${randomUUID()}.log`);
  const result = runHelper(repoPath, previewArguments(repoPath, '1.2.4'), fakePnpmEnvironment(marker));
  assert.notStrictEqual(result.status, 0);
  assert.match(result.stderr, /merge-base.*failed/);
  assert.strictEqual(fs.existsSync(marker), false);
});

test('preparation children do not inherit publishing or GitHub token variables', () => {
  const repoPath = createRepository();
  const env = fakePnpmEnvironment(path.join(testRoot, `pnpm-${randomUUID()}.log`), {
    CHECK_NO_RELEASE_TOKENS: 'true',
    NPM_TOKEN: 'synthetic',
    NODE_AUTH_TOKEN: 'synthetic',
    GITHUB_TOKEN: 'synthetic',
    GH_TOKEN: 'synthetic',
    SYSTEM_ACCESSTOKEN: 'synthetic',
  });
  const result = runHelper(repoPath, previewArguments(repoPath, '1.2.4'), env);
  assert.strictEqual(result.status, 0, result.stderr);
});

test('runbook rejects unreviewed tooling HEAD before executing a node command', () => {
  const skill = fs.readFileSync(path.join(repositoryRoot, '.github/skills/release-teamsjs/SKILL.md'), 'utf8');
  const block = [...skill.matchAll(/```bash\n([\s\S]*?)```/g)]
    .map((m) => m[1])
    .find((b) => b.includes('checkout_status='));
  const binPath = path.join(testRoot, `bootstrap-${randomUUID()}`);
  fs.mkdirSync(binPath);
  writeCommandDouble(
    binPath,
    'git',
    `const args=process.argv.slice(2);
if(args[0]==='rev-parse')console.log((args[1]==='HEAD'?'b':'a').repeat(40));`,
  );
  const marker = path.join(binPath, 'node-ran');
  fs.writeFileSync(path.join(binPath, 'git'), `#!/bin/sh\nexec "${process.execPath}" "$(dirname "$0")/git.js" "$@"\n`);
  fs.writeFileSync(path.join(binPath, 'node'), `#!/bin/sh\ntouch "${marker}"\nexit 0\n`);
  fs.chmodSync(path.join(binPath, 'node'), 0o755);
  const result = spawnSync('bash', ['-s'], {
    input: block,
    encoding: 'utf8',
    env: { ...process.env, PATH: `${binPath}${path.delimiter}${process.env.PATH}` },
  });
  assert.notStrictEqual(result.status, 0);
  assert.match(result.stderr, /fetched origin\/main before executing/);
  assert.strictEqual(fs.existsSync(marker), false);
});
