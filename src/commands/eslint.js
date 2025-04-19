const path = require('path');
const fs = require('fs');
const { fileExists, ensureDirectoryExists, writeToFile } = require('../utils/file');
const { installDevDependencies, updatePackageJsonScripts } = require('../utils/npm');

/**
 * Configures ESLint for a project
 */
async function configureEslint() {
  console.log('Configuring ESLint...');
  const inquirer = await import('inquirer');
  const chalk = (await import('chalk')).default;

  // Check for existing ESLint config files
  const eslintConfigFiles = [
    'eslint.config.js', 'eslint.config.mjs',
    '.eslintrc', '.eslintrc.js', '.eslintrc.json', '.eslintrc.yaml', '.eslintrc.yml'
  ];
  
  let existingConfig = null;
  for (const file of eslintConfigFiles) {
    const configPath = path.join(process.cwd(), file);
    if (fileExists(configPath)) {
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
      const packages = [
        'eslint@9',
        '@next/eslint-plugin-next',
        '@stylistic/eslint-plugin',
        '@typescript-eslint/eslint-plugin',
        '@typescript-eslint/parser',
        'eslint-plugin-import',
        'eslint-plugin-react-hooks',
        'eslint-plugin-simple-import-sort',
        'eslint-plugin-unused-imports',
        'eslint-plugin-react-refresh',
        'globals'
      ];
      
      const success = installDevDependencies(packages);
      
      if (success) {
        console.log('ESLint and plugins installed successfully!');
        
        // Update package.json with ESLint scripts
        const scripts = {
          'lint': 'eslint "**/*.{js,jsx,ts,tsx}"',
          'lint:fix': 'eslint "**/*.{js,jsx,ts,tsx}" --fix'
        };
        
        updatePackageJsonScripts(scripts);
        
        // Delete existing config if it exists and user confirmed overwrite
        if (existingConfig) {
          const configPathToDelete = path.join(process.cwd(), existingConfig);
          fs.unlinkSync(configPathToDelete);
          console.log(`Removed existing ${existingConfig}`);
        }

        // Create eslint.config.mjs with the provided configuration
        const eslintConfigPath = path.join(process.cwd(), 'eslint.config.mjs');
        const templatePath = path.join(__dirname, '../templates/eslint/eslint.config.mjs');
        
        if (fileExists(templatePath)) {
          const templateContent = fs.readFileSync(templatePath, 'utf8');
          writeToFile(eslintConfigPath, templateContent);
          console.log('Created eslint.config.mjs with modern v9 flat config');
        } else {
          console.error('ESLint template file not found. Configuration not created.');
        }
        
        console.log(chalk.yellow('Note: If ESLint reports errors about tsconfig.json not including files, ensure your tsconfig.json includes the files you are linting or adjust the ESLint config files pattern.'));
        
        // Create or update .vscode/settings.json for ESLint and Prettier settings in VS Code
        await updateVSCodeSettings(inquirer.default);
      } else {
        console.log('Failed to install ESLint. Please check your npm configuration.');
      }
    } else {
      console.log('Skipping ESLint installation.');
    }
  } else {
    console.log('Cancelled ESLint configuration due to existing config.');
  }
}

/**
 * Updates VS Code settings for ESLint and Prettier
 * @param {Object} inquirer - Inquirer instance for prompting
 */
async function updateVSCodeSettings(inquirer) {
  const vscodeSettingsPath = path.join(process.cwd(), '.vscode', 'settings.json');
  let updateVscodeSettings = true;
  
  if (fileExists(vscodeSettingsPath)) {
    const vscodeSettingsAnswer = await inquirer.prompt([
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
    ensureDirectoryExists(vscodeSettingsDir);

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
      "css.lint.unknownAtRules": "ignore",
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
    if (fileExists(vscodeSettingsPath)) {
      const existingSettings = JSON.parse(fs.readFileSync(vscodeSettingsPath, 'utf8'));
      Object.assign(existingSettings, vscodeSettings);
      writeToFile(vscodeSettingsPath, existingSettings, true);
    } else {
      writeToFile(vscodeSettingsPath, vscodeSettings, true);
    }
    
    console.log('Updated .vscode/settings.json with ESLint and Prettier settings for VS Code');
  } else {
    console.log('Skipped updating .vscode/settings.json');
  }
}

module.exports = {
  command: 'eslint',
  description: 'Configure ESLint for your project with v9 flat config',
  action: configureEslint
};
