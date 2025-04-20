const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { fileExists, writeToFile, ensureDirectoryExists } = require('../utils/file');
const { installDevDependencies, updatePackageJsonScripts } = require('../utils/npm');

/**
 * Configures commitlint and husky for a project
 */
async function configureCommitlint() {
  console.log('Configuring commitlint and husky...');
  const inquirer = await import('inquirer');
  
  const answers = await inquirer.default.prompt([
    {
      type: 'confirm',
      name: 'installCommitlint',
      message: 'Do you want to install commitlint and husky to enforce conventional commits?',
      default: true
    }
  ]);

  if (answers.installCommitlint) {
    // Check if package.json exists
    const pkgJsonPath = path.join(process.cwd(), 'package.json');
    if (!fileExists(pkgJsonPath)) {
      console.log('Could not find package.json in current directory. Please initialize a project first.');
      return;
    }

    try {
      // Install dependencies
      console.log('Installing commitlint and husky dependencies...');
      const dependencies = [
        '@commitlint/cli',
        '@commitlint/config-conventional',
        '@commitlint/types',
        'husky'
      ];
      
      const success = installDevDependencies(dependencies);
      
      if (!success) {
        console.log('Failed to install dependencies. Please check your npm configuration.');
        return;
      }
      
      console.log('Dependencies installed successfully!');
      
      // Create commitlint config file
      console.log('Creating commitlint configuration...');
      const commitlintConfigPath = path.join(process.cwd(), '.commitlintrc.ts');
      const templatePath = path.join(__dirname, '../templates/commitlint/.commitlintrc.ts');
      
      if (fileExists(templatePath)) {
        const templateContent = fs.readFileSync(templatePath, 'utf8');
        writeToFile(commitlintConfigPath, templateContent);
        console.log('Created .commitlintrc.ts with configuration');
      } else {
        console.log('Could not find commitlint template. Please check your installation.');
        return;
      }
      
      // Config file is already written above
      
      // Set up husky
      console.log('Setting up husky...');
      try {
        // Initialize husky
        await runInteractiveCommand('pnpm', ['husky', 'init']);
        
        // Remove the pre-commit hook that gets auto-generated
        const preCommitPath = path.join(process.cwd(), '.husky', 'pre-commit');
        if (fileExists(preCommitPath)) {
          fs.unlinkSync(preCommitPath);
          console.log('Removed auto-generated pre-commit hook');
        }
        
        // Create commit-msg hook
        const huskyDir = path.join(process.cwd(), '.husky');
        const commitMsgPath = path.join(huskyDir, 'commit-msg');
        
        // Check if the husky directory exists
        if (!fileExists(huskyDir)) {
          ensureDirectoryExists(huskyDir);
        }
        
        // Create commit-msg hook from template
        const commitMsgTemplatePath = path.join(__dirname, '../templates/commitlint/commit-msg');
        let commitMsgContent;
        
        if (fileExists(commitMsgTemplatePath)) {
          commitMsgContent = fs.readFileSync(commitMsgTemplatePath, 'utf8');
        } else {
          // Fallback if template doesn't exist
          commitMsgContent = `pnpm commitlint --edit "$1"
`;
          console.log('Could not find commit-msg template, using default.');
        }
        
        writeToFile(commitMsgPath, commitMsgContent);
        fs.chmodSync(commitMsgPath, '755'); // Make executable
        console.log('Created husky commit-msg hook');
        
        // Add prepare script to package.json
        const scripts = {
          'prepare': 'husky'
        };
        
        updatePackageJsonScripts(scripts);
        
        console.log('\n✅ commitlint and husky setup complete!');
        console.log('\nNow your commits will be validated against the conventional commit format.');
        console.log('Example valid commit messages:');
        console.log('  feat: add new feature');
        console.log('  fix: resolve issue with login');
        console.log('  docs: update README');
        console.log('  style: format code');
        console.log('  refactor: simplify authentication logic');
        
      } catch (error) {
        console.error('Error setting up husky:', error.message);
      }
      
    } catch (error) {
      console.error('Error during commitlint setup:', error.message);
    }
  } else {
    console.log('Skipping commitlint and husky installation.');
  }
}

/**
 * Runs a command with interactive input support
 * @param {string} command - The command to run
 * @param {string[]} args - Command arguments
 * @returns {Promise<void>}
 */
function runInteractiveCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit', // This is key for interactive prompts
      shell: true
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command exited with code ${code}`));
      }
    });
    
    child.on('error', (err) => {
      reject(err);
    });
  });
}

module.exports = {
  command: 'commitlint',
  description: 'Configure commitlint and husky to enforce conventional commits',
  action: configureCommitlint
};
