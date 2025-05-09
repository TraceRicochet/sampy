const path = require('path');
const fs = require('fs');
const { fileExists, writeToFile, readFromFile } = require('../utils/file');

/**
 * Cleans up boilerplate from a Next.js application
 */
async function cleanNextjsBoilerplate() {
  console.log('Cleaning up Next.js boilerplate...');
  const inquirer = await import('inquirer');
  const chalk = (await import('chalk')).default;

  // Check if this is a Next.js project
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fileExists(packageJsonPath)) {
    console.log(chalk.red('No package.json found in the current directory. Make sure you are in a Next.js project.'));
    return;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (!packageJson.dependencies || !packageJson.dependencies.next) {
      console.log(chalk.yellow('This does not appear to be a Next.js project. No "next" dependency found in package.json.'));
      const continueAnswer = await inquirer.default.prompt([
        {
          type: 'confirm',
          name: 'continue',
          message: 'Continue anyway?',
          default: false
        }
      ]);
      
      if (!continueAnswer.continue) {
        console.log('Operation cancelled.');
        return;
      }
    }

    // Determine if the project uses the app or pages directory, including inside src
    let appDir = null;
    let pagesDir = null;
    if (fs.existsSync(path.join(process.cwd(), 'app'))) {
      appDir = path.join(process.cwd(), 'app');
    } else if (fs.existsSync(path.join(process.cwd(), 'src', 'app'))) {
      appDir = path.join(process.cwd(), 'src', 'app');
    }
    if (fs.existsSync(path.join(process.cwd(), 'pages'))) {
      pagesDir = path.join(process.cwd(), 'pages');
    } else if (fs.existsSync(path.join(process.cwd(), 'src', 'pages'))) {
      pagesDir = path.join(process.cwd(), 'src', 'pages');
    }
    if (!appDir && !pagesDir) {
      console.log(chalk.red('Could not find "app" or "pages" directory in root or src. Make sure this is a Next.js project.'));
      return;
    }

    const answers = await inquirer.default.prompt([
      {
        type: 'confirm',
        name: 'clearGlobalCss',
        message: 'Clear out global.css file?',
        default: true
      },
      {
        type: 'confirm',
        name: 'simplifyMainPage',
        message: 'Replace the main page with a basic component?',
        default: true
      }
    ]);

    // Clear global.css
    if (answers.clearGlobalCss) {
      let globalCssPath;
      
      if (appDir) {
        globalCssPath = path.join(appDir, 'globals.css');
        if (!fileExists(globalCssPath)) {
          globalCssPath = path.join(appDir, 'global.css');
        }
      } else {
        globalCssPath = path.join(process.cwd(), 'styles', 'globals.css');
        if (!fileExists(globalCssPath)) {
          globalCssPath = path.join(process.cwd(), 'styles', 'global.css');
        }
      }

      if (fileExists(globalCssPath)) {
        // Read the CSS template from the templates directory
        const templatePath = path.join(__dirname, '../templates/nextjs/globals.css');
        let minimalCss;
        
        // Prepare the CSS content based on the template or fallback
        if (fileExists(templatePath)) {
          // minimalCss = fs.readFileSync(templatePath, 'utf8');
          minimalCss = `@import "tailwindcss";`;
          console.log('Using template CSS from templates/nextjs/globals.css');
        } else {
          // Fallback to a basic template if the file doesn't exist
          minimalCss = `@import "tailwindcss";`;
          console.log('Could not find CSS template, using basic fallback');
        }
        writeToFile(globalCssPath, minimalCss);
        console.log(chalk.green(`Cleaned up ${globalCssPath}`));
      } else {
        console.log(chalk.yellow('Could not find global CSS file to clean up.'));
      }
    }

    // Simplify main page
    if (answers.simplifyMainPage) {
      let mainPagePath;
      if (appDir) {
        mainPagePath = path.join(appDir, 'page.tsx');
        if (!fileExists(mainPagePath)) {
          mainPagePath = path.join(appDir, 'page.jsx');
        }
        if (!fileExists(mainPagePath)) {
          mainPagePath = path.join(appDir, 'page.js');
        }
      } else if (pagesDir) {
        mainPagePath = path.join(pagesDir, 'index.tsx');
        if (!fileExists(mainPagePath)) {
          mainPagePath = path.join(pagesDir, 'index.jsx');
        }
        if (!fileExists(mainPagePath)) {
          mainPagePath = path.join(pagesDir, 'index.js');
        }
      }

      if (fileExists(mainPagePath)) {
        // Create a simple starting page component
        const simplePageComponent = `export default function Home () {
  return (
    <main className="p-6 bg-black h-screen">
      <h1 className="text-3xl font-bold p-6 bg-gradient-to-r from-violet-700 to-blue-500 rounded-xl text-white shadow-2xl">
        Let&apos;s do this
      </h1>
    </main>
  );
}
`;
        writeToFile(mainPagePath, simplePageComponent);
        console.log(chalk.green(`Simplified ${mainPagePath}`));
      } else {
        console.log(chalk.yellow('Could not find main page file to simplify.'));
      }
    }

    console.log(chalk.green('Next.js boilerplate cleanup complete!'));
  } catch (error) {
    console.error('Error cleaning up Next.js boilerplate:', error);
  }
}

module.exports = {
  command: 'next-clean',
  description: 'Clean up boilerplate from a Next.js application',
  action: cleanNextjsBoilerplate
};
