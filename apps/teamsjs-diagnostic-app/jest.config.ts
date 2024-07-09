import type { Config } from '@jest/types';
const commonSettings = require('../../jest.config.common.js');

const config: Config.InitialOptions = {
  verbose: true,
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|tsx)$',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/src/components/sample/setupTests.ts'],
  clearMocks: true,
};

module.exports = {
  ...commonSettings,
  ...config,
};
