import eslint from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'backup_legacy/**',
      'assets/textures/**',
      '*.min.js',
      '.husky/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  eslint.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'warn',
    },
  },
  {
    files: ['ROADMAP.js', 'STATUS.js', 'convert_textures.js', 'dev-server.js', 'scripts/**/*.js'],
    rules: {
      'no-console': 'off',
    },
  },
  prettier,
];
