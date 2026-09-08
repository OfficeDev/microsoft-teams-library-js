#!/usr/bin/env node

const { randomUUID } = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const VERSION_FILE = 'packages/teams-js/package.json';
const PREPARED_PATHS = new Set([
  'apps/teams-test-app/index_cdn.html',
  'apps/teams-test-app/package.json',
  'packages/teams-js/CHANGELOG.json',
  'packages/teams-js/CHANGELOG.md',
  'packages/teams-js/README.md',
  VERSION_FILE,
  'pnpm-lock.yaml',
]);
const REQUIRED_PREPARED_PATHS = [
  'apps/teams-test-app/index_cdn.html',
  'apps/teams-test-app/package.json',
  'packages/teams-js/CHANGELOG.md',
  'packages/teams-js/README.md',
  VERSION_FILE,
];
const SEMVER_PATTERN =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*)?$/;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    encoding: 'utf8',
    env: options.env || process.env,
    maxBuffer: 10 * 1024 * 1024,
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
    throw new Error(
      `${command} ${args.join(' ')} failed with exit code ${result.status}${output ? `:\n${output}` : ''}`,
    );
  }
  return result.stdout;
}

function git(repoRoot, args) {
  return run('git', ['-C', repoRoot, ...args]);
}

function repositoryRoot(cwd) {
  return run('git', ['-C', cwd, 'rev-parse', '--show-toplevel']).trim();
}

function parseArguments(argv) {
  const [command, ...rest] = argv;
  if (!['preview', 'verify'].includes(command)) {
    throw new Error(
      'Usage: prepare-release.js <preview|verify> --source-commit <40-character SHA> [--expected-version <semver>]',
    );
  }

  const values = {};
  for (let index = 0; index < rest.length; index += 2) {
    const flag = rest[index];
    const value = rest[index + 1];
    if (!['--source-commit', '--expected-version'].includes(flag) || !value) {
      throw new Error(`Unsupported or incomplete argument: ${flag || '<missing>'}`);
    }
    if (values[flag]) {
      throw new Error(`Duplicate argument: ${flag}`);
    }
    values[flag] = value;
  }

  const sourceCommit = values['--source-commit'];
  const expectedVersion = values['--expected-version'];
  if (!/^[0-9a-f]{40}$/.test(sourceCommit || '')) {
    throw new Error('--source-commit must be a full lowercase 40-character commit SHA');
  }
  if (expectedVersion && !SEMVER_PATTERN.test(expectedVersion)) {
    throw new Error('--expected-version must be an exact semantic version');
  }
  if (command === 'verify' && !expectedVersion) {
    throw new Error('--expected-version is required for verify');
  }
  return { command, sourceCommit, expectedVersion };
}

function status(repoRoot) {
  return git(repoRoot, ['status', '--porcelain=v1', '-z', '--untracked-files=all']);
}

function statusPaths(statusOutput) {
  const records = statusOutput.split('\0').filter(Boolean);
  const paths = [];
  for (const record of records) {
    const state = record.slice(0, 2);
    if (state.includes('R') || state.includes('C')) {
      throw new Error('Renames and copies are not valid release preparation output');
    }
    paths.push(record.slice(3));
  }
  return paths;
}

function assertCleanCheckout(repoRoot) {
  const checkoutStatus = status(repoRoot);
  if (checkoutStatus) {
    throw new Error(
      `Working tree must be clean, including untracked files:\n${statusPaths(checkoutStatus)
        .map((file) => `- ${file}`)
        .join('\n')}`,
    );
  }
}

function assertSourceCommit(repoRoot, sourceCommit) {
  git(repoRoot, ['cat-file', '-e', `${sourceCommit}^{commit}`]);
  const resolvedCommit = git(repoRoot, ['rev-parse', `${sourceCommit}^{commit}`]).trim();
  if (resolvedCommit !== sourceCommit) {
    throw new Error(`Source resolved to ${resolvedCommit}; expected ${sourceCommit}`);
  }
}

function readVersion(repoRoot, relativePath = VERSION_FILE) {
  const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
  if (typeof packageJson.version !== 'string') {
    throw new Error(`${relativePath} does not contain a string version`);
  }
  return packageJson.version;
}

function assertVersion(repoRoot, expectedVersion, relativePath = VERSION_FILE) {
  const actualVersion = readVersion(repoRoot, relativePath);
  if (actualVersion !== expectedVersion) {
    throw new Error(`${relativePath} has version ${actualVersion}; expected exactly ${expectedVersion}`);
  }
}

function resolveBeachball(repoRoot) {
  if (process.env.NODE_ENV === 'test' && process.env.PREPARE_RELEASE_TEST_BEACHBALL_BIN) {
    const testBeachballBin = process.env.PREPARE_RELEASE_TEST_BEACHBALL_BIN;
    if (!path.isAbsolute(testBeachballBin) || !fs.existsSync(testBeachballBin)) {
      throw new Error('PREPARE_RELEASE_TEST_BEACHBALL_BIN must name an existing absolute path');
    }
    return testBeachballBin;
  }
  try {
    return require.resolve('beachball/bin/beachball.js', { paths: [repoRoot] });
  } catch {
    throw new Error('Beachball is not installed. Run the repository dependency installation first.');
  }
}

function isPreparedPath(relativePath) {
  return PREPARED_PATHS.has(relativePath) || /^change\/[^/]+\.json$/.test(relativePath);
}

function assertPreparedPaths(paths) {
  const unexpectedPaths = paths.filter((relativePath) => !isPreparedPath(relativePath));
  if (unexpectedPaths.length) {
    throw new Error(
      `Release preparation changed unexpected paths:\n${unexpectedPaths.map((file) => `- ${file}`).join('\n')}`,
    );
  }
}

