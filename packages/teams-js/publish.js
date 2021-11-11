const fs = require('fs-jetpack');
const cp = require("child_process");
const npmRegistry = 'https://registry.npmjs.org';

async function publishAsync(version) {
 
    let envOverride = Object.assign({}, process.env, {
      npm_config_registry: npmRegistry,
    });

    let cmd = `npm publish --tag next`;
    if (version.includes('dev')) {
      cmd = `npm publish --tag next-dev`;
    }

    let result = await exec(cmd, {
      cwd: __dirname,
      env: envOverride,
    });

    console.log(`Successfully published package: ${result.stdout}`);
}

const exec = (cmd, opts) => {
  return new Promise((resolve, reject) => {
    cp.exec(cmd, opts, (err, stdout, stderr) => {
      if (err) {
        return reject(err);
      }
      resolve({
        stdout,
        stderr
      });
    });
  });
};

(async () => {
  const packageJson = fs.read('./package.json', 'json');
  const version = packageJson.version;

  await exec(`npm install -g npm-cli-adduser`);
  await exec(`npm-cli-adduser -r ${npmRegistry} -u ${process.env['NPM_USERNAME']} -p ${process.env['NPM_PASSWORD']} -e ${process.env['NPM_EMAIL']}`)
  await publishAsync(version).catch(e => {
    throw new Error(`The version ${version} has already been published.`, e)
  });
})();
