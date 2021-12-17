const fs = require('fs');
const path = require('path');

const relativePathToRootReadMeFile = '../../README.md';
const destinationPath = './README.md';

const copyAndReplaceReadMe = () => {
  const absolutePathToRootReadme = path.resolve(__dirname, relativePathToRootReadMeFile);
  const absolutePathToLocalReadme = path.resolve(__dirname, destinationPath);
  if (!fs.existsSync(absolutePathToRootReadme)) {
    throw `ERROR: MicrosoftTeams-Readme.md at ${absolutePathToRootReadme} was not found.`;
  }
  const readMeFile = fs.readFileSync(absolutePathToRootReadme);
  fs.copyFileSync(absolutePathToRootReadme, destinationPath);
};

(() => {
  console.log('copying readme from root to packages/teams-js...');
  copyAndReplaceReadMe();
  console.log('Finished copying readme file!');
})();
