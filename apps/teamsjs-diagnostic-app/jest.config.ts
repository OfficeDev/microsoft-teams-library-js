import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|tsx)$',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results/unit',
        outputName: 'unit-tests-report.xml',
        addFileAttribute: true,
        classNameTemplate: '{filepath}',
      },
    ],
  ],
  clearMocks: true,
};

export default config;
