import { defineConfig } from 'eslint/config';
import expoConfig from 'eslint-config-expo/flat.js';

export default defineConfig([
  ...expoConfig,
  {
    ignores: [
      '.expo/**',
      'artifacts/**',
      'coverage/**',
      'design/reference/**',
      'dist/**',
      'node_modules/**',
    ],
  },
]);
