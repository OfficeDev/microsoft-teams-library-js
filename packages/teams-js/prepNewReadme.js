const fs = require('fs');
const path = require('path');

const relativePathToManifestJson = './dist/MicrosoftTeams-manifest.json';
const relativePathToReadmeTemplate = './Readme.md';

const getIntegrityHash = () => {
  const absolutePathToManifestJson = path.resolve(__dirname, relativePathToManifestJson);
  if(!fs.existsSync(absolutePathToManifestJson)) {
    throw(`ERROR: MicrosoftTeams-manifest.json at ${absolutePathToManifestJson} was not found.`);
  }
  const manifestFile = fs.readFileSync(absolutePathToManifestJson);
  const manifestJson = JSON.parse(manifestFile);
  const integrityHash = manifestJson['MicrosoftTeams.min.js']['integrity'];
  if(!integrityHash) {
    throw 'ERROR: MicrosoftTeams.min.js integrity hash value was not parsed';
  }
  return integrityHash;
};

const updateReadmeWithIntegrityHash = (integrityHash) => {
  const absolutePathToReadmeTemplate = path.resolve(__dirname, relativePathToReadmeTemplate);
  if(!fs.existsSync(absolutePathToReadmeTemplate)) {
    throw(`ERROR: Readme-template.md at ${absolutePathToReadmeTemplate} was not found.`);
  }
  const readme = fs.readFileSync(absolutePathToReadmeTemplate, 'utf8');
  const result = readme.replace(/integrity=\".*?\"/, `integrity="${integrityHash}"`);
  fs.writeFileSync(absolutePathToReadmeTemplate, result);
};

(() => {
  console.log('readme-generator is running');
  const integrityHash = getIntegrityHash();
  updateReadmeWithIntegrityHash(integrityHash);
  console.log('readme-generator completed successfully!');
})();
