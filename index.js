#!/usr/bin/env node

const { Command } = require('commander');
// Use dynamic import for inquirer due to ES module compatibility
const shell = require('shelljs');
const fs = require('fs');
const path = require('path');
const packageJson = require('./package.json');

const program = new Command();

program
  .name('weez')
  .description('Weez CLI - Configure development tools for your project')
  .version(packageJson.version);

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

program.parse(process.argv);
