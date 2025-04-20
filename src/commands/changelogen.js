const path = require('path');
const fs = require('fs');
const { fileExists, writeToFile } = require('../utils/file');
const { installDevDependencies, updatePackageJsonScripts } = require('../utils/npm');

/**
 * Configures changelogen for a project
 */
async function configureChangelogen() {
  console.log('Configuring changelogen for changelog generation...');
  const inquirer = await import('inquirer');
  
  const answers = await inquirer.default.prompt([
    {
      type: 'confirm',
      name: 'installChangelogen',
      message: 'Do you want to set up changelogen for automatic changelog generation?',
      default: true
    },
    {
      type: 'confirm',
      name: 'createChangelogFile',
      message: 'Do you want to create an initial CHANGELOG.md file?',
      default: true,
      when: (answers) => answers.installChangelogen
    }
  ]);

  if (answers.installChangelogen) {
    // Check if package.json exists
    const pkgJsonPath = path.join(process.cwd(), 'package.json');
    if (!fileExists(pkgJsonPath)) {
      console.log('Could not find package.json in current directory. Please initialize a project first.');
      return;
    }

    try {
      // Install dependencies
      console.log('Installing changelogen as a dev dependency...');
      const dependencies = ['changelogen'];
      
      const success = installDevDependencies(dependencies);
      
      if (!success) {
        console.log('Failed to install dependencies. Please check your package manager configuration.');
        return;
      }
      
      console.log('Changelogen installed successfully!');
      
      // Create .changelogrc file
      console.log('Creating changelogen configuration...');
      const changelogrcPath = path.join(process.cwd(), '.changelogrc');
      const templatePath = path.join(__dirname, '../templates/changelogen/.changelogrc');
      
      if (fileExists(templatePath)) {
        const templateContent = fs.readFileSync(templatePath, 'utf8');
        writeToFile(changelogrcPath, templateContent);
        console.log('Created .changelogrc configuration file');
      } else {
        console.log('Could not find changelogen template. Please check your installation.');
        return;
      }
      
      // Create initial CHANGELOG.md if requested
      if (answers.createChangelogFile) {
        const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
        const changelogTemplatePath = path.join(__dirname, '../templates/changelogen/CHANGELOG.md');
        
        if (!fileExists(changelogPath)) {
          if (fileExists(changelogTemplatePath)) {
            const templateContent = fs.readFileSync(changelogTemplatePath, 'utf8');
            writeToFile(changelogPath, templateContent);
            console.log('Created initial CHANGELOG.md file');
          } else {
            // Create a basic changelog file if template doesn't exist
            writeToFile(changelogPath, '# Changelog\n\nAll notable changes to this project will be documented in this file.\n');
            console.log('Created basic CHANGELOG.md file');
          }
        } else {
          console.log('CHANGELOG.md already exists, skipping creation');
        }
      }
      
      // Add changelog script to package.json
      const scripts = {
        'changelog': 'npx changelogen@latest --release'
      };
      
      updatePackageJsonScripts(scripts);
      console.log('Added "changelog" script to package.json');
      
      console.log('\n✅ Changelogen setup complete!');
      console.log('\nYou can now generate a changelog with:');
      console.log('  pnpm changelog');
      console.log('\nThis will:');
      console.log('1. Generate a changelog based on your conventional commits');
      console.log('2. Update your CHANGELOG.md file');
      console.log('3. Bump your package version');
      console.log('4. Create a commit and tag for the release');
      
    } catch (error) {
      console.error('Error during changelogen setup:', error.message);
    }
  } else {
    console.log('Skipping changelogen installation.');
  }
}

module.exports = {
  command: 'changelog',
  description: 'Configure changelogen for automatic changelog generation',
  action: configureChangelogen
};
