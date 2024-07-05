const projectEslintConfig = require('../../eslint.config');
const strictNullChecks = require('eslint-plugin-strict-null-checks');

module.exports = {
  ...projectEslintConfig,

  files: ['**/*.ts', '**/*.tsx'],
  languageOptions: {
    ...projectEslintConfig.languageOptions,
    parserOptions: {
      ...projectEslintConfig.languageOptions.parserOptions,
      project: './tsconfig.eslint.json',
    },
  },
  plugins: {
    ...projectEslintConfig.plugins,
    'strict-null-checks': strictNullChecks,
  },
  rules: {
    ...projectEslintConfig.rules,
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'no-inner-declarations': 'off',
    'strict-null-checks/all': 'warn',
  },
};
