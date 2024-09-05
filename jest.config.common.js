module.exports = {
  transform: {
    '.(ts|tsx)': ['ts-jest', { tsconfig: { esModuleInterop: true, strictNullChecks: false, target: 'ES2015' } }],
  },
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx)$',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js'],
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
