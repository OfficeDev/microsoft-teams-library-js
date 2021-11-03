// eslint-disable-next-line @typescript-eslint/no-var-requires
const commonSettings = require('../../jest.config.common.js');

module.exports = {
  ...commonSettings,
  globals: {
    'ts-jest': {
      tsconfig: {
        downlevelIteration: true,
      },
    },
  },
};
