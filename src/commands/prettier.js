const path = require('path');
const fs = require('fs');
const { fileExists, writeToFile } = require('../utils/file');
const { installDevDependencies, updatePackageJsonScripts } = require('../utils/npm');

/**
 * Configures Prettier for a project
 */
async function configurePrettier() {
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
    const success = installDevDependencies('prettier');
    
    if (success) {
      console.log('Prettier installed successfully!');
      
      // Update package.json with Prettier scripts
      const scripts = {
        'format': 'prettier --write "src/**/*.{js,jsx,ts,tsx}"',
        'format:check': 'prettier --check "src/**/*.{js,jsx,ts,tsx}"'
      };
      
      updatePackageJsonScripts(scripts);
      
      // Create a basic .prettierrc configuration file
      const prettierRcPath = path.join(process.cwd(), '.prettierrc');
      const templatePath = path.join(__dirname, '../templates/prettier/.prettierrc.js');
      
      if (fileExists(templatePath)) {
        const templateContent = fs.readFileSync(templatePath, 'utf8');
        writeToFile(prettierRcPath, templateContent);
        console.log('Created .prettierrc with basic configurations');
      } else {
        // Fallback if template doesn't exist
        const prettierConfig = {
          singleQuote: true,
          trailingComma: 'es5',
          semi: true,
          tabWidth: 2,
          printWidth: 80
        };
        writeToFile(prettierRcPath, prettierConfig, true);
        console.log('Created .prettierrc with basic configurations');
      }
    } else {
      console.log('Failed to install Prettier. Please check your npm configuration.');
    }
  } else {
    console.log('Skipping Prettier installation.');
  }
}

module.exports = {
  command: 'prettier',
  description: 'Configure Prettier for your project',
  action: configurePrettier
};
