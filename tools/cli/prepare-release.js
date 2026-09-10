#!/usr/bin/env node

const { randomUUID } = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');
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
const CHANGE_TYPES = ['none', 'prerelease', 'prepatch', 'patch', 'preminor', 'minor', 'premajor', 'major'];
const COMMANDS = ['preview', 'prepare', 'verify', 'stage', 'check-staged'];
const BUILD_ENV = Object.fromEntries(
  Object.entries(process.env).filter(
    ([name]) =>
      !/^(NPM_TOKEN|NODE_AUTH_TOKEN|GITHUB_TOKEN|GH_TOKEN|GH_ENTERPRISE_TOKEN|GITHUB_ENTERPRISE_TOKEN|SYSTEM_ACCESSTOKEN)$/i.test(
        name,
      ),
  ),
);

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    encoding: 'utf8',
    env: options.env || BUILD_ENV,
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
  if (!COMMANDS.includes(command)) {
    throw new Error(
      `Usage: prepare-release.js <${COMMANDS.join('|')}> --source-commit <SHA> [--expected-version <semver>] [--intent-file <approved.json>]`,
    );
  }

  const values = {};
  for (let index = 0; index < rest.length; index += 2) {
    const flag = rest[index];
    const value = rest[index + 1];
    if (!['--source-commit', '--expected-version', '--intent-file'].includes(flag) || !value) {
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
  if (command !== 'preview' && !expectedVersion) {
    throw new Error(`--expected-version is required for ${command}`);
  }
  if (['verify', 'stage', 'check-staged'].includes(command) && values['--intent-file'])
    throw new Error('Verification does not consume an exception intent');
  return { command, sourceCommit, expectedVersion, intentFile: values['--intent-file'] };
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
  try {
    const binary = require.resolve('beachball/bin/beachball.js', { paths: [repoRoot] });
    if (JSON.parse(fs.readFileSync(path.join(path.dirname(binary), '../package.json'))).version !== '2.62.0') {
      throw new Error('Review release preparation against the new Beachball version before use.');
    }
    return binary;
  } catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') throw error;
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

function readIntent(intentFile, sourceCommit, expectedVersion) {
  if (!intentFile) return undefined;
  const intent = JSON.parse(fs.readFileSync(intentFile, 'utf8'));
  if (
    !intent ||
    Object.keys(intent).sort().join(',') !== 'changeType,expectedVersion,prereleasePrefix,sourceCommit' ||
    intent.sourceCommit !== sourceCommit ||
    intent.expectedVersion !== expectedVersion ||
    !['major', 'premajor', 'preminor', 'prepatch', 'prerelease'].includes(intent.changeType) ||
    (intent.changeType === 'major'
      ? intent.prereleasePrefix !== null
      : typeof intent.prereleasePrefix !== 'string' || !/^[a-z][a-z0-9-]*$/.test(intent.prereleasePrefix)) ||
    (intent.changeType === 'major'
      ? expectedVersion.includes('-')
      : !expectedVersion.includes(`-${intent.prereleasePrefix}.`))
  ) {
    throw new Error('Exception intent must match the independently approved source, version and channel.');
  }
  return intent;
}

function previewVersion(repoRoot, sourceCommit, expectedVersion, intentFile, prepare = false) {
  assertCleanCheckout(repoRoot);
  assertSourceCommit(repoRoot, sourceCommit);
  git(repoRoot, ['merge-base', '--is-ancestor', sourceCommit, 'refs/remotes/origin/main']);
  const intent = readIntent(intentFile, sourceCommit, expectedVersion);
  const previewParent = fs.mkdtempSync(path.join(os.tmpdir(), 'teamsjs-prepare-'));
  const previewPath = path.join(previewParent, 'candidate');
  let worktreeAdded = false;
  let failure;
  let previewResult;

  try {
    git(repoRoot, ['worktree', 'add', '--detach', '--', previewPath, sourceCommit]);
    worktreeAdded = true;
    assertSourceCommit(previewPath, sourceCommit);
    run('pnpm', ['install', '--frozen-lockfile', '--ignore-scripts'], { cwd: previewPath });
    const beachballBin = resolveBeachball(previewPath);
    const configPath = path.join(previewPath, 'beachball.config.js');
    const originalConfig = fs.readFileSync(configPath);
    try {
      const pendingDirectory = path.join(previewPath, 'change');
      const pendingFiles = fs.existsSync(pendingDirectory)
        ? fs.readdirSync(pendingDirectory).filter((f) => f.endsWith('.json'))
        : [];
      for (const file of pendingFiles) {
        const changeFile = JSON.parse(fs.readFileSync(path.join(pendingDirectory, file)));
        const changes = Array.isArray(changeFile.changes) ? changeFile.changes : [changeFile];
        for (const change of changes) {
          if (!CHANGE_TYPES.includes(change.type)) throw new Error('Unsupported pending change type.');
          if (!intent && !['none', 'patch', 'minor'].includes(change.type)) {
            throw new Error('Exceptional pending changes require an independently approved intent.');
          }
          if (intent?.prereleasePrefix && CHANGE_TYPES.indexOf(change.type) > CHANGE_TYPES.indexOf(intent.changeType)) {
            throw new Error(
              'Pending change outranks the approved prerelease intent; approve a different version/type.',
            );
          }
        }
      }
      if (intent) {
        // This worktree is owned by this attempt; neither main nor the caller's config is changed.
        fs.appendFileSync(
          configPath,
          `\nObject.assign(module.exports, ${JSON.stringify({
            disallowedChangeTypes: [],
            ...(intent.prereleasePrefix ? { prereleasePrefix: intent.prereleasePrefix } : {}),
          })});\n`,
        );
        const changeDirectory = path.join(previewPath, 'change');
        fs.mkdirSync(changeDirectory, { recursive: true });
        fs.writeFileSync(
          path.join(changeDirectory, `release-intent-${randomUUID()}.json`),
          JSON.stringify({
            type: intent.changeType,
            comment: 'Prepare the approved release version.',
            packageName: '@microsoft/teams-js',
            email: 'maintainer@example.invalid',
            dependentChangeType: 'none',
          }),
          { flag: 'wx' },
        );
      }
      fs.appendFileSync(
        configPath,
        '\nObject.assign(module.exports, {commit: false, gitTags: false, publish: false, push: false});\n',
      );
      if (prepare) run(process.execPath, [path.join(previewPath, 'tools/cli/preRelease.js')], { cwd: previewPath });
      else
        run(
          process.execPath,
          [beachballBin, 'bump', '--config', configPath, '--no-commit', '--no-git-tags', '--no-publish', '--no-push'],
          { cwd: previewPath },
        );
    } finally {
      fs.writeFileSync(configPath, originalConfig);
    }
    run('pnpm', ['install', '--lockfile-only', '--ignore-scripts'], { cwd: previewPath });
    if (git(previewPath, ['rev-parse', 'HEAD']).trim() !== sourceCommit)
      throw new Error('Preparation changed pinned HEAD.');
    assertPreparedPaths(statusPaths(status(previewPath)));
    const version = readVersion(previewPath);
    if (expectedVersion) {
      assertVersion(previewPath, expectedVersion);
    }
    if (prepare) verifyPreparation(previewPath, sourceCommit, expectedVersion);
    previewResult = { sourceCommit, version, ...(prepare ? { worktree: previewPath } : {}) };
  } catch (error) {
    failure = error;
  }

  try {
    if (failure || !prepare) {
      removePreviewWorktree(repoRoot, previewPath, worktreeAdded);
      fs.rmdirSync(previewParent);
    }
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

function verifyPreparation(repoRoot, sourceCommit, expectedVersion, staged = false) {
  assertSourceCommit(repoRoot, sourceCommit);
  const headCommit = git(repoRoot, ['rev-parse', 'HEAD']).trim();
  if (headCommit !== sourceCommit) {
    throw new Error(`Preparation HEAD is ${headCommit}; expected pinned source ${sourceCommit}`);
  }

  const stagedPaths = git(repoRoot, ['diff', '--cached', '--name-only', '--no-renames']).trim();
  if (stagedPaths && !staged) {
    throw new Error('Review release preparation before staging it');
  }
  if (
    staged &&
    (!stagedPaths ||
      git(repoRoot, ['diff', '--name-only']).trim() ||
      git(repoRoot, ['ls-files', '--others', '--exclude-standard']).trim())
  ) {
    throw new Error('Staged preparation must be complete with no unstaged or untracked residue');
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
  if (
    !fs
      .readFileSync(path.join(repoRoot, 'packages/teams-js/CHANGELOG.md'), 'utf8')
      .split('\n')
      .some((line) => line.trim() === `## ${expectedVersion}`)
  )
    throw new Error('Expected changelog section missing.');
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
  const bundle = fs.readFileSync(path.join(repoRoot, 'packages/teams-js/dist/umd/MicrosoftTeams.min.js'));
  const integrity = `sha384-${require('crypto').createHash('sha384').update(bundle).digest('base64')}`;
  if (extractIntegrity(readme, readmePath) !== integrity || extractIntegrity(testApp, testAppPath) !== integrity) {
    throw new Error('README and test app integrity values do not match built bytes');
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
  const { command, sourceCommit, expectedVersion, intentFile } = parseArguments(process.argv.slice(2));
  const repoRoot = repositoryRoot(process.cwd());
  const result = ['verify', 'stage', 'check-staged'].includes(command)
    ? verifyPreparation(repoRoot, sourceCommit, expectedVersion, command === 'check-staged')
    : previewVersion(repoRoot, sourceCommit, expectedVersion, intentFile, command === 'prepare');
  if (command === 'stage') git(repoRoot, ['add', '-A', '--', ...result.changedPaths]);
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
