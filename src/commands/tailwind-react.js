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
  let hasVitePlugin = false;
  let hasCss = false;

  // Check package.json for tailwindcss
  if (fileExists(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };
    hasTailwind = 'tailwindcss' in allDeps;
    hasVitePlugin = '@tailwindcss/vite' in allDeps;
  }

  // Check for Vite config with Tailwind plugin
  const viteConfigFiles = [
    'vite.config.js',
    'vite.config.ts',
    'vite.config.mjs'
  ];
  
  for (const file of viteConfigFiles) {
    if (fileExists(path.join(process.cwd(), file))) {
      const content = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      if (content.includes('@tailwindcss/vite')) {
        hasVitePlugin = true;
        break;
      }
    }
  }

  // Check for Tailwind v4.0 import in CSS files
  const cssFiles = [
    'src/index.css',
    'src/App.css',
    'src/main.css',
    'src/styles/globals.css',
    'index.css'
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

  return { hasTailwind, hasVitePlugin, hasCss };
}

/**
 * Configures Tailwind CSS v4.0 for React projects (Vite, CRA, etc.)
 */
async function configureTailwindReact() {
  console.log('Setting up Tailwind CSS v4.0 for React...');
  const inquirer = await import('inquirer');
  const chalk = (await import('chalk')).default;

  // Detect existing setup
  const { hasTailwind, hasVitePlugin, hasCss } = detectTailwindSetup();

  let installMessage = 'Do you want to install and configure Tailwind CSS v4.0?';
  let installDefault = true;

  if (hasTailwind && hasVitePlugin && hasCss) {
    installMessage = 'Tailwind CSS v4.0 appears to be fully configured. Do you want to reconfigure it?';
    installDefault = false;
  } else if (hasTailwind && hasVitePlugin) {
    installMessage = 'Tailwind CSS is installed with Vite plugin, but CSS setup may be incomplete. Do you want to complete the setup?';
  } else if (hasTailwind) {
    installMessage = 'Tailwind CSS is installed but not configured for v4.0. Do you want to configure it?';
  }

  // Skip prompt if running from install command
  let setupTailwind = installDefault;
  if (!process.env.SAMPY_AUTO_CONFIRM) {
    const answers = await inquirer.default.prompt([
      {
        type: 'confirm',
        name: 'setupTailwind',
        message: installMessage,
        default: installDefault
      }
    ]);
    setupTailwind = answers.setupTailwind;
  }

  if (setupTailwind) {
    // Install Tailwind CSS v4.0 if not already installed
    if (!hasTailwind) {
      console.log('Installing Tailwind CSS v4.0...');
      const packages = ['tailwindcss', '@tailwindcss/vite'];
      const success = installDevDependencies(packages);
      
      if (!success) {
        console.log('Failed to install Tailwind CSS v4.0. Please check your package manager configuration.');
        return;
      }
      console.log('Tailwind CSS v4.0 installed successfully!');
    }

    // Create or update Vite config for v4.0
    if (!hasVitePlugin || installDefault === false) {
      console.log('Updating Vite configuration for Tailwind CSS v4.0...');
      
      const viteConfigFiles = [
        'vite.config.js',
        'vite.config.ts',
        'vite.config.mjs'
      ];
      
      let viteConfigPath = null;
      for (const file of viteConfigFiles) {
        const filePath = path.join(process.cwd(), file);
        if (fileExists(filePath)) {
          viteConfigPath = filePath;
          break;
        }
      }
      
      if (viteConfigPath) {
        let existingContent = fs.readFileSync(viteConfigPath, 'utf8');
        if (!existingContent.includes('@tailwindcss/vite')) {
          // Add import at the top
          if (!existingContent.includes('import tailwindcss from \'@tailwindcss/vite\'')) {
            const importRegex = /(import.*from.*['"][^'"]*['"];?\s*\n)/g;
            const imports = existingContent.match(importRegex) || [];
            const lastImportIndex = imports.length > 0 ? 
              existingContent.lastIndexOf(imports[imports.length - 1]) + imports[imports.length - 1].length : 
              existingContent.indexOf('\n') + 1;
            
            existingContent = existingContent.slice(0, lastImportIndex) + 
              'import tailwindcss from \'@tailwindcss/vite\';\n' + 
              existingContent.slice(lastImportIndex);
          }
          
          // Add tailwindcss() to plugins array
          if (!existingContent.includes('tailwindcss()')) {
            existingContent = existingContent.replace(
              /plugins:\s*\[(.*?)\]/s,
              (match, pluginsContent) => {
                const plugins = pluginsContent.trim();
                if (plugins === '') {
                  return 'plugins: [tailwindcss()]';
                } else {
                  return `plugins: [${plugins}, tailwindcss()]`;
                }
              }
            );
          }
          
          writeToFile(viteConfigPath, existingContent);
          console.log(`Updated ${path.relative(process.cwd(), viteConfigPath)} with Tailwind CSS v4.0 plugin`);
        }
      } else {
        // Create basic vite.config.js
        const viteConfigContent = `import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
});`;
        writeToFile(path.join(process.cwd(), 'vite.config.js'), viteConfigContent);
        console.log('Created vite.config.js with Tailwind CSS v4.0 plugin');
      }
    }


    // Update CSS file with v4.0 import
    if (!hasCss) {
      const cssFiles = [
        'src/index.css',
        'src/App.css',
        'src/main.css'
      ];

      let cssPath = null;
      for (const file of cssFiles) {
        const filePath = path.join(process.cwd(), file);
        if (fileExists(filePath)) {
          cssPath = filePath;
          break;
        }
      }

      if (!cssPath) {
        // Create index.css if none found
        cssPath = path.join(process.cwd(), 'src/index.css');
      }

      const tailwindImport = `@import "tailwindcss";\n`;

      if (fileExists(cssPath)) {
        const existingContent = fs.readFileSync(cssPath, 'utf8');
        if (!existingContent.includes('@import "tailwindcss"')) {
          writeToFile(cssPath, tailwindImport + '\n' + existingContent);
          console.log(`Updated ${path.relative(process.cwd(), cssPath)} with Tailwind CSS v4.0 import`);
        }
      } else {
        writeToFile(cssPath, tailwindImport);
        console.log(`Created ${path.relative(process.cwd(), cssPath)} with Tailwind CSS v4.0 import`);
      }
    }

    console.log(chalk.green('\n✅ Tailwind CSS v4.0 setup complete for React!'));
    console.log(chalk.yellow('\nYou can now use Tailwind classes in your components:'));
    console.log(chalk.cyan('  <div className="bg-blue-500 text-white p-4 rounded-lg">'));
    console.log(chalk.cyan('    Hello Tailwind!'));
    console.log(chalk.cyan('  </div>'));
    console.log(chalk.yellow('\nMake sure to import your CSS file in your main component:'));
    console.log(chalk.cyan('  import "./index.css"'));
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
  command: 'tailwind-react',
  description: 'Configure Tailwind CSS v4.0 for React projects (Vite, CRA, etc.)',
  action: configureTailwindReact
};
