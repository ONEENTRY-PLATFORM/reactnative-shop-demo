// Flat config for ESLint 9 (migrated from .eslintrc.js, same rules).
const {defineConfig} = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    plugins: {prettier: prettierPlugin},
    rules: {
      'react-hooks/exhaustive-deps': 'off',
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: true,
        },
      ],
    },
  },
  {
    ignores: [
      'metro.config.js',
      'babel.config.js',
      'tailwind.config.js',
      'eslint.config.js',
      'ios/**',
      'android/**',
    ],
  },
]);
