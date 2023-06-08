module.exports = {
  ignorePatterns: ['.eslintrc.js'],
  parserOptions: {
    project: './tsconfig.strictNullChecks.json',
  },
  plugins: ['strict-null-checks'],
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    'no-inner-declarations': 'off',
    'strict-null-checks/all': 'warn',
  },
};
