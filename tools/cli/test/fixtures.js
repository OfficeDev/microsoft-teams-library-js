/* eslint-disable */

const fs = require('fs');
const os = require('os');
const path = require('path');

/**
 * Creates a temporary directory populated with a valid, self-consistent set of
 * release files for the given version. Individual files can be overridden to
 * simulate specific failure modes. Returns { dir, paths, integrity, cleanup }.
 */
function createReleaseFixture(version = '2.53.1', overrides = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'teamsjs-release-'));
  const integrity = overrides.integrity || 'sha384-TESTINTEGRITYHASHVALUE0000000000000000000000000000000000000000000';

  const paths = {
    teamsJsPackageJson: path.join(dir, 'teams-js.package.json'),
    testAppPackageJson: path.join(dir, 'test-app.package.json'),
    readme: path.join(dir, 'README.md'),
    testAppHtml: path.join(dir, 'index_cdn.html'),
    changelog: path.join(dir, 'CHANGELOG.md'),
    changeDir: path.join(dir, 'change'),
    manifest: path.join(dir, 'MicrosoftTeams-manifest.json'),
  };

  const teamsJsVersion = overrides.teamsJsVersion || version;
  const testAppVersion = overrides.testAppVersion || version;
  const readmeVersion = overrides.readmeVersion || version;
  const htmlVersion = overrides.htmlVersion || version;
  const readmeIntegrity = overrides.readmeIntegrity || integrity;
  const htmlIntegrity = overrides.htmlIntegrity || integrity;

  fs.writeFileSync(paths.teamsJsPackageJson, JSON.stringify({ name: '@microsoft/teams-js', version: teamsJsVersion }));
  fs.writeFileSync(paths.testAppPackageJson, JSON.stringify({ name: 'teams-test-app', version: testAppVersion }));

  const readme =
    overrides.readme ||
    [
      `You can reference these files directly [from here](https://res.cdn.office.net/teams-js/${readmeVersion}/js/MicrosoftTeams.min.js) or point your package manager at them.`,
      `<script`,
      `  src="https://res.cdn.office.net/teams-js/${readmeVersion}/js/MicrosoftTeams.min.js"`,
      `  integrity="${readmeIntegrity}"`,
      `  crossorigin="anonymous"></script>`,
      `<script src="node_modules/@microsoft/teams-js@${readmeVersion}/dist/MicrosoftTeams.min.js"></script>`,
    ].join('\n');
  fs.writeFileSync(paths.readme, readme);

  const html =
    overrides.html ||
    [
      `<script`,
      `  src="https://res.cdn.office.net/teams-js/${htmlVersion}/js/MicrosoftTeams.min.js"`,
      `  integrity="${htmlIntegrity}"`,
      `  crossorigin="anonymous"></script>`,
    ].join('\n');
  fs.writeFileSync(paths.testAppHtml, html);

  const changelog =
    overrides.changelog ||
    [
      '# Change Log - @microsoft/teams-js',
      '',
      '<!-- Start content -->',
      '',
      `## ${version}`,
      '',
      'Wed, 17 Jun 2026 17:10:04 GMT',
      '',
      '### Patches',
      '',
      '- Fixed a thing',
      '',
      '## 2.53.0',
      '',
      'Wed, 06 May 2026 19:04:08 GMT',
      '',
      '### Patches',
      '',
      '- An earlier fix',
      '',
    ].join('\n');
  fs.writeFileSync(paths.changelog, changelog);

  fs.mkdirSync(paths.changeDir);
  if (overrides.changeFiles) {
    overrides.changeFiles.forEach((name, i) => fs.writeFileSync(path.join(paths.changeDir, name), JSON.stringify({ i })));
  }

  fs.writeFileSync(
    paths.manifest,
    JSON.stringify({ 'MicrosoftTeams.min.js': { integrity: overrides.manifestIntegrity || integrity } }),
  );

  const cleanup = () => fs.rmSync(dir, { recursive: true, force: true });
  return { dir, paths, integrity, cleanup };
}

module.exports = { createReleaseFixture };
