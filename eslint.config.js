import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import importX from 'eslint-plugin-import-x';
import stylistic from '@stylistic/eslint-plugin';

export default tseslint.config({ ignores: ['dist'] }, prettier, {
  extends: [js.configs.recommended, ...tseslint.configs.recommended],
  files: ['**/*.{ts,tsx}'],
  languageOptions: {
    ecmaVersion: 2023,
    globals: globals.browser,
  },
  plugins: {
    'react-hooks': reactHooks,
    'react-refresh': reactRefresh,
    'import-x': importX,
    '@stylistic': stylistic,
  },
  rules: {
    ...reactHooks.configs.recommended.rules,
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/consistent-type-imports': 'error',
    curly: ['error', 'all'],
    '@stylistic/arrow-parens': ['error', 'as-needed'],
    '@stylistic/object-curly-newline': ['error', { ObjectPattern: { consistent: true } }],
    'import-x/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        pathGroups: [
          { pattern: 'react', group: 'external', position: 'before' },
          { pattern: '~/types/**', group: 'internal', position: 'before' },
          { pattern: '~/constants/**', group: 'internal', position: 'before' },
          { pattern: '~/lib/**', group: 'internal', position: 'before' },
          { pattern: '~/stores/**', group: 'internal', position: 'before' },
          { pattern: '~/components/**', group: 'internal', position: 'before' },
          { pattern: '~/render/**', group: 'internal', position: 'before' },
          { pattern: '**/*.props', group: 'sibling', position: 'after' },
          { pattern: '**/*.types', group: 'sibling', position: 'after' },
          { pattern: '**/*.module.css', group: 'sibling', position: 'after' },
        ],
        pathGroupsExcludedImportTypes: [],
        'newlines-between': 'always',
      },
    ],
    'import-x/exports-last': 'error',
    'import-x/group-exports': 'error',
    'import-x/no-relative-parent-imports': 'error',
    'import-x/consistent-type-specifier-style': ['error', 'prefer-top-level'],
    'import-x/newline-after-import': ['error', { count: 1 }],
    'import-x/extensions': [
      'error',
      'never',
      {
        fix: true,
        json: 'always',
        css: 'always',
        svg: 'always',
        props: 'always',
        types: 'always',
      },
    ],
  },
});