function removePreviewWorktree(repoRoot, previewPath, worktreeAdded) {
  if (worktreeAdded) {
    git(repoRoot, ['worktree', 'remove', '--force', '--', previewPath]);
  } else if (fs.existsSync(previewPath)) {
    fs.rmSync(previewPath, { recursive: true, force: true });
  }
}

function previewVersion(repoRoot, sourceCommit, expectedVersion) {
  assertCleanCheckout(repoRoot);
  assertSourceCommit(repoRoot, sourceCommit);
  const commonGitDirectory = git(repoRoot, ['rev-parse', '--path-format=absolute', '--git-common-dir']).trim();
  const previewParent = path.join(commonGitDirectory, 'release-version-previews');
  fs.mkdirSync(previewParent, { recursive: true });
  const previewPath = path.join(previewParent, `preview-${randomUUID()}`);
  let worktreeAdded = false;
  let failure;
  let previewResult;

  try {
    git(repoRoot, ['worktree', 'add', '--detach', '--', previewPath, sourceCommit]);
    worktreeAdded = true;
    assertSourceCommit(previewPath, sourceCommit);
    run('pnpm', ['install', '--frozen-lockfile', '--ignore-scripts'], { cwd: previewPath });
    const beachballBin = resolveBeachball(previewPath);
    run(
      process.execPath,
      [
        beachballBin,
        'bump',
        '--config',
        path.join(previewPath, 'beachball.config.js'),
        '--no-commit',
        '--no-git-tags',
        '--no-publish',
        '--no-push',
      ],
      { cwd: previewPath },
    );
    run('pnpm', ['install', '--lockfile-only', '--ignore-scripts'], { cwd: previewPath });
    assertSourceCommit(previewPath, sourceCommit);
    assertPreparedPaths(statusPaths(status(previewPath)));
    const version = readVersion(previewPath);
    if (expectedVersion) {
      assertVersion(previewPath, expectedVersion);
    }
    previewResult = { sourceCommit, version };
  } catch (error) {
    failure = error;
  }

  try {
    removePreviewWorktree(repoRoot, previewPath, worktreeAdded);
    assertCleanCheckout(repoRoot);
  } catch (cleanupError) {
    throw new Error(
      `${failure ? `${failure.message}\n` : ''}Failed to remove disposable preview worktree: ${cleanupError.message}`,
    );
  }
  if (failure) {
    throw failure;
  }

  return previewResult;
}

function extractIntegrity(content, relativePath) {
  const matches = [...content.matchAll(/integrity="([^"]+)"/g)].map((match) => match[1]);
  if (!matches.length || new Set(matches).size !== 1) {
    throw new Error(`${relativePath} must contain one consistent integrity value`);
  }
  return matches[0];
}

function verifyPreparation(repoRoot, sourceCommit, expectedVersion) {
  assertSourceCommit(repoRoot, sourceCommit);
  const headCommit = git(repoRoot, ['rev-parse', 'HEAD']).trim();
  if (headCommit !== sourceCommit) {
    throw new Error(`Preparation HEAD is ${headCommit}; expected pinned source ${sourceCommit}`);
  }

  const stagedPaths = git(repoRoot, ['diff', '--cached', '--name-only', '--no-renames']).trim();
  if (stagedPaths) {
    throw new Error('Review release preparation before staging it');
  }

  const changedPaths = statusPaths(status(repoRoot));
  assertPreparedPaths(changedPaths);
  for (const requiredPath of REQUIRED_PREPARED_PATHS) {
    if (!changedPaths.includes(requiredPath)) {
      throw new Error(`Release preparation did not change required path ${requiredPath}`);
    }
  }

  assertVersion(repoRoot, expectedVersion);
  assertVersion(repoRoot, expectedVersion, 'apps/teams-test-app/package.json');
  const readmePath = 'packages/teams-js/README.md';
  const testAppPath = 'apps/teams-test-app/index_cdn.html';
  const readme = fs.readFileSync(path.join(repoRoot, readmePath), 'utf8');
  const testApp = fs.readFileSync(path.join(repoRoot, testAppPath), 'utf8');
  for (const [relativePath, content] of [
    [readmePath, readme],
    [testAppPath, testApp],
  ]) {
    if (!content.includes(`res.cdn.office.net/teams-js/${expectedVersion}/js/MicrosoftTeams.min.js`)) {
      throw new Error(`${relativePath} does not reference the exact expected CDN version`);
    }
  }
  if (extractIntegrity(readme, readmePath) !== extractIntegrity(testApp, testAppPath)) {
    throw new Error('README and test app integrity values do not match');
  }

  const changeDirectory = path.join(repoRoot, 'change');
  if (
    fs.existsSync(changeDirectory) &&
    fs
      .readdirSync(changeDirectory, { withFileTypes: true })
      .some((entry) => entry.isFile() && entry.name.endsWith('.json'))
  ) {
    throw new Error('Release preparation left pending change files');
  }

  return { sourceCommit, expectedVersion, changedPaths: changedPaths.sort() };
}

function main() {
  const { command, sourceCommit, expectedVersion } = parseArguments(process.argv.slice(2));
  const repoRoot = repositoryRoot(process.cwd());
  const result =
    command === 'preview'
      ? previewVersion(repoRoot, sourceCommit, expectedVersion)
      : verifyPreparation(repoRoot, sourceCommit, expectedVersion);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  assertCleanCheckout,
  assertPreparedPaths,
  parseArguments,
  previewVersion,
  statusPaths,
  verifyPreparation,
};
