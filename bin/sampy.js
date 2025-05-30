#!/usr/bin/env node

const { Command } = require('commander');
const packageJson = require('../package.json');
const { displayBanner } = require('../src/utils/banner');
const commands = require('../src/commands');

// Initialize CLI
async function initCLI() {
  // Check for updates using dynamic import for ESM compatibility
  try {
    const { default: updateNotifier } = await import('update-notifier');
    const notifier = updateNotifier({
      pkg: packageJson,
      updateCheckInterval: 1000 * 60 * 60 * 24 // Check once a day
    });
    
    // Notify if there's an update
    if (notifier.update) {
      notifier.notify({
        message: 'Update available {currentVersion} → {latestVersion}\nRun {updateCommand} to update',
        boxenOptions: {
          padding: 1,
          margin: 1,
          align: 'center',
          borderColor: 'yellow',
          borderStyle: 'round'
        }
      });
    }
  } catch (error) {
    // Silently continue if update check fails
    console.error('Update check failed:', error);
  }
  
  // Display banner
  await displayBanner();

  const program = new Command();

  program
    .name('sampy')
    .description('A scaffolding CLI tool for frontend projects')
    .version(packageJson.version, '-V, --version', 'output the version number')
    .option('-v', 'output the version number', () => {
      console.log(packageJson.version);
      process.exit(0);
    })
    .addHelpText('after', 
  `

Documentation: https://github.com/TraceRicochet/sampy
Repository: https://github.com/TraceRicochet/sampy
  `);

  // Register all commands
  commands.registerCommands(program);

  // Parse command line arguments
  program.parse(process.argv);

  // If no arguments provided, show help
  if (process.argv.length <= 2) {
    program.help();
  }
}

// Start the CLI
initCLI();
