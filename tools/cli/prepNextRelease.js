const fs = require("fs");

let packageJsonPath = "../../teamsjs-app-sdk/package.json";
const EXIT_CODE_FATAL_ERROR = 5;

function getPackageJson() {
  if (fs.existsSync(packageJsonPath)) {
    return JSON.parse(fs.readFileSync(packageJsonPath, { encoding: "utf8" }));
  }
  console.log("FATAL ERROR: package.json path could not be found in the file system.");
  process.exitCode = EXIT_CODE_FATAL_ERROR;
  return;
}

function savePackageJson(packageJson) {
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson));
}

function getFileVersion(packageJson) {
  if (!packageJson.version) {
    console.log("FATAL ERROR: a version was not found in the package.json.");
    process.exitCode = EXIT_CODE_FATAL_ERROR;
    return;
  } else {
    return packageJson.version;
  }
}

let packageJson = getPackageJson();

// SHA of the commit the package was generated from
let hash = process.env["BUILD_SOURCEVERSION"];

// pre-release version part, either from the hash or random if has not available
let suffixLength = 10;
let versionSuffix = hash.substr(0, suffixLength);

console.log("version suffix: " + versionSuffix);

// get package version from package.json
let version = getFileVersion(packageJson);

console.log("package.json version: " + version);

// append the suffix to form a new version
let nextVersion = version + "-" + versionSuffix;

console.log("@next version: " + nextVersion);

// update package.json with the new version
packageJson.version = nextVersion;

savePackageJson(packageJson);
