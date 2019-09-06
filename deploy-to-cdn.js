const { deploy } = require('deploy-azure-cdn');
const fs = require('fs-jetpack');
const { argv } = require("yargs")
const KeyVault = require('azure-keyvault');
const AuthenticationContext = require('adal-node').AuthenticationContext;

const url = argv.staticsUri;
const clientId = argv.clientId;
const clientSecret = argv.clientSecret;
const vaultUri = argv.vaultUri;

function getConnectionString() {
  var authenticator = function(challenge, callback) {
    var context = new AuthenticationContext(challenge.authorization);
    return context.acquireTokenWithClientCredentials(challenge.resource, clientId, clientSecret, function(
      err,
      tokenResponse,
    ) {
      if (err) throw err;
      var authorizationValue = tokenResponse.tokenType + ' ' + tokenResponse.accessToken;
      return callback(null, authorizationValue);
    });
  };

  var credentials = new KeyVault.KeyVaultCredentials(authenticator);
  var keyVaultClient = new KeyVault.KeyVaultClient(credentials);
  var secretName = 'VersionedBuildContainerUrl';
  var secretIdentifier = vaultUri + '/secrets/' + secretName + '/';
  console.log(secretIdentifier)
  keyVaultClient.getSecret(vaultUri, secretName, '').then(res => console.log(res));
}

(async () => {
  const packageJson = fs.read('./package.json', 'json');
  const version = packageJson.version;

  // if (version.includes('beta')) return;

  const files = await fs.listAsync('./dist');
  const logger = console.log;

  console.log(getConnectionString())

  // const opts = {
  //   serviceOptions: [getConnectionString()], // custom arguments to azure.createBlobService
  //   containerName: 'sdk', // container name in blob
  //   containerOptions: { publicAccessLevel: 'blob' }, // container options
  //   folder: 'v' + version + '/js', // path within container
  //   deleteExistingBlobs: true, // true means recursively deleting anything under folder
  //   concurrentUploadThreads: 2, // number of concurrent uploads, choose best for your network condition
  //   zip: true, // gzip files if they become smaller after zipping, content-encoding header will change if file is zipped
  //   metadata: { cacheControl: 'public, max-age=31556926' }, // metadata for each uploaded file
  //   testRun: false, // test run - means no blobs will be actually deleted or uploaded, see log messages for details
  // };

  // deploy(opts, files, logger, function(err) {
  //   if (err) {
  //     console.log('Error deploying', err);
  //   }
  //   console.log('Deployment Successful.');
  // });
})();
