/* eslint-disable */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const execShellCommand = async (cmd) => {
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
  await execShellCommand('pnpm install');
  await execShellCommand('pnpm build');

  if (!fs.existsSync(absolutePathToManifestJson)) {
    throw `ERROR: MicrosoftTeams-manifest.json at ${absolutePathToManifestJson} was not found.`;
  }
  const manifestFile = fs.readFileSync(absolutePathToManifestJson);
  const manifestJson = JSON.parse(manifestFile);
  const integrityHash = manifestJson['MicrosoftTeams.min.js']['integrity'];
  if (!integrityHash) {
    throw new Error('MicrosoftTeams.min.js integrity hash value was not parsed');
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
    .replace(
      /res.cdn.office.net\/teams-js\/.*\/js\/MicrosoftTeams.min.js/g,
      `res.cdn.office.net/teams-js/${version}/js/MicrosoftTeams.min.js`,
    )
    .replace(
      /node_modules\/@microsoft\/teams-js@.*\/dist\/MicrosoftTeams.min.js/g,
      `node_modules/@microsoft/teams-js@${version}/dist/MicrosoftTeams.min.js`,
    );
  fs.writeFileSync(absolutePath, result);
};

(async () => {
  try {
    const relativePathToTeamsJsPackageJson = '../../packages/teams-js/package.json';
    const relativePathToTeamsJsReadme = '../../packages/teams-js/README.md';
    const relativePathToTestAppPackageJson = '../../apps/teams-test-app/package.json';
    const relativePathToTestAppHtml = '../../apps/teams-test-app/index_cdn.html';

    const absolutePathToTeamsJsPackageJson = path.resolve(__dirname, relativePathToTeamsJsPackageJson);
    const absolutePathTestAppPackageJson = path.resolve(__dirname, relativePathToTestAppPackageJson);
    const absolutePathToTeamsJsReadme = path.resolve(__dirname, relativePathToTeamsJsReadme);
    const absolutePathToTestAppHtml = path.resolve(__dirname, relativePathToTestAppHtml);

    await execShellCommand('pnpm beachball bump');
    let version = require(relativePathToTeamsJsPackageJson).version;

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
