/* eslint-disable */

const fs = require('fs');
const path = require('path');

const { extractChangelogSection } = require('./extract-changelog-section');

const TEAMS_JS_PACKAGE_JSON = path.resolve(__dirname, '../../packages/teams-js/package.json');
const TEST_APP_PACKAGE_JSON = path.resolve(__dirname, '../../apps/teams-test-app/package.json');
const README_PATH = path.resolve(__dirname, '../../packages/teams-js/README.md');
const TEST_APP_HTML_PATH = path.resolve(__dirname, '../../apps/teams-test-app/index_cdn.html');
const CHANGE_DIR = path.resolve(__dirname, '../../change');

const CDN_URL_REGEX = /res\.cdn\.office\.net\/teams-js\/([^/]+)\/js\/MicrosoftTeams\.min\.js/g;
const NODE_MODULES_REGEX = /node_modules\/@microsoft\/teams-js@([^/]+)\/dist\/MicrosoftTeams\.min\.js/g;
const SEMVER_REGEX = /^\d+\.\d+\.\d+$/;

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

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * Asserts that every occurrence of `regex` in `content` captures `expected` as
 * its version. Pushes a failure message per stale/missing occurrence.
 */
function checkAllVersionsMatch(content, regex, expectedVersion, label, failures) {
  const matches = [...content.matchAll(regex)];
  if (matches.length === 0) {
    failures.push(`${label}: no reference found (expected version ${expectedVersion})`);
    return;
  }
  matches.forEach((match) => {
    if (match[1] !== expectedVersion) {
      failures.push(`${label}: found version "${match[1]}", expected "${expectedVersion}"`);
    }
  });
}

function getPreviousChangelogVersion(currentVersion) {
  const full = extractChangelogSection();
  const headers = [...full.matchAll(/^## (\d+\.\d+\.\d+)$/gm)].map((m) => m[1]);
  return headers.find((v) => v !== currentVersion);
}

function validate(version, options = {}) {
  const failures = [];

  // Check 9 (format): version must be a clean release semver (no prerelease/build metadata).
  if (!SEMVER_REGEX.test(version)) {
    failures.push(`Version "${version}" is not a clean release semver (expected MAJOR.MINOR.PATCH)`);
  }

  // Check 1: teams-js package.json version.
  const teamsJsVersion = readJson(TEAMS_JS_PACKAGE_JSON).version;
  if (teamsJsVersion !== version) {
    failures.push(`packages/teams-js/package.json version is "${teamsJsVersion}", expected "${version}"`);
  }

  // Check 2: test app package.json version.
  const testAppVersion = readJson(TEST_APP_PACKAGE_JSON).version;
  if (testAppVersion !== version) {
    failures.push(`apps/teams-test-app/package.json version is "${testAppVersion}", expected "${version}"`);
  }

  // Check 3: beachball change files have been consumed by the bump.
  if (fs.existsSync(CHANGE_DIR)) {
    const remaining = fs.readdirSync(CHANGE_DIR).filter((f) => f.endsWith('.json'));
    if (remaining.length > 0) {
      failures.push(
        `Unconsumed beachball change files remain in change/ (expected none on a release branch): ${remaining.join(', ')}`,
      );
    }
  }

  // Check 4: changelog section exists and is non-empty.
  let changelogSection = '';
  try {
    changelogSection = extractChangelogSection(version);
    if (!changelogSection.trim()) {
      failures.push(`Changelog section for ${version} is empty`);
    }
  } catch (e) {
    failures.push(`Changelog: ${e.message || e}`);
  }

  // Check 5: README references the version in both the CDN URL and the @version path.
  const readme = fs.readFileSync(README_PATH, 'utf8');
  checkAllVersionsMatch(readme, CDN_URL_REGEX, version, 'README.md CDN URL', failures);
  checkAllVersionsMatch(readme, NODE_MODULES_REGEX, version, 'README.md @microsoft/teams-js@version', failures);

  // Check 6: test app CDN HTML references the version in the CDN URL.
  const testAppHtml = fs.readFileSync(TEST_APP_HTML_PATH, 'utf8');
  checkAllVersionsMatch(testAppHtml, CDN_URL_REGEX, version, 'apps/teams-test-app/index_cdn.html CDN URL', failures);

  // Check (no major / no prerelease bump): major version must not change vs. the previous release.
  if (SEMVER_REGEX.test(version)) {
    const previous = getPreviousChangelogVersion(version);
    if (previous) {
      const currentMajor = version.split('.')[0];
      const previousMajor = previous.split('.')[0];
      if (currentMajor !== previousMajor) {
        failures.push(
          `Major version bump detected (${previous} -> ${version}); only patch/minor releases are allowed`,
        );
      }
    }
  }

  // Optional check 4b: PR body matches the extracted changelog section.
  if (options.prBodyFile) {
    if (!fs.existsSync(options.prBodyFile)) {
      failures.push(`PR body file was not found at ${options.prBodyFile}`);
    } else if (changelogSection.trim()) {
      const prBody = fs.readFileSync(options.prBodyFile, 'utf8');
      const normalize = (s) => s.replace(/\r\n/g, '\n').trim();
      if (!normalize(prBody).includes(normalize(changelogSection))) {
        failures.push('PR body does not contain the changelog section for this version');
      }
    }
  }

  return failures;
}

module.exports = { validate };

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  let version = args.version;
  if (!version || version === true) {
    version = readJson(TEAMS_JS_PACKAGE_JSON).version;
    console.log(`No --version provided; using packages/teams-js/package.json version "${version}"`);
  }
  try {
    const failures = validate(version, { prBodyFile: typeof args['pr-body-file'] === 'string' ? args['pr-body-file'] : undefined });
    if (failures.length > 0) {
      console.error(`Release integrity validation FAILED for version ${version}:`);
      failures.forEach((f) => console.error(`  - ${f}`));
      process.exit(1);
    }
    console.log(`Release integrity validation passed for version ${version}.`);
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  }
}
