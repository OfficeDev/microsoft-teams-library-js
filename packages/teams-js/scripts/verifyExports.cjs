/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * Verifies that every entry point declared in package.json `exports` actually exists on disk after
 * a build, and that the cloud subpaths and the clouds known to the build config agree.
 *
 * An exports map is easy to get subtly wrong -- a typo produces a package that installs fine and
 * only fails at the consumer's import. Run after `pnpm build-all-clouds`.
 */

const fs = require('fs');
const path = require('path');

const pkgDir = path.resolve(__dirname, '..');
const pkg = require(path.join(pkgDir, 'package.json'));
const { SOVEREIGN_CLOUDS } = require(path.join(pkgDir, 'cloudBuild.cjs'));

const problems = [];
const checked = [];

function checkFile(subpath, condition, relativePath) {
  const absolute = path.join(pkgDir, relativePath);
  if (fs.existsSync(absolute)) {
    checked.push(`  ok    ${subpath} [${condition}] -> ${relativePath}`);
  } else {
    problems.push(`  MISSING  ${subpath} [${condition}] -> ${relativePath}`);
  }
}

// 1. Every file referenced by a concrete exports entry must exist.
for (const [subpath, target] of Object.entries(pkg.exports)) {
  if (subpath.includes('*')) {
    continue; // wildcard back-compat entry, nothing concrete to verify
  }
  if (typeof target === 'string') {
    checkFile(subpath, 'default', target);
    continue;
  }
  for (const [condition, file] of Object.entries(target)) {
    checkFile(subpath, condition, file);
  }
}

// 2. The exports map and the build config must agree on which clouds exist. Without this, adding a
//    cloud to one and not the other produces a build that succeeds and a package that cannot
//    import that cloud.
const exportedClouds = Object.keys(pkg.exports)
  .filter((k) => k.startsWith('./') && !k.includes('*') && k !== './package.json')
  .map((k) => k.slice(2))
  .sort();
const expectedClouds = [...SOVEREIGN_CLOUDS].sort();
if (exportedClouds.join(',') !== expectedClouds.join(',')) {
  problems.push(
    `  MISMATCH  exports subpaths [${exportedClouds.join(', ')}] do not match ` +
      `SOVEREIGN_CLOUDS [${expectedClouds.join(', ')}]`,
  );
}

// 3. typesVersions must cover the same clouds, so that consumers on classic module resolution
//    (which ignores the exports map) still get types for a sovereign subpath.
const typesVersionClouds = Object.keys((pkg.typesVersions && pkg.typesVersions['*']) || {}).sort();
if (typesVersionClouds.join(',') !== expectedClouds.join(',')) {
  problems.push(
    `  MISMATCH  typesVersions [${typesVersionClouds.join(', ')}] do not match ` +
      `SOVEREIGN_CLOUDS [${expectedClouds.join(', ')}]`,
  );
}

// 4. The root entry must keep pointing at the prod build. This is the guard against a refactor
//    silently repointing existing consumers at a sovereign bundle.
const rootImport = pkg.exports['.'].import;
if (rootImport !== pkg.module) {
  problems.push(`  MISMATCH  exports["."].import (${rootImport}) != module (${pkg.module})`);
}
if (pkg.exports['.'].require !== pkg.main) {
  problems.push(`  MISMATCH  exports["."].require (${pkg.exports['.'].require}) != main (${pkg.main})`);
}
if (pkg.exports['.'].types !== pkg.typings) {
  problems.push(`  MISMATCH  exports["."].types (${pkg.exports['.'].types}) != typings (${pkg.typings})`);
}

console.log(checked.join('\n'));
if (problems.length) {
  console.error('\nExports verification FAILED:\n' + problems.join('\n'));
  process.exit(1);
}
console.log(`\nExports verification passed (${checked.length} entry points).`);
