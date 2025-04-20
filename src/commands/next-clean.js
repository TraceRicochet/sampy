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

    // Determine if the project uses the app directory
    let appDirExists = fs.existsSync(path.join(process.cwd(), 'app'));
    let pagesDirExists = fs.existsSync(path.join(process.cwd(), 'pages'));
    
    if (!appDirExists && !pagesDirExists) {
      console.log(chalk.red('Could not find "app" or "pages" directory. Make sure this is a Next.js project.'));
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
      
      if (appDirExists) {
        globalCssPath = path.join(process.cwd(), 'app', 'globals.css');
        if (!fileExists(globalCssPath)) {
          globalCssPath = path.join(process.cwd(), 'app', 'global.css');
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
          minimalCss = fs.readFileSync(templatePath, 'utf8');
          console.log('Using template CSS from templates/nextjs/globals.css');
        } else {
          // Fallback to a basic template if the file doesn't exist
          minimalCss = `@import "tailwindcss";

:root {
  --foreground: #000;
  --background: #fff;
  --scrollbar-thumb: #888;
  --scrollbar-track: #f1f1f1;
  --primary: #0070f3;
}

.dark {
  --foreground: #fff;
  --background: #000;
  --scrollbar-thumb: #555;
  --scrollbar-track: #333;
  --primary: #3291ff;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* * {
  zoom: 0.995;
} */

body {
  scrollbar-width: thin; 
  scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
}

::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--primary);
}`;
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
      
      if (appDirExists) {
        mainPagePath = path.join(process.cwd(), 'app', 'page.tsx');
        if (!fileExists(mainPagePath)) {
          mainPagePath = path.join(process.cwd(), 'app', 'page.jsx');
        }
        if (!fileExists(mainPagePath)) {
          mainPagePath = path.join(process.cwd(), 'app', 'page.js');
        }
      } else {
        mainPagePath = path.join(process.cwd(), 'pages', 'index.tsx');
        if (!fileExists(mainPagePath)) {
          mainPagePath = path.join(process.cwd(), 'pages', 'index.jsx');
        }
        if (!fileExists(mainPagePath)) {
          mainPagePath = path.join(process.cwd(), 'pages', 'index.js');
        }
      }

      if (fileExists(mainPagePath)) {
        // Create a simple starting page component
        const simplePageComponent = `export default function Home () {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold">Let's do this</h1>
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
