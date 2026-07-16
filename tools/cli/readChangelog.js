/* eslint-disable */

const { extractChangelogSection } = require('./extract-changelog-section');

(async () => {
  const args = process.argv.slice(2);
  const version = args[0];
  try {
    const section = extractChangelogSection(version);
    console.log(section);
  } catch (e) {
    console.log('Something went wrong!');
    console.error(e);
    process.exit(1);
  }
})();
