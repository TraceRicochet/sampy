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
  console.log(chalk.magenta(`
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

  program.parse(process.argv);
})();
