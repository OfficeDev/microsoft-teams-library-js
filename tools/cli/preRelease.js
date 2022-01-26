/* eslint-disable */

const fs = require('fs');
const path = require('path');
const { buildAndGetIntegrityHash } = require('./utils');

const relativePathToTeamsJsPackageJson = '../../packages/teams-js/package.json';
const relativePathToTeamsJsReadme = '../../packages/teams-js/README.md';

const relativePathToTestAppPackageJson = '../../apps/teams-test-app/package.json';
const relativePathToTestAppHtml = '../../apps/teams-test-app/index_cdn.html';

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

(async () => {
  const args = process.argv.slice(2);
  const version = args[0];
  if (!version) {
    console.error('No version specified. Please specify version as an argument');
    process.exit(1);
  }
  try {
    const absolutePathTeamsJsPackageJson = path.resolve(__dirname, relativePathToTeamsJsPackageJson);
    const absolutePathTestAppPackageJson = path.resolve(__dirname, relativePathToTestAppPackageJson);
    const absolutePathToTeamsJsReadme = path.resolve(__dirname, relativePathToTeamsJsReadme);
    const absolutePathToTestAppHtml = path.resolve(__dirname, relativePathToTestAppHtml);

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
