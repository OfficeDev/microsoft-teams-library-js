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

module.exports = {
  execShellCommand,
  buildAndGetIntegrityHash,
};
