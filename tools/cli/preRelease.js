/* eslint-disable */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const execShellCommand = async cmd => {
  return new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 1024 * 500 }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else if (stderr) {
        // Most cli programs output logs to stderr
        // Breaking errors would be rejected in the prior case
        console.log(stderr);
        resolve(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
};

const buildAndGetIntegrityHash = async () => {
  const relativePathToManifestJson = '../../packages/teams-js/dist/MicrosoftTeams-manifest.json';
  const absolutePathToManifestJson = path.resolve(__dirname, relativePathToManifestJson);

  console.log('Building @microsoft/teams-js');
  await execShellCommand('yarn workspace @microsoft/teams-js build');

  if (!fs.existsSync(absolutePathToManifestJson)) {
    throw `ERROR: MicrosoftTeams-manifest.json at ${absolutePathToManifestJson} was not found.`;
  }
  const manifestFile = fs.readFileSync(absolutePathToManifestJson);
  const manifestJson = JSON.parse(manifestFile);
  const integrityHash = manifestJson['MicrosoftTeams.min.js']['integrity'];
  if (!integrityHash) {
    throw 'ERROR: MicrosoftTeams.min.js integrity hash value was not parsed';
  }
  return integrityHash;
};

const updatePackageJson = (absolutePath, version) => {
  console.log(`Updating ${absolutePath} version to ${version}`);
  if (!fs.existsSync(absolutePath)) {
    throw `ERROR: ${absolutePath} was not found.`;
  }
  const packageJson = fs.readFileSync(absolutePath, 'utf8');
  const newPackageJson = packageJson.replace(/"version": ".*"/, `"version": "${version}"`);
  fs.writeFileSync(absolutePath, newPackageJson);
};

const updateVersionAndIntegrity = async (absolutePath, version, integrityHash) => {
  console.log(`Updating ${absolutePath} with new version and integrity hash`);
  if (!fs.existsSync(absolutePath)) {
    throw `ERROR: README.md at ${absolutePath} was not found.`;
  }
  const readme = fs.readFileSync(absolutePath, 'utf8');
  const result = readme
    .replace(/integrity=\".*?\"/, `integrity="${integrityHash}"`)
    .replace(/2.0.0-beta..*\d/g, version);
  fs.writeFileSync(absolutePath, result);
};

const updateChangeLog = async version => {
  const relativePathToChangelog = '../../packages/teams-js/CHANGELOG.md';
  const absolutePathToChangelog = path.resolve(__dirname, relativePathToChangelog);
  if (!fs.existsSync(absolutePathToChangelog)) {
    throw `ERROR: ${absolutePathToChangelog} was not found.`;
  }
  await execShellCommand('yarn beachball bump');
  const changeLog = fs.readFileSync(absolutePathToChangelog, 'utf8');
  if (!version) {
    return changeLog;
  } else {
    const newChangeLog = changeLog.replace(/(## 2.0.0)/, `## ${version}"`);
    fs.writeFileSync(absolutePathToChangelog, newChangeLog);
  }
};

(async () => {
  const args = process.argv.slice(2);
  const version = args[0];
  if (!version) {
    console.error('No version specified. Please specify version as an argument');
    process.exit(1);
  }
  try {
    const relativePathToTeamsJsPackageJson = '../../packages/teams-js/package.json';
    const relativePathToTeamsJsReadme = '../../packages/teams-js/README.md';
    const relativePathToTestAppPackageJson = '../../apps/teams-test-app/package.json';
    const relativePathToTestAppHtml = '../../apps/teams-test-app/index_cdn.html';

    const absolutePathTeamsJsPackageJson = path.resolve(__dirname, relativePathToTeamsJsPackageJson);
    const absolutePathTestAppPackageJson = path.resolve(__dirname, relativePathToTestAppPackageJson);
    const absolutePathToTeamsJsReadme = path.resolve(__dirname, relativePathToTeamsJsReadme);
    const absolutePathToTestAppHtml = path.resolve(__dirname, relativePathToTestAppHtml);

    await updateChangeLog(version);

    updatePackageJson(absolutePathTeamsJsPackageJson, version);
    updatePackageJson(absolutePathTestAppPackageJson, version);
    const integrityHash = await buildAndGetIntegrityHash();
    updateVersionAndIntegrity(absolutePathToTeamsJsReadme, version, integrityHash);
    updateVersionAndIntegrity(absolutePathToTestAppHtml, version, integrityHash);
  } catch (e) {
    console.log('Something went wrong!');
    console.error(e);
    process.exit(1);
  }
})();
