#!/usr/bin/env node

const { Command } = require('commander');
// Use dynamic import for inquirer due to ES module compatibility
const shell = require('shelljs');
const fs = require('fs');
const path = require('path');
// Use dynamic import for chalk due to ES module compatibility
const packageJson = require('./package.json');

const program = new Command();

// Display banner and tagline using dynamic import for chalk
(async () => {
  const chalk = (await import('chalk')).default;
  console.log(chalk.cyan(`
██     ██ ███████ ███████ ███████ 
██     ██ ██      ██         ███  
██  █  ██ █████   █████     ███   
██ ███ ██ ██      ██       ███    
 ███ ███  ███████ ███████ ███████ 
                                                                
`));

  console.log(chalk.cyan("Weez: Projects setup in a breeze") + chalk.red(" 🌴") + "\n");

  program
    .name('weez')
    .description('A scaffolding CLI tool for frontend projects')
    .version(packageJson.version, '-V, --version', 'output the version number')
    .option('-v', 'output the version number', () => {
      console.log(packageJson.version);
      process.exit(0);
    })
    .addHelpText('after', 
  `

Documentation: https://weez-docs.example.com
Repository: https://github.com/yourusername/weez
  `);

  // Command for Prettier configuration
  program
    .command('prettier')
    .description('Configure Prettier for your project')
    .action(async () => {
      console.log('Configuring Prettier...');
      const inquirer = await import('inquirer');
      const answers = await inquirer.default.prompt([
        {
          type: 'confirm',
          name: 'installPrettier',
          message: 'Do you want to install Prettier?',
          default: true
        }
      ]);

      if (answers.installPrettier) {
        console.log('Installing Prettier...');
        shell.exec('npm install --save-dev prettier');
        console.log('Prettier installed successfully!');

        // Update consumer's package.json with Prettier scripts
        const pkgJsonPath = path.join(process.cwd(), 'package.json');
        if (fs.existsSync(pkgJsonPath)) {
          const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
          pkgJson.scripts = pkgJson.scripts || {};
          pkgJson.scripts['format'] = 'prettier --write "src/**/*.{js,jsx,ts,tsx}"';
          pkgJson.scripts['format:check'] = 'prettier --check "src/**/*.{js,jsx,ts,tsx}"';
          fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2), 'utf8');
          console.log('Added Prettier scripts to package.json');
        } else {
          console.log('Could not find package.json in current directory. Scripts not added.');
        }

        // Create a basic .prettierrc configuration file
        const prettierRcPath = path.join(process.cwd(), '.prettierrc');
        const prettierConfig = {
          singleQuote: true,
          trailingComma: 'es5',
          semi: true,
          tabWidth: 2,
          printWidth: 80
        };
        fs.writeFileSync(prettierRcPath, JSON.stringify(prettierConfig, null, 2), 'utf8');
        console.log('Created .prettierrc with basic configurations');
      } else {
        console.log('Skipping Prettier installation.');
      }
    });

  // Command for ESLint configuration
  program
    .command('eslint')
    .description('Configure ESLint for your project with v9 flat config')
    .action(async () => {
      console.log('Configuring ESLint...');
      const inquirer = await import('inquirer');

      // Check for existing ESLint config files
      const eslintConfigFiles = [
        'eslint.config.js', 'eslint.config.mjs',
        '.eslintrc', '.eslintrc.js', '.eslintrc.json', '.eslintrc.yaml', '.eslintrc.yml'
      ];
      let existingConfig = null;
      for (const file of eslintConfigFiles) {
        const configPath = path.join(process.cwd(), file);
        if (fs.existsSync(configPath)) {
          existingConfig = file;
          break;
        }
      }

      let proceed = true;
      if (existingConfig) {
        const overwriteAnswer = await inquirer.default.prompt([
          {
            type: 'confirm',
            name: 'overwriteConfig',
            message: `An existing ESLint config (${existingConfig}) was found. Do you want to overwrite it with the new configuration?`,
            default: false
          }
        ]);
        proceed = overwriteAnswer.overwriteConfig;
      }

      if (proceed) {
        const answers = await inquirer.default.prompt([
          {
            type: 'confirm',
            name: 'installEslint',
            message: 'Do you want to install ESLint and related plugins?',
            default: true
          }
        ]);

        if (answers.installEslint) {
          console.log('Installing ESLint and plugins...');
          shell.exec('npm install --save-dev eslint@9 @next/eslint-plugin-next @stylistic/eslint-plugin @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-import eslint-plugin-react-hooks eslint-plugin-simple-import-sort eslint-plugin-unused-imports eslint-plugin-react-refresh globals');
          console.log('ESLint and plugins installed successfully!');

          // Update consumer's package.json with ESLint scripts
          const pkgJsonPath = path.join(process.cwd(), 'package.json');
          if (fs.existsSync(pkgJsonPath)) {
            const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
            pkgJson.scripts = pkgJson.scripts || {};
            pkgJson.scripts['lint'] = 'eslint "**/*.{js,jsx,ts,tsx}"';
            pkgJson.scripts['lint:fix'] = 'eslint "**/*.{js,jsx,ts,tsx}" --fix';
            fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2), 'utf8');
            console.log('Added ESLint scripts to package.json');
          } else {
            console.log('Could not find package.json in current directory. Scripts not added.');
          }

          // Delete existing config if it exists and user confirmed overwrite
          if (existingConfig) {
            const configPathToDelete = path.join(process.cwd(), existingConfig);
            fs.unlinkSync(configPathToDelete);
            console.log(`Removed existing ${existingConfig}`);
          }

          // Create eslint.config.mjs with the provided configuration
          const eslintConfigPath = path.join(process.cwd(), 'eslint.config.mjs');
          const eslintConfigContent = `import nextEslint from '@next/eslint-plugin-next';
import stylisticPlugin from '@stylistic/eslint-plugin';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

const eslintConfig = [
  {
    // Ignore patterns
    ignores: [
      '.next/**',
      'node_modules/**',
      'public/**',
      'dist/**',
      'build/**',
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
    files: ['src/**/*.{js,mjs,cjs,jsx,ts,tsx}', 'app/**/*.{js,mjs,cjs,jsx,ts,tsx}', 'pages/**/*.{js,mjs,cjs,jsx,ts,tsx}', 'components/**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      '@stylistic': stylisticPlugin,
      'unused-imports': unusedImports,
      'simple-import-sort': simpleImportSort,
      'import': importPlugin,
      '@typescript-eslint': tseslint,
      '@next/next': nextEslint,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        // Note: If you encounter issues with ESLint not finding files in tsconfig.json,
        // ensure your tsconfig.json includes the files you are linting or adjust the 'files' pattern above.
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: globals.browser,
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

      // React hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

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

      // Next.js specific rules
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-img-element': 'warn',
    },
  },
];

export default eslintConfig;
`;
          fs.writeFileSync(eslintConfigPath, eslintConfigContent, 'utf8');
          console.log('Created eslint.config.mjs with modern v9 flat config');
          console.log(chalk.yellow('Note: If ESLint reports errors about tsconfig.json not including files, ensure your tsconfig.json includes the files you are linting or adjust the ESLint config files pattern.'));
        } else {
          console.log('Skipping ESLint installation.');
        }

        // Create or update .vscode/settings.json for ESLint and Prettier settings in VS Code
        const vscodeSettingsPath = path.join(process.cwd(), '.vscode', 'settings.json');
        let updateVscodeSettings = true;
        if (fs.existsSync(vscodeSettingsPath)) {
          const vscodeSettingsAnswer = await inquirer.default.prompt([
            {
              type: 'confirm',
              name: 'overwriteSettings',
              message: 'An existing .vscode/settings.json was found. Do you want to update it with ESLint and Prettier settings?',
              default: false
            }
          ]);
          updateVscodeSettings = vscodeSettingsAnswer.overwriteSettings;
        }

        if (updateVscodeSettings) {
          const vscodeSettingsDir = path.dirname(vscodeSettingsPath);
          if (!fs.existsSync(vscodeSettingsDir)) {
            fs.mkdirSync(vscodeSettingsDir, { recursive: true });
          }

          const vscodeSettings = {
              "prettier.enable": true,
              "eslint.enable": true,
              "editor.formatOnSave": true,
              "editor.defaultFormatter": null,
              "editor.codeActionsOnSave": {
                "source.fixAll.eslint": "always"
              },
              "[javascript]": {
                "editor.defaultFormatter": "dbaeumer.vscode-eslint"
              },
              "[javascriptreact]": {
                "editor.defaultFormatter": "dbaeumer.vscode-eslint"
              },
              "[typescript]": {
                "editor.defaultFormatter": "dbaeumer.vscode-eslint"
              },
              "[typescriptreact]": {
                "editor.defaultFormatter": "dbaeumer.vscode-eslint"
              },
              "eslint.workingDirectories": [
                {
                  "mode": "auto"
                }
              ],
              "eslint.useFlatConfig": true,
              "eslint.format.enable": true,
              "eslint.options": {
                "overrideConfigFile": "eslint.config.mjs"
              },
              "eslint.validate": [
                "javascript",
                "javascriptreact",
                "typescript",
                "typescriptreact"
              ]
          };

          // If settings.json exists, merge with existing content
          if (fs.existsSync(vscodeSettingsPath)) {
            const existingSettings = JSON.parse(fs.readFileSync(vscodeSettingsPath, 'utf8'));
            Object.assign(existingSettings, vscodeSettings);
            fs.writeFileSync(vscodeSettingsPath, JSON.stringify(existingSettings, null, 2), 'utf8');
          } else {
            fs.writeFileSync(vscodeSettingsPath, JSON.stringify(vscodeSettings, null, 2), 'utf8');
          }
          console.log('Updated .vscode/settings.json with ESLint and Prettier settings for VS Code');
        } else {
          console.log('Skipped updating .vscode/settings.json');
        }
      } else {
        console.log('Cancelled ESLint configuration due to existing config.');
      }
    });

  program.parse(process.argv);
})();
