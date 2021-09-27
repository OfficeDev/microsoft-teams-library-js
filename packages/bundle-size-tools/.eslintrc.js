module.exports = {
  extends: '../../.eslintrc.js',
  root: true,
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    'curly': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react-hooks/rules-of-hooks': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',  
  },
};
