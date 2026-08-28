/* eslint-disable @typescript-eslint/no-var-requires */
const commonSettings = require('../../jest.config.common.js');
const packageVersion = require('./package.json').version;

module.exports = {
  ...commonSettings,
  globals: {
    PACKAGE_VERSION: packageVersion,
    TEAMSJS_CLOUD: 'prod',
    fetch: global.fetch,
  },
  setupFilesAfterEnv: ['./test/setupTest.ts'],
};
