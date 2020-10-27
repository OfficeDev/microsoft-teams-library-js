const libraryName = 'teamsjs';
const fs = require('fs');
const rimraf = require('rimraf');
const timeout = 2000;

function DtsBundlePlugin() {}
DtsBundlePlugin.prototype.apply = function(compiler) {
  const self = this;

  compiler.plugin('done', (_compilation, callback) => {
    const dtsBuilder = require('dts-builder');

    dtsBuilder.generateBundles([
      {
        name: libraryName,
        alias: libraryName,
        sourceDir: './dts',
        destDir: './dist',
      },
    ]);

    console.log(
      'Waiting for 2 seconds so that the dts can be merged before proceeding. If this fails the either increase the wait time or just re-run the task.',
    );
    setTimeout(() => patchDTS(callback), timeout);
  });
};

function patchDTS(callback) {
  const self = this;
  console.log('Replacing the references to teamsJs and regularizing it.');
  fs.readFile(`./dist/${libraryName}.d.ts`, 'utf8', (err, data) => {
    if (err) {
      return console.log(err);
    }

    const result = replace(data)(new RegExp(`declare module '${libraryName}'`, 'gm'), "declare module '@microsoft/teamsjs-app-sdk'")(
      new RegExp(`import ${libraryName}.*`, 'g'),
      '',
    )(/^var _default: void;/, '')(/export default _default;/, '')(/^\s*[\r\n]/gm, '')();

    fs.writeFile(`./dist/${libraryName}.d.ts`, result, 'utf8', err => {
      if (err) {
        return console.log(err);
      }

      fs.rename(`./dist/${libraryName}.d.ts`, `.//dist/${libraryName}.d.ts`, err => {
        if (err) {
          console.log('ERROR: ' + err);
          throw err;
        }

        rimraf('./dts', () => {
          if (callback) {
            callback();
          }
        });
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
    } else {
      current = current.replace(regex, value);
      return stage;
    }
  };
}

module.exports = DtsBundlePlugin;
