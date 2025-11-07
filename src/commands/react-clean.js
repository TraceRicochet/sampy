const path = require('path');
const fs = require('fs');
const { fileExists, writeToFile } = require('../utils/file');

/**
 * Cleans up boilerplate from a Vite React application
 */
async function cleanReactBoilerplate() {
  const inquirer = await import('inquirer');
  const chalk = (await import('chalk')).default;

  console.log('Cleaning up Vite React boilerplate...');

  // Skip prompt if running from install command
  let cleanBoilerplate = true;
  if (!process.env.SAMPY_AUTO_CONFIRM) {
    const answers = await inquirer.default.prompt([
      {
        type: 'confirm',
        name: 'cleanBoilerplate',
        message: 'Do you want to clean up the default Vite React boilerplate?',
        default: true
      }
    ]);
    cleanBoilerplate = answers.cleanBoilerplate;
  }

  if (!cleanBoilerplate) {
    console.log('Cancelled React cleanup.');
    return;
  }

  try {
    // Files to clean up
    const filesToClean = [
      'src/App.css',
      'src/index.css'
    ];

    // Clean CSS files
    for (const file of filesToClean) {
      const filePath = path.join(process.cwd(), file);
      if (fileExists(filePath)) {
        writeToFile(filePath, '');
        console.log(chalk.green(`Cleared ${file}`));
      }
    }

    // Clean up App component
    const appFiles = [
      'src/App.tsx',
      'src/App.jsx'
    ];

    let appFilePath = null;
    for (const file of appFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fileExists(filePath)) {
        appFilePath = filePath;
        break;
      }
    }

    if (appFilePath) {
      const isTypeScript = appFilePath.endsWith('.tsx');
      
      // Create a simple starting App component
      const simpleAppComponent = `${isTypeScript ? '' : ''}function App() {
  return (
    <main className="p-6 bg-black h-screen">
      <h1 className="text-3xl font-bold p-6 bg-gradient-to-r from-violet-700 to-blue-500 rounded-xl text-white shadow-2xl">
        Let&apos;s do this
      </h1>
    </main>
  );
}

export default App;
`;

      writeToFile(appFilePath, simpleAppComponent);
      console.log(chalk.green(`Simplified ${path.relative(process.cwd(), appFilePath)}`));
    } else {
      console.log(chalk.yellow('Could not find App.tsx or App.jsx to simplify.'));
    }

    // Clean up assets directory (remove default Vite assets)
    const assetsDir = path.join(process.cwd(), 'src/assets');
    if (fs.existsSync(assetsDir)) {
      const assetFiles = [
        'react.svg',
        'vite.svg'
      ];

      for (const file of assetFiles) {
        const filePath = path.join(assetsDir, file);
        if (fileExists(filePath)) {
          fs.unlinkSync(filePath);
          console.log(chalk.green(`Removed src/assets/${file}`));
        }
      }
    }

    // Clean up public directory default assets
    const publicDir = path.join(process.cwd(), 'public');
    if (fs.existsSync(publicDir)) {
      const publicFiles = [
        'vite.svg'
      ];

      for (const file of publicFiles) {
        const filePath = path.join(publicDir, file);
        if (fileExists(filePath)) {
          fs.unlinkSync(filePath);
          console.log(chalk.green(`Removed public/${file}`));
        }
      }
    }

    console.log(chalk.green('Vite React boilerplate cleanup complete!'));
    console.log(chalk.yellow('Note: You may want to run `sampy tailwind-react` to add Tailwind CSS for the styling to work properly.'));
  } catch (error) {
    console.error('Error cleaning up React boilerplate:', error);
  }
}

module.exports = {
  command: 'react-clean',
  description: 'Clean up boilerplate from a Vite React application',
  action: cleanReactBoilerplate
};
