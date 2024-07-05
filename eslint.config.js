const eslintJsPlugin = require('@eslint/js');
const globals = require('globals');
const microsoftSdlPlugin = require('@microsoft/eslint-plugin-sdl');
const onlyError = require('eslint-plugin-only-error');
const prettierPlugin = require('eslint-plugin-prettier');
const simpleImportSort = require('eslint-plugin-simple-import-sort');
const typescriptEsLintParser = require('@typescript-eslint/parser');
const typescriptEsLintPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = {
  languageOptions: {
    globals: {
      ...globals.browser,
    },
    parser: typescriptEsLintParser,
    parserOptions: {
      ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
      sourceType: 'module', // Allows for the use of imports
    },
  },
  plugins: {
    '@microsoft/sdl': microsoftSdlPlugin,
    '@typescript-eslint': typescriptEsLintPlugin,
    'only-error': onlyError,
    prettier: prettierPlugin,
    'simple-import-sort': simpleImportSort,
  },
  rules: {
    ...eslintJsPlugin.configs.recommended.rules,
    ...microsoftSdlPlugin.configs.recommended.rules,
    ...prettierPlugin.configs.recommended.rules,
    ...typescriptEsLintPlugin.configs.recommended.rules,
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'warn',
    '@typescript-eslint/explicit-function-return-type': [
      'error',
      {
        allowExpressions: true,
      },
    ],
    curly: 'error',
    'simple-import-sort/imports': 'error',
    quotes: ['error', 'single', { avoidEscape: true }],
  },
};
