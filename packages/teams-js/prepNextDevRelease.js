const fs = require('fs');
const cp = require('child_process');
const util = require('util');
const { exit } = require('process');

let packageJsonPath = './package.json';
let internalConstantsFilePath = './src/internal/constants.ts';
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
 * Gets the file content in string format from the given file path. Exits with the exit code of
 * fatal error without returning a value if the given file path does not show a valid path to a
 * file within the system.
 * @param {string} filePath Path to the desired file.
 * @returns The file content in string format.
 */
function getFileContent(filePath) {
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, { encoding: 'utf8' });
  }
  console.log(`FATAL ERROR: file path ${filePath} could not be found in the file system.`);
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
 * Saves the given file content to the given file path.
 * @param {string} filePath Path to the file to save to.
 * @param {any} fileContent Content to save onto the file.
 */
function saveFile(filePath, fileContent) {
  fs.writeFileSync(filePath, fileContent);
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

function getSpecificVerSuffixNum(versionType, wholeVerNum) {
  const indexOfVerType = wholeVerNum.indexOf(versionType);
  if (indexOfVerType === -1) {
    return -1;
  } else {
    return parseInt(wholeVerNum.slice(indexOfVerType + versionType.length));
  }
}

/**
 * Uses the given current next-dev version and latest production version to generate and return
 * the number of the new next-dev version. The new next-dev version numbers are 0-index based.
 * @param {string} currNextDevVer The version currently tagged next-dev. (e.g. 2.0.0-beta.1-dev.1)
 * @param {string} currPkgJsonVer The version taken from the package.json. (e.g. 2.0.0-beta.0)
 * @returns Just the number of the suffix of the next next-dev version number. (e.g. return 2 if next next-dev version is 2.0.0-beta.1-dev.2)
 */
function getDevSuffixNum(currNextDevVer, currPkgJsonVer) {
  if (currNextDevVer === undefined || currNextDevVer === '') {
    return 0;
  }

  const betaSuffixNumInCurrNextDev = getSpecificVerSuffixNum('beta.', currNextDevVer);
  const betaSuffixNumInPkgJsonVer = getSpecificVerSuffixNum('beta.', currPkgJsonVer);
  let nextDevVerSuffixNum = 0;

  if (betaSuffixNumInCurrNextDev === betaSuffixNumInPkgJsonVer + 1) {
    nextDevVerSuffixNum = getSpecificVerSuffixNum('dev.', currNextDevVer) + 1;
  } else if (betaSuffixNumInCurrNextDev !== betaSuffixNumInPkgJsonVer) {
    throw new Error(`Invalid beta version suffix number ${betaSuffixNumInPkgJsonVer} in package.json version ${currPkgJsonVer}`);
  }
  return nextDevVerSuffixNum;
}

/**
 * Generates the new package.json content with updated next-dev version number. The version number is
 * the only thing that's changed.
 * @param currNextDevVer The current next-dev version to bump the new next-dev version number from. (e.g. 2.0.0-beta.1-dev.0)
 * @returns the new package.json content in JSON format.
 */
function getNewPkgJsonContent(currNextDevVer) {
  const packageJson = getPackageJson();

  // get package version from package.json
  let currPkgJsonVer = getPkgJsonVersion(packageJson);

  // TODO: REMOVE AFTER TESTING
  currPkgJsonVer = '2.0.0-beta.2';
  currNextDevVer = '2.0.0-beta.3.dev.0';

  console.log('package.json version: ' + currPkgJsonVer);
  console.log('current next-dev tagged version: ' + currNextDevVer);

  if (currPkgJsonVer.includes('dev')) {
    throw new Error(`The given package.json\'s version ${currPkgJsonVer} contains the substring \'dev\' which is reserved for non-prod versions. Please fix the package.json version first in order to allow for proper version incrementation.`);
  }
  const indexOfBetaVerNum = currPkgJsonVer.indexOf('beta.') + 'beta.'.length;
  const betaVerNum = parseInt(currPkgJsonVer.slice(indexOfBetaVerNum));
  if (isNaN(betaVerNum)) {
    throw new Error(`The given package.json\'s version ${currPkgJsonVer} has a non-integer beta version number. Please fix the package.json version first in order to allow for proper version incrementation.`)
  }
  
  const v2BetaPrefix = '2.0.0-beta.' + (betaVerNum + 1);

  const newDevSuffix = getDevSuffixNum(currNextDevVer, currPkgJsonVer);
  const newVersion = v2BetaPrefix + '-dev.' + newDevSuffix;

  console.log('new version: ' + newVersion);

  // update package.json with the new version
  packageJson.version = newVersion;
  return packageJson;
}

/**
 * Replaces the version declared in internal/constants.ts with the given version.
 * @param {string} newVersion the new version to replace the version in the constants.ts file with.
 */
function saveNewConstantsContent(newVersion) {
  let constantsFileContent = getFileContent(internalConstantsFilePath);
  const pattern = 'const version = ';
  const verDeclarationIndex = constantsFileContent.indexOf(pattern);
  const endVerDeclarationIndex = constantsFileContent.indexOf(';', verDeclarationIndex);
  // whole substring consisting of the declaration to be replaced.
  const verDeclaration = constantsFileContent.substring(verDeclarationIndex, endVerDeclarationIndex);
  const newConstantsFileContent = constantsFileContent.replace(verDeclaration, `${pattern}'${newVersion}'`);
  saveFile(internalConstantsFilePath, newConstantsFileContent);
}

function prepNewDevRelease(devStdout) {
  const newPackageJson = getNewPkgJsonContent(devStdout);
  const newVersion = newPackageJson.version;
  saveJsonFile(newPackageJson);
  saveNewConstantsContent(newVersion);
  return newVersion;
}

(() => {
  exec(`npm view @microsoft/teams-js version --tag next-dev`).then(({ stdout, stderr }) => prepNewDevRelease(stdout.trim()));
})();
