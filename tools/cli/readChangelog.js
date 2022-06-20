/* eslint-disable */

const fs = require('fs');
const path = require('path');

const readChangeLog = version => {
  const relativePathToChangelog = '../../packages/teams-js/CHANGELOG.md';
  const absolutePathToChangelog = path.resolve(__dirname, relativePathToChangelog);
  if (!fs.existsSync(absolutePathToChangelog)) {
    throw `ERROR: ${absolutePathToChangelog} was not found.`;
  }
  const fullChangelog = fs.readFileSync(absolutePathToChangelog, 'utf8');
  if (!version) {
    return fullChangelog;
  } else {
    const result = fullChangelog.split(/(## .*\d)/);
    const index = result.findIndex(substr => substr.startsWith(`## ${version}`));
    if (index !== -1) {
      const log = result[index + 1];
      return log;
    }
    throw new Error('Matching version in changelog was not found');
  }
};

(async () => {
  const args = process.argv.slice(2);
  const version = args[0];
  try {
    const section = readChangeLog(version);
    console.log(section);
  } catch (e) {
    console.log('Something went wrong!');
    console.error(e);
    process.exit(1);
  }
})();
