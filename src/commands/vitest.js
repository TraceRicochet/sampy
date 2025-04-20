const path = require('path');
const fs = require('fs');
const { fileExists, writeToFile } = require('../utils/file');
const { installDevDependencies, updatePackageJsonScripts } = require('../utils/npm');

/**
 * Configures Vitest for a project
 */
async function configureVitest() {
  console.log('Configuring Vitest for testing...');
  const inquirer = await import('inquirer');
  
  const answers = await inquirer.default.prompt([
    {
      type: 'confirm',
      name: 'installVitest',
      message: 'Do you want to set up Vitest for testing?',
      default: true
    },
    {
      type: 'confirm',
      name: 'createExampleTest',
      message: 'Do you want to create an example test file?',
      default: true,
      when: (answers) => answers.installVitest
    }
  ]);

  if (answers.installVitest) {
    // Check if package.json exists
    const pkgJsonPath = path.join(process.cwd(), 'package.json');
    if (!fileExists(pkgJsonPath)) {
      console.log('Could not find package.json in current directory. Please initialize a project first.');
      return;
    }

    try {
      // Install dependencies
      console.log('Installing Vitest and related dependencies...');
      const dependencies = [
        'vitest',
        '@vitejs/plugin-react',
        'jsdom',
        '@testing-library/react',
        '@testing-library/dom',
        '@testing-library/jest-dom',
        'vite-tsconfig-paths'
      ];
      
      const success = installDevDependencies(dependencies);
      
      if (!success) {
        console.log('Failed to install dependencies. Please check your package manager configuration.');
        return;
      }
      
      console.log('Vitest and testing dependencies installed successfully!');
      
      // Create vitest.config.mts file
      console.log('Creating Vitest configuration...');
      const vitestConfigPath = path.join(process.cwd(), 'vitest.config.mts');
      const vitestConfigTemplatePath = path.join(__dirname, '../templates/vitest/vitest.config.mts');
      
      if (fileExists(vitestConfigTemplatePath)) {
        const templateContent = fs.readFileSync(vitestConfigTemplatePath, 'utf8');
        writeToFile(vitestConfigPath, templateContent);
        console.log('Created vitest.config.mts configuration file');
      } else {
        console.log('Could not find Vitest config template. Please check your installation.');
        return;
      }
      
      // Create vitest.setup.ts file
      const vitestSetupPath = path.join(process.cwd(), 'vitest.setup.ts');
      const vitestSetupTemplatePath = path.join(__dirname, '../templates/vitest/vitest.setup.ts');
      
      if (fileExists(vitestSetupTemplatePath)) {
        const templateContent = fs.readFileSync(vitestSetupTemplatePath, 'utf8');
        writeToFile(vitestSetupPath, templateContent);
        console.log('Created vitest.setup.ts file');
      } else {
        console.log('Could not find Vitest setup template. Please check your installation.');
        return;
      }
      
      // Create example test file if requested
      if (answers.createExampleTest) {
        // Ensure test directory exists
        const testDir = path.join(process.cwd(), 'src', '__tests__');
        if (!fs.existsSync(testDir)) {
          fs.mkdirSync(testDir, { recursive: true });
        }
        
        const exampleTestPath = path.join(testDir, 'example.test.tsx');
        const exampleTestTemplatePath = path.join(__dirname, '../templates/vitest/example.test.tsx');
        
        if (fileExists(exampleTestTemplatePath)) {
          const templateContent = fs.readFileSync(exampleTestTemplatePath, 'utf8');
          writeToFile(exampleTestPath, templateContent);
          console.log('Created example test file in src/__tests__/example.test.tsx');
        } else {
          console.log('Could not find example test template. Please check your installation.');
        }
      }
      
      // Add test scripts to package.json
      const scripts = {
        'test': 'vitest run',
        'test:watch': 'vitest',
        'test:ui': 'vitest --ui',
        'test:coverage': 'vitest run --coverage'
      };
      
      updatePackageJsonScripts(scripts);
      console.log('Added test scripts to package.json');
      
      console.log('\n✅ Vitest setup complete!');
      console.log('\nYou can now run tests with:');
      console.log('  pnpm test           - Run tests once');
      console.log('  pnpm test:watch     - Run tests in watch mode');
      console.log('  pnpm test:coverage  - Run tests with coverage report');
      
      console.log('\nFor UI mode, you\'ll need to install @vitest/ui:');
      console.log('  pnpm add -D @vitest/ui');
      console.log('Then run:');
      console.log('  pnpm test:ui');
      
    } catch (error) {
      console.error('Error during Vitest setup:', error.message);
    }
  } else {
    console.log('Skipping Vitest installation.');
  }
}

module.exports = {
  command: 'vitest',
  description: 'Configure Vitest for testing',
  action: configureVitest
};
