module.exports = {
  preset: 'ts-jest',
  roots: ['src'],
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  testRunner: 'jest-jasmine2'
};
