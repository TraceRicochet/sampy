const path = require('path');
const fs = require('fs');
const { fileExists } = require('../utils/file');

// Import all command modules
const nextCleanCommand = require('./next-clean');
const reactCleanCommand = require('./react-clean');
const prettierCommand = require('./prettier');
const eslintNextCommand = require('./eslint-next');
const eslintReactCommand = require('./eslint-react');
const tailwindNextCommand = require('./tailwind-next');
const tailwindReactCommand = require('./tailwind-react');
const shadcnNextCommand = require('./shadcn-next');
const shadcnReactCommand = require('./shadcn-react');
const zustandCommand = require('./zustand');
const vitestCommand = require('./vitest');
const commitlintCommand = require('./commitlint');
const changelogCommand = require('./changelogen');
const nextThemesCommand = require('./next-themes-toggle');

/**
 * Detects the project framework
 */
function detectFramework() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!fileExists(packageJsonPath)) {
    return 'unknown';
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };

  // Check for Next.js
  if ('next' in allDeps) {
    return 'next';
  }

  // Check for Vite + React
  if ('vite' in allDeps && ('react' in allDeps || '@vitejs/plugin-react' in allDeps)) {
    return 'vite-react';
  }

  // Check for React (could be CRA or other)
  if ('react' in allDeps) {
    return 'react';
  }

  return 'unknown';
}

/**
 * Interactive installer for all sampy commands
 */
async function installAll() {
  console.log('🚀 Welcome to sampy install all!');
  const inquirer = await import('inquirer');
  const chalk = (await import('chalk')).default;

  // Detect framework
  const framework = detectFramework();
  console.log(chalk.blue(`Detected framework: ${framework}`));

  if (framework === 'unknown') {
    console.log(chalk.yellow('Could not detect framework. Make sure you\'re in a React/Next.js project directory.'));
    return;
  }

  // Build choices based on framework
  const choices = [];

  // Framework-specific cleanup
  if (framework === 'next') {
    choices.push({ name: '🧹 Clean Next.js boilerplate', value: 'next-clean', checked: true });
  } else if (framework === 'vite-react') {
    choices.push({ name: '🧹 Clean Vite React boilerplate', value: 'react-clean', checked: true });
  }

  // Universal tools
  choices.push(
    { name: '✨ Prettier (code formatting)', value: 'prettier', checked: true },
    { name: '🔍 ESLint (linting)', value: framework === 'next' ? 'eslint-next' : 'eslint-react', checked: true },
    { name: '🎨 Tailwind CSS (styling)', value: framework === 'next' ? 'tailwind-next' : 'tailwind-react', checked: true },
    { name: '🧩 shadcn/ui (components)', value: framework === 'next' ? 'shadcn-next' : 'shadcn-react', checked: false },
    { name: '🗃️ Zustand (state management)', value: 'zustand', checked: false },
    { name: '🧪 Vitest (testing)', value: 'vitest', checked: false },
    { name: '📝 Commitlint (commit conventions)', value: 'commitlint', checked: false },
    { name: '📋 Changelog (automatic changelogs)', value: 'changelog', checked: false }
  );

  // Next.js specific
  if (framework === 'next') {
    choices.push({ name: '🌙 Next Themes (dark mode)', value: 'next-themes', checked: false });
  }

  const answers = await inquirer.default.prompt([
    {
      type: 'checkbox',
      name: 'tools',
      message: 'Select tools to install/configure:',
      choices: choices,
      pageSize: 15
    }
  ]);

  if (answers.tools.length === 0) {
    console.log('No tools selected. Exiting.');
    return;
  }

  console.log(chalk.green(`\n🎯 Installing ${answers.tools.length} tools...\n`));

  // Execute selected commands in order
  const commandMap = {
    'next-clean': nextCleanCommand.action,
    'react-clean': reactCleanCommand.action,
    'prettier': prettierCommand.action,
    'eslint-next': eslintNextCommand.action,
    'eslint-react': eslintReactCommand.action,
    'tailwind-next': tailwindNextCommand.action,
    'tailwind-react': tailwindReactCommand.action,
    'shadcn-next': shadcnNextCommand.action,
    'shadcn-react': shadcnReactCommand.action,
    'zustand': zustandCommand.action,
    'vitest': vitestCommand.action,
    'commitlint': commitlintCommand.action,
    'changelog': changelogCommand.action,
    'next-themes': nextThemesCommand.action
  };

  for (let i = 0; i < answers.tools.length; i++) {
    const tool = answers.tools[i];
    const commandAction = commandMap[tool];
    
    if (commandAction) {
      console.log(chalk.cyan(`\n[${i + 1}/${answers.tools.length}] Running ${tool}...`));
      console.log(chalk.gray('─'.repeat(50)));
      
      try {
        // Set a global flag to skip individual command prompts
        process.env.SAMPY_AUTO_CONFIRM = 'true';
        await commandAction();
        delete process.env.SAMPY_AUTO_CONFIRM;
      } catch (error) {
        console.error(chalk.red(`Error running ${tool}:`, error.message));
        console.log(chalk.yellow(`Continuing with remaining tools...\n`));
      }
      
      console.log(chalk.gray('─'.repeat(50)));
    }
  }

  console.log(chalk.green('\n🎉 All selected tools have been processed!'));
  console.log(chalk.yellow('\nYour project is ready to go! Happy coding! 🚀'));
}

module.exports = {
  command: 'install',
  description: 'Interactive installer for all sampy tools',
  action: installAll
};
