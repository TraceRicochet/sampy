const path = require('path');
const fs = require('fs');
const { fileExists, writeToFile } = require('../utils/file');
const { installDevDependencies } = require('../utils/npm');

/**
 * Detects existing Tailwind CSS v4.0 installation and configuration
 */
function detectTailwindSetup() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  let hasTailwind = false;
  let hasPostcssConfig = false;
  let hasCss = false;

  // Check package.json for tailwindcss
  if (fileExists(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };
    hasTailwind = 'tailwindcss' in allDeps;
  }

  // Check for PostCSS config (v4.0 uses PostCSS, not config files)
  const postcssFiles = [
    'postcss.config.js',
    'postcss.config.mjs',
    'postcss.config.ts'
  ];
  
  for (const file of postcssFiles) {
    if (fileExists(path.join(process.cwd(), file))) {
      const content = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      if (content.includes('@tailwindcss/postcss')) {
        hasPostcssConfig = true;
        break;
      }
    }
  }

  // Check for Tailwind v4.0 import in CSS files
  const cssFiles = [
    'src/app/globals.css',
    'app/globals.css',
    'styles/globals.css',
    'src/styles/globals.css'
  ];

  for (const file of cssFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fileExists(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('@import "tailwindcss"')) {
        hasCss = true;
        break;
      }
    }
  }

  return { hasTailwind, hasPostcssConfig, hasCss };
}

/**
 * Configures Tailwind CSS v4.0 for Next.js projects
 */
async function configureTailwindNext() {
  console.log('Setting up Tailwind CSS v4.0 for Next.js...');
  const inquirer = await import('inquirer');
  const chalk = (await import('chalk')).default;

  // Detect existing setup
  const { hasTailwind, hasPostcssConfig, hasCss } = detectTailwindSetup();

  let installMessage = 'Do you want to install and configure Tailwind CSS v4.0?';
  let installDefault = true;

  if (hasTailwind && hasPostcssConfig && hasCss) {
    installMessage = 'Tailwind CSS v4.0 appears to be fully configured. Do you want to reconfigure it?';
    installDefault = false;
  } else if (hasTailwind && hasPostcssConfig) {
    installMessage = 'Tailwind CSS is installed with PostCSS config, but CSS setup may be incomplete. Do you want to complete the setup?';
  } else if (hasTailwind) {
    installMessage = 'Tailwind CSS is installed but not configured for v4.0. Do you want to configure it?';
  }

  const answers = await inquirer.default.prompt([
    {
      type: 'confirm',
      name: 'setupTailwind',
      message: installMessage,
      default: installDefault
    }
  ]);

  if (answers.setupTailwind) {
    // Install Tailwind CSS v4.0 if not already installed
    if (!hasTailwind) {
      console.log('Installing Tailwind CSS v4.0...');
      const packages = ['tailwindcss', '@tailwindcss/postcss', 'postcss'];
      const success = installDevDependencies(packages);
      
      if (!success) {
        console.log('Failed to install Tailwind CSS v4.0. Please check your package manager configuration.');
        return;
      }
      console.log('Tailwind CSS v4.0 installed successfully!');
    }

    // Create or update PostCSS config for v4.0
    if (!hasPostcssConfig || installDefault === false) {
      console.log('Creating PostCSS configuration for Tailwind CSS v4.0...');
      const configPath = path.join(process.cwd(), 'postcss.config.mjs');
      
      const configContent = `const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;`;
      
      writeToFile(configPath, configContent);
      console.log('Created postcss.config.mjs for Next.js with Tailwind CSS v4.0');
    }


    // Update globals.css with v4.0 import
    if (!hasCss) {
      const globalsCssFiles = [
        'src/app/globals.css',
        'app/globals.css',
        'styles/globals.css'
      ];

      let globalsCssPath = null;
      for (const file of globalsCssFiles) {
        const filePath = path.join(process.cwd(), file);
        if (fileExists(filePath)) {
          globalsCssPath = filePath;
          break;
        }
      }

      if (!globalsCssPath) {
        // Create globals.css in the most likely location for Next.js
        globalsCssPath = path.join(process.cwd(), 'app/globals.css');
        if (!fileExists(path.dirname(globalsCssPath))) {
          globalsCssPath = path.join(process.cwd(), 'src/app/globals.css');
        }
      }

      const tailwindImport = `@import "tailwindcss";\n`;

      if (fileExists(globalsCssPath)) {
        const existingContent = fs.readFileSync(globalsCssPath, 'utf8');
        if (!existingContent.includes('@import "tailwindcss"')) {
          writeToFile(globalsCssPath, tailwindImport + '\n' + existingContent);
          console.log(`Updated ${path.relative(process.cwd(), globalsCssPath)} with Tailwind CSS v4.0 import`);
        }
      } else {
        writeToFile(globalsCssPath, tailwindImport);
        console.log(`Created ${path.relative(process.cwd(), globalsCssPath)} with Tailwind CSS v4.0 import`);
      }
    }

    console.log(chalk.green('\n✅ Tailwind CSS v4.0 setup complete for Next.js!'));
    console.log(chalk.yellow('\nYou can now use Tailwind classes in your components:'));
    console.log(chalk.cyan('  <div className="bg-blue-500 text-white p-4 rounded-lg">'));
    console.log(chalk.cyan('    Hello Tailwind!'));
    console.log(chalk.cyan('  </div>'));
    console.log(chalk.yellow('\nTo customize your theme, add an @theme block to your CSS file:'));
    console.log(chalk.cyan('  @theme {'));
    console.log(chalk.cyan('    --color-primary: #3b82f6;'));
    console.log(chalk.cyan('    --font-display: "Inter", sans-serif;'));
    console.log(chalk.cyan('  }'));
  } else {
    console.log('Skipping Tailwind CSS setup.');
  }
}

module.exports = {
  command: 'tailwind-next',
  description: 'Configure Tailwind CSS v4.0 for Next.js projects',
  action: configureTailwindNext
};
