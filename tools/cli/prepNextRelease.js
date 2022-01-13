/* eslint-disable */

/*
 * Run this script locally to create a new release
 * Once this is executed, a CI/Release will be invoked.
 * The release must be approved before the packages can be deployed.
 * Once the release is completed, the created PR should be approved and merged back into 2.0-preview
 */
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const currentPackageVersion = require('../../packages/teams-js/package.json').version;

const getNewPackageVersion = () => {
  const stringPattern = '2.0.0-beta.';
  const betaVersionNumber = parseInt(currentPackageVersion.substring(stringPattern.length)) + 1;
  const newPackageVersion = `${stringPattern}${betaVersionNumber}`;
  return newPackageVersion;
};

const execShellCommand = async cmd => {
  return new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 1024 * 500 }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else if (stderr) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
};

const boolPrompt = () => {
  process.stdin.resume();
  return new Promise(resolve => {
    process.stdin.on('error', err => {
      reject(err);
    });
    process.stdin.on('data', data => {
      const result = data
        .toString()
        .toLowerCase()
        .trimEnd();
      if (result === 'y' || result === 'yes') {
        resolve(true);
        process.stdin.pause();
      } else {
        resolve(false);
        process.stdin.pause();
      }
    });
  });
};

const checkoutAndPullMainBranch = async () => {
  const diff = await execShellCommand('git diff');
  const diffStaged = await execShellCommand('git diff --staged');
  if (diff || diffStaged) {
    throw 'You have uncommitted changes. Please commit your changes before proceeding.\nAborting!';
  }
  const gitBranch = await execShellCommand('git branch');
  const branches = gitBranch.split('\n');
  const currentBranch = branches.find(branch => branch.startsWith('*'));
  if (currentBranch !== '* 2.0-preview') {
    process.stdout.write('You are not on 2.0-preview branch. Do you want to checkout? (y/n) ');
    if (!(await boolPrompt())) {
      throw 'User aborted!';
    }
    await execShellCommand('git checkout 2.0-preview --quiet');
  }
  await execShellCommand('git pull --quiet');
};

const updatePackageVersion = async () => {
  const relativePathToTeamsjsPackageJson = '../../packages/teams-js/package.json';
  const newVersion = getNewPackageVersion();
  console.log(`Updating package.json to ${newVersion}`);
  const absolutePathToTeamsjsPackageJson = path.resolve(__dirname, relativePathToTeamsjsPackageJson);
  if (!fs.existsSync(absolutePathToTeamsjsPackageJson)) {
    throw `ERROR: ${absolutePathToTeamsjsPackageJson} was not found.`;
  }
  const packageJson = fs.readFileSync(absolutePathToTeamsjsPackageJson, 'utf8');
  const newPackageJson = packageJson.replace(`"version": "${currentPackageVersion}"`, `"version": "${newVersion}"`);
  fs.writeFileSync(absolutePathToTeamsjsPackageJson, newPackageJson);
};

const buildAndUpdateIntegrityHash = async () => {
  console.log('Updating integrity hash');
  await execShellCommand('cd packages/teams-js & yarn build & node prepNewReadme.js');
};

const checkoutAndPushReleaseBranch = async () => {
  console.log('Please validate all uncommitted changes: \n');
  const diff = await execShellCommand('git diff -U0');
  console.log(diff);
  process.stdout.write('Proceed? (y/n) ');
  if (!(await boolPrompt())) {
    throw 'User aborted!';
  }
  const newVersion = getNewPackageVersion();
  const branchName = `release/${newVersion}`;
  await execShellCommand(`git checkout -b ${branchName} --quiet`);
  await execShellCommand('git add -A');
  await execShellCommand(`git commit -m "Releasing ${newVersion}"`);
  await execShellCommand(`git push --set-upstream origin ${branchName}`);
};

(async () => {
  const newVersion = getNewPackageVersion();
  process.stdout.write(`Are you sure you want to create a new release for ${newVersion}? (y/n) `);
  if (!(await boolPrompt())) {
    console.log('User aborted!');
    return;
  }
  try {
    await checkoutAndPullMainBranch();
    await updatePackageVersion();
    await buildAndUpdateIntegrityHash();
    await checkoutAndPushReleaseBranch();
    // TODO: Add code to create the PR automatically using github api
  } catch (e) {
    console.log('Something went wrong!');
    console.log(e);
  }
})();
