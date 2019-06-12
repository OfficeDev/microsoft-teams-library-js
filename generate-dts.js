const libraryName = 'microsoftTeams';
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const timeout = 2000;

function DtsBundlePlugin() { }
DtsBundlePlugin.prototype.apply = function (compiler) {
  const self = this;

  compiler.plugin('emit', (_compilation, callback) => {
    const dtsBuilder = require('dts-builder');

    dtsBuilder.generateBundles([{
      name: 'teams-js',
      alias: 'microsoftTeams',
      sourceDir: './dts',
      destDir: './dist'
    }]);

    console.log('Waiting for 2 seconds so that the dts can be merged before proceeding. If this fails the either increase the wait time or just re-run the task.');
    setTimeout(() => patchDTS(callback), timeout);
  });
}

function patchDTS(callback) {
  const self = this;
  console.log('Replacing the references to officeJsHelpers and regularizing it.');
  fs.readFile('./dist/teams-js.d.ts', 'utf8', (err, data) => {
    if (err) {
      return console.log(err);
    }

    const result = replace(data)
      (/teamsJs/gm, 'microsoftTeams')
      (/declare module 'microsoftTeams'/gm, 'declare module \'@microsoft/teams-js\'')
      (/^import microsoftTeams.*/g, '')
      (/^var _default: void;/, '')
      (/export default _default;/, '')
      (/^\s*[\r\n]/gm, '')
      ();

    fs.writeFile('./dist/teams-js.d.ts', result, 'utf8', (err) => {
      if (err) {
        return console.log(err);
      }

      fs.rename('./dist/teams-js.d.ts', './/dist/MicrosoftTeams.d.ts', (err) => {
        if (err) {
          console.log('ERROR: ' + err);
          throw err;
        }
      });
    });
  });
}

function replace(source) {
  let current = source;

  // tslint:disable-next-line:only-arrow-functions
  return function stage(regex, value) {
    if (arguments.length === 0) {
      return current;
    }
    else {
      current = current.replace(regex, value);
      return stage;
    }
  };
}

module.exports = DtsBundlePlugin;