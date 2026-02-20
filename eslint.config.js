// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'components', 'hooks', 'constants'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'unicode-bom': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      'import/first': 'warn',
    },
  },
]);
