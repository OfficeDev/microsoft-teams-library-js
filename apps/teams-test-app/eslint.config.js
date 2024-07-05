const globalEslintConfig = require('../../eslint.config');

module.exports = {
  ...globalEslintConfig,

  files: ['**/*.ts', '**/*.tsx'],
  languageOptions: {
    ...globalEslintConfig.languageOptions,
    parserOptions: {
      ...globalEslintConfig.languageOptions.parserOptions,
      project: './tsconfig.json',
    },
  },
  plugins: {
    ...globalEslintConfig.plugins,
  },
  rules: {
    ...globalEslintConfig.rules,
    'microsoftSdlPlugin/no-insecure-url': 'error',
  },
};
