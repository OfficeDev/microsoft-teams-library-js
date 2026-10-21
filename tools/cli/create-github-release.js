/* eslint-disable */

const { execFileSync } = require('child_process');

/**
 * Creates or updates a GitHub *pre-release* for a release version. This is the
 * release object created when a release PR merges; Phase 2 promotes it to a
 * full release after the ADO prod publish succeeds.
 *
 * Idempotent: if the release/tag already exists it is updated rather than
 * duplicated. Uses the `gh` CLI, which must be authenticated via GH_TOKEN.
 *
 * Usage:
 *   node tools/cli/create-github-release.js --version 2.31.0 --target release/2.31.0 --notes-file notes.md [--prerelease]
 */

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

function gh(args, options = {}) {
  return execFileSync('gh', args, { encoding: 'utf8', stdio: options.capture ? 'pipe' : 'inherit' });
}

function releaseExists(tag) {
  try {
    execFileSync('gh', ['release', 'view', tag], { encoding: 'utf8', stdio: 'pipe' });
    return true;
  } catch (e) {
    return false;
  }
}

function createOrUpdateRelease({ version, target, notesFile, prerelease }) {
  const tag = `v${version}`;
  const title = prerelease ? `v${version} (pending prod publish)` : `v${version}`;

  if (releaseExists(tag)) {
    console.log(`Release ${tag} already exists; updating notes/title.`);
    const args = ['release', 'edit', tag, '--title', title];
    if (notesFile) {
      args.push('--notes-file', notesFile);
    }
    args.push('--prerelease', prerelease ? 'true' : 'false');
    gh(args);
  } else {
    console.log(`Creating ${prerelease ? 'pre-release' : 'release'} ${tag}.`);
    const args = ['release', 'create', tag, '--title', title];
    if (target) {
      args.push('--target', target);
    }
    if (notesFile) {
      args.push('--notes-file', notesFile);
    } else {
      args.push('--generate-notes');
    }
    if (prerelease) {
      args.push('--prerelease');
    }
    gh(args);
  }
  console.log(`Done: ${tag}`);
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const version = typeof args.version === 'string' ? args.version : undefined;
  if (!version) {
    console.error('ERROR: --version <x.y.z> is required');
    process.exit(1);
  }
  try {
    createOrUpdateRelease({
      version,
      target: typeof args.target === 'string' ? args.target : undefined,
      notesFile: typeof args['notes-file'] === 'string' ? args['notes-file'] : undefined,
      prerelease: Boolean(args.prerelease),
    });
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  }
}

module.exports = { createOrUpdateRelease };
