// eslint-disable-next-line @typescript-eslint/no-var-requires
const commonSettings = require('../../jest.config.common.js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageVersion = require('./package.json').version;

module.exports = {
  ...commonSettings,
  globals: {
    'ts-jest': {
      tsconfig: {
        downlevelIteration: true,
      },
    },
    PACKAGE_VERSION: packageVersion,
  },
};
