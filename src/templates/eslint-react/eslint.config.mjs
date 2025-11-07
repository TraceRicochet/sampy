import stylisticPlugin from '@stylistic/eslint-plugin';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';

const eslintConfig = [
  {
    // Ignore patterns
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'public/**',
      '.vite/**',
    ]
  },
  {
    // Configuration for root config files that may not be in tsconfig.json
    files: ['*.config.{js,mjs,ts}', '*.{js,mjs,ts}'],
    plugins: {
      'import': importPlugin,
      'simple-import-sort': simpleImportSort,
    },
    languageOptions: {
      parser: tsParser, // Use TypeScript parser for root TS files
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node, // Use Node.js globals for config files
    },
    rules: {
      // Basic rules for config files
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
    },
  },
  {
    // Configuration for source files that should be in tsconfig.json
    files: ['src/**/*.{js,mjs,cjs,jsx,ts,tsx}', 'components/**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    plugins: {
      'react': react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@stylistic': stylisticPlugin,
      'unused-imports': unusedImports,
      'simple-import-sort': simpleImportSort,
      'import': importPlugin,
      '@typescript-eslint': tseslint,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        // Note: If you encounter issues with ESLint not finding files in tsconfig.json,
        // ensure your tsconfig.json includes the files you are linting or adjust the 'files' pattern above.
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: globals.browser,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // Import sorting rules
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',

      // Unused imports rules
      'unused-imports/no-unused-imports': 'error',

      // React rules
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+ with JSX Transform
      'react/prop-types': 'off', // Using TypeScript for prop validation
      'react/jsx-uses-react': 'off', // Not needed in React 17+ with JSX Transform
      'react/jsx-uses-vars': 'error',

      // React hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // React Refresh rules (Vite specific)
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // TypeScript stylistic rules (customize as needed)
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // Stylistic rules (customize as needed)
      '@stylistic/indent': ['error', 2, { SwitchCase: 1 }],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/space-before-function-paren': ['error', 'always'],
    },
  },
];

export default eslintConfig;
