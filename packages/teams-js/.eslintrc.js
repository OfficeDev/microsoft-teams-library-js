module.exports = {
  ignorePatterns: ['.eslintrc.js'],
  parserOptions: {
    project: './tsconfig.strictNullChecks.json',
  },
  plugins: ['strict-null-checks'],
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/interface-name-prefix': 'off',
    'no-inner-declarations': 'off',
    'strict-null-checks/all': 'warn',
  },
};
