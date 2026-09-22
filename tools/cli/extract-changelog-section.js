/* eslint-disable */

const fs = require('fs');
const path = require('path');

const CHANGELOG_PATH = path.resolve(__dirname, '../../packages/teams-js/CHANGELOG.md');

/**
 * Returns the changelog body for a specific version (the content between the
 * `## <version>` header and the next `## ` header). If no version is provided,
 * the full changelog is returned.
 *
 * @param {string} [version] semver string, e.g. "2.53.1"
 * @param {string} [changelogPath] override path to CHANGELOG.md (used in tests)
 * @returns {string} the trimmed changelog section, or the full changelog
 */
function extractChangelogSection(version, changelogPath = CHANGELOG_PATH) {
  if (!fs.existsSync(changelogPath)) {
    throw new Error(`Changelog was not found at ${changelogPath}`);
  }
  const fullChangelog = fs.readFileSync(changelogPath, 'utf8');
  if (!version) {
    return fullChangelog;
  }
  // Split on level-2 headers, keeping the headers as delimiters so the array
  // alternates between header and body entries.
  const parts = fullChangelog.split(/(^## .*$)/m);
  const index = parts.findIndex((part) => part.trim() === `## ${version}`);
  if (index === -1) {
    throw new Error(`Matching version ${version} in changelog was not found`);
  }
  return parts[index + 1] ? parts[index + 1].trim() : '';
}

module.exports = { extractChangelogSection, CHANGELOG_PATH };

if (require.main === module) {
  const version = process.argv[2];
  try {
    process.stdout.write(extractChangelogSection(version));
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  }
}
