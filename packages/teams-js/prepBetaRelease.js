const fs = require('fs');
const cp = require('child_process');
const util = require('util');

let packageJsonPath = './package.json';
const EXIT_CODE_FATAL_ERROR = 5;

const exec = util.promisify(cp.exec);

/**
 * Finds the package.json for the project based on a declared package.json path and returns the content.
 * Exits the program with a fatal error code if the file can't be found.
 * @returns the JSON object containing the entire content of the package.json file.
 */
function getPackageJson() {
  if (fs.existsSync(packageJsonPath)) {
    return JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' }));
  }
  console.log(`FATAL ERROR: package.json path ${packageJsonPath} could not be found in the file system.`);
  process.exitCode = EXIT_CODE_FATAL_ERROR;
  return;
}

/**
 * Saves the given package.json content to the set package.json path.
 * @param {any} packageJson The package.json content to write into the package.json.
 */
function saveJsonFile(packageJson) {
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson));
}

/**
 * Gets the current version of this package specified in the package.json.
 * @param {any} packageJson The object that contains the content of this project's package.json.
 * @returns the version of this package specified in the package.json.
 */
function getPkgJsonVersion(packageJson) {
  if (!packageJson.version) {
    console.log('FATAL ERROR: a version was not found in the package.json.');
    process.exit(EXIT_CODE_FATAL_ERROR);
  } else {
    return packageJson.version;
  }
}

/**
 * Gets the prefix of the given version where prefix is defined as the major.minor.patch
 * version before any dashes are added.
 * @param {string} version The whole version to parse and find the prefix from.
 * @returns The prefix of the given version. If there are no dashes in the given version, the
 * prefix and the version will be the same.
 */
function getPrefix(version) {
  const dashIndex = version.indexOf('-');
  if (dashIndex == -1) {
    return version;
  } else {
    return version.substring(0, dashIndex);
  }
}

/**
 * Gets the prefix of the version that is higher amongst the inputs
 * @param {string} currBetaVer The version currently tagged beta. (e.g. 2.0.0-beta.1)
 * @param {string} currPkgJsonVer The version taken from the package.json. (e.g. 2.0.0)
 * @returns The prefix of the version that is higher
 */
function getNewerPrefix(currBetaVer, currPkgJsonVer) {
  const currBetaPrefix = getPrefix(currBetaVer);
  const currPkgPrefix = getPrefix(currPkgJsonVer);
  if (currBetaPrefix === currPkgPrefix) {
    return currBetaPrefix;
  }
  const betaParts = currBetaPrefix.split('.');
  const pkgParts = currPkgPrefix.split('.');

  for (let i = 0; i < betaParts.length; i++) {
    const betaPart = Number(betaParts[i]);
    const pkgPart = Number(pkgParts[i]);
    if (betaPart > pkgPart) {
      return currBetaPrefix;
    }
    if (pkgPart > betaPart) {
      return currPkgPrefix;
    }
  }
}

/**
 * Takes the given whole version number and gets the suffix number of the version type (e.g. 'beta').
 * @param {string} versionType The type of the version number suffix to get. e.g. beta, dev
 * @param {string} wholeVerNum The entire version number. e.g. 2.0.0-beta.0, 2.0.0-beta.1-dev.0
 * @returns The suffix number of the version type in the whole version number.
 */
function getSpecificVerSuffixNum(versionType, wholeVerNum) {
  const indexOfVerType = wholeVerNum.indexOf(versionType);
  if (indexOfVerType === -1) {
    return -1;
  } else {
    return parseInt(wholeVerNum.slice(indexOfVerType + versionType.length + '.'.length));
  }
}

/**
 * Uses the given beta version and latest production version to generate and return
 * the number of the new beta version. The new beta version numbers are 0-index based.
 * @param {string} currBetaVer The version currently tagged beta. (e.g. 2.0.0-beta.1)
 * @param {string} currPkgJsonVer The version taken from the package.json. (e.g. 2.0.0)
 * @param {string} nextPrefix The next prefix version that is determined by which is a higher value. (e.g. beta is 2.1.0-beta.8 and package.json is 2.2.0, the next prefix would be 2.2.0)
 * @returns Just the number of the suffix of the new beta version number. (e.g. return 2 if next beta version is 2.0.0-beta.2)
 */
function getNewBetaSuffixNum(currBetaVer, currPkgJsonVer, nextPrefix) {
  if (currBetaVer === undefined || currBetaVer === '') {
    return 0;
  }
  let newBetaSuffixNum = 0;

  // If current beta versioning is higher or equal to currPkgJsonVer
  if (getPrefix(currBetaVer) === nextPrefix) {
    const suffixNumInCurrBeta = getSpecificVerSuffixNum('beta', currBetaVer);
    if (suffixNumInCurrBeta < 0) {
      throw new Error(`Invalid beta version suffix number ${suffixNumInCurrBeta} in current beta version`);
    }
    newBetaSuffixNum = suffixNumInCurrBeta + 1;
  }
  return newBetaSuffixNum;
}

/**
 * Generates the new package.json content with updated beta version number. The version number is
 * the only thing that's changed.
 * @param currBetaVer The current beta version to bump the new beta version number from. (e.g. 2.0.0-beta.1)
 * @returns the new package.json content in JSON format.
 */
function getNewPkgJsonContent(currBetaVer) {
  const packageJson = getPackageJson();

  // get package version from package.json
  let currPkgJsonVer = getPkgJsonVersion(packageJson);

  console.log('package.json version: ' + currPkgJsonVer);
  console.log('current beta tagged version: ' + currBetaVer);
  const newVersionPrefix = getNewerPrefix(currBetaVer, currPkgJsonVer);

  const betaVerNum = getNewBetaSuffixNum(currBetaVer, currPkgJsonVer, newVersionPrefix);
  const newVersion = newVersionPrefix + '-beta.' + betaVerNum;

  console.log('new version: ' + newVersion);

  // update package.json with the new version
  packageJson.version = newVersion;
  return packageJson;
}

function prepBetaRelease(devStdout) {
  const newPackageJson = getNewPkgJsonContent(devStdout);
  const newVersion = newPackageJson.version;
  saveJsonFile(newPackageJson);
  return newVersion;
}

(() => {
  exec(`cd ../../ && pnpm beachball bump`).then(() =>
    exec(`npm view @microsoft/teams-js version --tag beta`).then(({ stdout, stderr }) =>
      prepBetaRelease(stdout.trim()),
    ),
  );
})();
