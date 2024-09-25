module.exports = {
  ignorePatterns: ['.eslintrc.js'],
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
  plugins: ['strict-null-checks'],
  rules: {
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
