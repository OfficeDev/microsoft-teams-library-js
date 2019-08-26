const fs = require('fs-jetpack');
const { spawn } = require('cross-spawn');
const npmRegistry = 'https://registry.npmjs.org';
const packageFolder = __dirname;

function publishAsync(version) {
  return new Promise((resolve, reject) => {
    let envOverride = Object.assign({}, process.env, {
      npm_config_registry: npmRegistry,
    });

    if (!version) {
      return reject('packageInfo must be available');
    }

    let proc = spawn('npm', ['publish'].filter(Boolean), {
      cwd: packageFolder,
      env: envOverride,
    });

    // Ensure already published packages are not republished.
    let alreadyPublished = false;
    proc.stderr.on('data', msg => {
      // stderr stream comes in chunks of data, any one of which may contain the error code.
      alreadyPublished = alreadyPublished || `${msg}`.includes('E403');
    });

    proc.on('close', code => {
      if (code !== 0) {
        if (alreadyPublished) {
          console.log(`${packageFolder}@${version} is already published.`);
          resolve();
        }
        reject();
      } else {
        resolve();
      }
    });
  })
    .then(() => console.log(`Successfully published ${packageFolder}@${version}`))
    .catch(e => {
      throw new Error(`Failed to publish package ${packageFolder} to registry ${npmRegistry} - ${e}`);
    });
}

(async () => {
  const packageJson = fs.read('./package.json', 'json');
  const version = packageJson.version;

  if (version.includes('beta')) {
    console.log('Beta version of the package is in use. No need to upload to CDN.');
  } else {
    console.log('##vso[task.setvariable variable=uploadToCDN]true');
  }

  await publishAsync(version);
})();
