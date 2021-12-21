const fs = require('fs');
const path = require('path');

const relativePathToManifestJson = './dist/MicrosoftTeams-manifest.json';
const relativePathToReadmeTemplate = './Readme.md';
const version = require('./package.json').version;

const createUrl = () => {
  const isDev = version.includes('dev');
  return `https://res${isDev ? '-sdf' : ''}.cdn.office.net/teams-js/${version}/js/MicrosoftTeams.min.js`;
}

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

const updateReadme = (integrityHash) => {
  const absolutePathToReadmeTemplate = path.resolve(__dirname, relativePathToReadmeTemplate);
  if(!fs.existsSync(absolutePathToReadmeTemplate)) {
    throw(`ERROR: Readme-template.md at ${absolutePathToReadmeTemplate} was not found.`);
  }
  const readme = fs.readFileSync(absolutePathToReadmeTemplate, 'utf8');
  const readmeWithIntegrity = readme.replace(/integrity=\".*?\"/, `integrity="${integrityHash}"`);
  const result = readmeWithIntegrity.replace(
    /src=\"https:\/\/res.*?\/js\/MicrosoftTeams.min.js\"/,
    `src="${createUrl()}"`);

  fs.writeFileSync(absolutePathToReadmeTemplate, result);
};

(() => {
  console.log('readme-generator is running');
  const integrityHash = getIntegrityHash();
  updateReadme(integrityHash);
  console.log('readme-generator completed successfully!');
})();
