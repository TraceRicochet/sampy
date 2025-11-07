const path = require('path');
const fs = require('fs');
const { fileExists } = require('../utils/file');
const { spawn } = require('child_process');

/**
 * Detects existing shadcn/ui installation
 */
function detectShadcnSetup() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  let hasShadcn = false;
  let hasConfig = false;
  let hasComponents = false;

  // Check package.json for shadcn dependencies
  if (fileExists(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };
    // Check for common shadcn dependencies
    hasShadcn = '@radix-ui/react-slot' in allDeps || 'class-variance-authority' in allDeps || 'clsx' in allDeps;
  }

  // Check for components.json config
  const configPath = path.join(process.cwd(), 'components.json');
  hasConfig = fileExists(configPath);

  // Check for components directory
  const possibleComponentDirs = [
    'components/ui',
    'src/components/ui'
  ];
  
  for (const dir of possibleComponentDirs) {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory()) {
      const files = fs.readdirSync(dirPath);
      if (files.length > 0) {
        hasComponents = true;
        break;
      }
    }
  }

  return { hasShadcn, hasConfig, hasComponents };
}

/**
 * Runs a command and returns a promise
 */
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      cwd: process.cwd(),
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Configures shadcn/ui for Vite React projects
 */
async function configureShadcnReact() {
  console.log('Setting up shadcn/ui for Vite React...');
  const inquirer = await import('inquirer');
  const chalk = (await import('chalk')).default;

  // Detect existing setup
  const { hasShadcn, hasConfig, hasComponents } = detectShadcnSetup();

  let setupMessage = 'Do you want to initialize shadcn/ui for Vite React?';
  let setupDefault = true;

  if (hasShadcn && hasConfig && hasComponents) {
    setupMessage = 'shadcn/ui appears to be fully configured. Do you want to add more components?';
    setupDefault = true;
  } else if (hasShadcn && hasConfig) {
    setupMessage = 'shadcn/ui is initialized but no components found. Do you want to add components?';
  } else if (hasShadcn) {
    setupMessage = 'shadcn/ui dependencies found but not initialized. Do you want to initialize it?';
  }

  const answers = await inquirer.default.prompt([
    {
      type: 'confirm',
      name: 'setupShadcn',
      message: setupMessage,
      default: setupDefault
    }
  ]);

  if (answers.setupShadcn) {
    try {
      // Initialize shadcn/ui if not already configured
      if (!hasConfig) {
        console.log('Initializing shadcn/ui for Vite React...');
        await runCommand('npx', ['shadcn@latest', 'init', '--yes']);
        console.log('shadcn/ui initialized successfully!');
      }

      // Ask which components to add
      const componentAnswers = await inquirer.default.prompt([
        {
          type: 'confirm',
          name: 'addComponents',
          message: 'Do you want to add some common components?',
          default: true
        }
      ]);

      if (componentAnswers.addComponents) {
        const componentChoices = await inquirer.default.prompt([
          {
            type: 'checkbox',
            name: 'components',
            message: 'Select components to add:',
            choices: [
              { name: 'Button', value: 'button', checked: true },
              { name: 'Input', value: 'input', checked: true },
              { name: 'Label', value: 'label', checked: true },
              { name: 'Card', value: 'card', checked: true },
              { name: 'Dialog', value: 'dialog', checked: false },
              { name: 'Dropdown Menu', value: 'dropdown-menu', checked: false },
              { name: 'Form', value: 'form', checked: false },
              { name: 'Select', value: 'select', checked: false },
              { name: 'Textarea', value: 'textarea', checked: false },
              { name: 'Toast', value: 'toast', checked: false },
              { name: 'Tooltip', value: 'tooltip', checked: false },
              { name: 'Badge', value: 'badge', checked: false },
              { name: 'Avatar', value: 'avatar', checked: false },
              { name: 'Alert', value: 'alert', checked: false },
              { name: 'Separator', value: 'separator', checked: false }
            ]
          }
        ]);

        if (componentChoices.components.length > 0) {
          console.log(`Adding ${componentChoices.components.length} components...`);
          
          for (const component of componentChoices.components) {
            console.log(`Adding ${component}...`);
            await runCommand('npx', ['shadcn@latest', 'add', component, '--yes']);
          }
          
          console.log('Components added successfully!');
        }
      }

      console.log(chalk.green('\n✅ shadcn/ui setup complete for Vite React!'));
      console.log(chalk.yellow('\nYou can now use shadcn/ui components in your React app:'));
      console.log(chalk.cyan('  import { Button } from "@/components/ui/button"'));
      console.log(chalk.cyan('  import { Input } from "@/components/ui/input"'));
      console.log(chalk.yellow('\nTo add more components later, run:'));
      console.log(chalk.cyan('  npx shadcn@latest add [component-name]'));
      console.log(chalk.yellow('\nBrowse all components at: https://ui.shadcn.com/docs/components'));

    } catch (error) {
      console.error('Failed to set up shadcn/ui:', error.message);
      console.log(chalk.yellow('\nYou can manually initialize shadcn/ui by running:'));
      console.log(chalk.cyan('  npx shadcn@latest init'));
    }
  } else {
    console.log('Skipping shadcn/ui setup.');
  }
}

module.exports = {
  command: 'shadcn-react',
  description: 'Configure shadcn/ui for Vite React projects',
  action: configureShadcnReact
};
