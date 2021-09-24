const fs = require('fs');
const cp = require("child_process");
const util = require("util");

let packageJsonPath = './package.json';
const EXIT_CODE_FATAL_ERROR = 5;

const exec = util.promisify(cp.exec);

function getPackageJson() {
  if (fs.existsSync(packageJsonPath)) {
    return JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' }));
  }
  console.log('FATAL ERROR: package.json path could not be found in the file system.');
  process.exitCode = EXIT_CODE_FATAL_ERROR;
  return;
}

function savePackageJson(packageJson) {
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson));
}

function getFileVersion(packageJson) {
  if (!packageJson.version) {
    console.log('FATAL ERROR: a version was not found in the package.json.');
    process.exitCode = EXIT_CODE_FATAL_ERROR;
    return;
  } else {
    return packageJson.version;
  }
}

function getPrefix(version) {
  const dashIndex = version.indexOf('-');
  if (dashIndex == -1) {
    return version;
  } else {
    return version.substring(0, dashIndex);
  }
}

function getDevSuffixNum(devVer, currVersion) {
  // if there is no dev version returned, make a first one
  if (devVer === undefined) {
    return 0;
  }
  // there is a dev version returned, so grab the devSuffix from it and increment.
  const devIndex = devVer.indexOf('-dev.');
  if (devIndex === -1) {
    throw new Error(
      `The dev tagged release \'${devVer}\'in the feed is not named properly and does not contain \'-dev\'. Please resolve this first.`,
    );
  }
  const devSuffixNum = parseInt(devVer.substring(devIndex));
  if (devSuffixNum === NaN) {
    throw new Error(
      `The dev tagged release \'${devVer}\'in the feed is not named properly and contains a non-number character after \'-dev.\'. Please resolve this first.`,
    );
  }

  const newDevSuffixNum = devSuffixNum + 1;
  const latestPrefix = currVersion;
  const devPrefix = getPrefix(devVer);
  const latestPatch = parseInt(latestPrefix.substring(latestPrefix.lastIndexOf('.') + 1));
  const devPrefixPatch = parseInt(devPrefix.substring(devPrefix.lastIndexOf('.') + 1));
  // If the current devPrefix is already higher than the latest version's prefix, there has already been a dev version
  // released after a production version, so we'll need to just bump the dev suffix by one.
  if (latestPatch + 1 === devPrefixPatch) {
    return newDevSuffixNum;
  // If the current devPrefix is the same as the latest version's prefix, it means there hasn't been a dev version
  // released since the production release. Set the dev suffix as 0.
  } else if (latestPrefix === devPrefix) {
    return 0;
  } else {
    throw new Error('Inconsistent tags in npm feed');
  }
}

(async () => {
  const packageJson = getPackageJson();

  // get package version from package.json
  let currVersion = getFileVersion(packageJson);
  console.log('package.json version: ' + currVersion);

  // Find version tagged dev
  const { devStdout, ignore } = await exec(`npm view @microsoft/teams-js version --tag dev`);
  const newDevSuffix = getDevSuffixNum(devStdout, currVersion);
  console.log('dev version suffix number: ' + newDevSuffix);

  const [major, minor, patch] = currVersion.split('.');
  let newDevPrefix = '';

  if (devStdout !== undefined && getPrefix(devStdout) === currVersion) {
    newDevPrefix = currVersion;
  } else {
    newDevPrefix = `${major}.${minor}.${parseInt(patch) + 1}`;
  }

  // append the suffix to form a new version
  const newVersion = newDevPrefix + '-dev.' + newDevSuffix;

  console.log('new version: ' + newVersion);

  // update package.json with the new version
  packageJson.version = newVersion;

  savePackageJson(packageJson);
})();
