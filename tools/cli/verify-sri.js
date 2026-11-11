/* eslint-disable */

const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.resolve(__dirname, '../../packages/teams-js/dist/umd/MicrosoftTeams-manifest.json');
const README_PATH = path.resolve(__dirname, '../../packages/teams-js/README.md');
const TEST_APP_HTML_PATH = path.resolve(__dirname, '../../apps/teams-test-app/index_cdn.html');

const INTEGRITY_REGEX = /integrity="([^"]+)"/g;

/**
 * Reads the integrity (SRI) hash of MicrosoftTeams.min.js from the built UMD
 * manifest. Requires the package to have been built first (`pnpm build`).
 *
 * @param {string} [manifestPath] override path (used in tests)
 * @returns {string} the integrity hash, e.g. "sha384-..."
 */
function getManifestIntegrity(manifestPath = MANIFEST_PATH) {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest was not found at ${manifestPath}. Run 'pnpm build' first.`);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const entry = manifest['MicrosoftTeams.min.js'];
  const integrity = entry && entry.integrity;
  if (!integrity) {
    throw new Error('MicrosoftTeams.min.js integrity hash value was not found in the manifest');
  }
  return integrity;
}

/**
 * Returns all integrity="..." attribute values found in a file.
 *
 * @param {string} filePath
 * @returns {string[]}
 */
function getIntegrityAttributes(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File was not found at ${filePath}`);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  return [...content.matchAll(INTEGRITY_REGEX)].map((match) => match[1]);
}

/**
 * Verifies that every checked-in integrity attribute (in the README and the
 * CDN test app) matches the freshly-built manifest integrity hash.
 *
 * @param {object} [paths] optional path overrides { manifest, readme, testAppHtml }
 * @returns {string[]} list of human-readable failure messages (empty = success)
 */
function verifySri(paths = {}) {
  const manifestPath = paths.manifest || MANIFEST_PATH;
  const filesToCheck = [paths.readme || README_PATH, paths.testAppHtml || TEST_APP_HTML_PATH];
  const failures = [];
  const expected = getManifestIntegrity(manifestPath);

  for (const filePath of filesToCheck) {
    const attributes = getIntegrityAttributes(filePath);
    if (attributes.length === 0) {
      failures.push(`No integrity attribute found in ${filePath}`);
      continue;
    }
    attributes.forEach((value) => {
      if (value !== expected) {
        failures.push(`Integrity mismatch in ${filePath}: found "${value}", expected "${expected}"`);
      }
    });
  }
  return failures;
}

module.exports = { verifySri, getManifestIntegrity, getIntegrityAttributes };

if (require.main === module) {
  try {
    const failures = verifySri();
    if (failures.length > 0) {
      console.error('SRI verification FAILED:');
      failures.forEach((f) => console.error(`  - ${f}`));
      process.exit(1);
    }
    console.log('SRI verification passed: all integrity hashes match the built manifest.');
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  }
}
