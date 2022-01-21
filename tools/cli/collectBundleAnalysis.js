const child_process = require('child_process');
const path = require('path');
const fsExtra = require('fs-extra');
const { argv } = require('yargs').option('folderName', {
  string: true,
  demandOption: false,
});

/**
 * This script copies a folder "folderName" from all the packages(wherever it exists) to a common folder
 */
(async () => {
  const folderName = argv.folderName ? argv.folderName : 'bundleAnalysis';
  const packageInfo = getAllPackageInfo();
  const root = getProjectRootDirectory();
  const outputLocation = path.join(root, `common/temp/${folderName}`);

  if (packageInfo == null) {
    throw new Error('No packages found to be copied');
  } else {
    console.log('Starting copy to common folder');
  }

  for (const [name, info] of Object.entries(packageInfo)) {
    const packageFolderPath = path.join(root, info.packagePath, folderName);
    if (fsExtra.existsSync(packageFolderPath)) {
      fsExtra.copySync(packageFolderPath, path.join(outputLocation, name), {
        recursive: true,
      });
      console.log(`${name} analysis copied`);
    }
  }
})();

function getProjectRootDirectory() {
  return process.cwd();
}

function getAllPackageInfo() {
  const projectRoot = getProjectRootDirectory();
  const results = child_process.spawnSync('git', ['ls-tree', '-r', '--name-only', '--full-tree', 'HEAD']);
  const packageInfo = {};

  results.stdout
    .toString()
    .split('\n')
    .map(line => {
      return line.trim();
    })
    .filter(line => line.endsWith('/package.json'))
    .forEach(packageJsonFile => {
      console.log(packageJsonFile);
      const packageJson = require(path.join(projectRoot, packageJsonFile));

      if (packageJson) {
        packageInfo[packageJson.name] = {
          packagePath: path.dirname(packageJsonFile),
          packageJson,
        };
      }
    });

  return packageInfo;
}
