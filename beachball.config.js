const exec = require('child_process').exec;

const postbump = (packagePath, packageName, packageVersion) => {
  if (packageName !== '@microsoft/teams-js') {
    console.log('postbump executed');
    console.log(`packagePath: ${packagePath}`);
    console.log(`packageName: ${packageName}`);
    exec('cd packagePath && rm CHANGELOG.*');
  }
};

module.exports = {
  branch: 'origin/2.0-preview',
  generateChangelog: true,
  hooks: { postbump },
  // TODO: ignore tests, other packages, etc. Also, move the changelog file :)
  ignorePatterns: [],
  package: '@microsoft/teams-js',
  publish: false,
  push: false,
};
