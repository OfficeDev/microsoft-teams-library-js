const { argv } = require('yargs');
const deploy = require('deploy-azure-cdn');
const KeyVault = require('azure-keyvault');
const fs = require('fs-jetpack');
const path = require('path');
const AuthenticationContext = require('adal-node').AuthenticationContext;

const clientId = argv.clientId;
const clientSecret = argv.clientSecret;
const vaultUri = argv.vaultUri;
const secretName = argv.vaultSecretName;

function getConnectionString() {
  const authenticator = function(challenge, callback) {
    const context = new AuthenticationContext(challenge.authorization);
    return context.acquireTokenWithClientCredentials(challenge.resource, clientId, clientSecret, function(
      err,
      tokenResponse,
    ) {
      if (err) throw err;
      const authorizationValue = tokenResponse.tokenType + ' ' + tokenResponse.accessToken;
      return callback(null, authorizationValue);
    });
  };

  const credentials = new KeyVault.KeyVaultCredentials(authenticator);
  const keyVaultClient = new KeyVault.KeyVaultClient(credentials);
  return keyVaultClient.getSecret(vaultUri, secretName, '').then(res => res.value);
}

(async () => {
  const packageJson = fs.read('./package.json', 'json');
  const version = packageJson.version;

  if (version.includes('beta')) return;

  const filePaths = [];
  const files = await fs.listAsync('./dist');
  files.forEach(file => {
    filePaths.push({path: path.resolve(__dirname, 'dist', file)});
  })
  const logger = console.log;

  getConnectionString().then(connectionString => {
    const opts = {
      serviceOptions: [connectionString], // custom arguments to azure.createBlobService
      containerName: 'sdk', // container name in blob
      containerOptions: { publicAccessLevel: 'blob' }, // container options
      folder: 'v' + version + '/js', // path within container
      deleteExistingBlobs: false, // true means recursively deleting anything under folder
      concurrentUploadThreads: 2, // number of concurrent uploads, choose best for your network condition
      zip: true, // gzip files if they become smaller after zipping, content-encoding header will change if file is zipped
      metadata: { cacheControl: 'public, max-age=31556926' }, // metadata for each uploaded file
      testRun: false, // test run - means no blobs will be actually deleted or uploaded, see log messages for details
    };

    deploy(opts, filePaths, logger, function(err) {
      if (err) throw err;
      console.log('Deployment Successful.');
    });
  });
})();
