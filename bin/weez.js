#!/usr/bin/env node

const { Command } = require('commander');
const packageJson = require('../package.json');
const { displayBanner } = require('../src/utils/banner');
const commands = require('../src/commands');

// Initialize CLI
async function initCLI() {
  // Display banner
  await displayBanner();

  const program = new Command();

  program
    .name('weez')
    .description('A scaffolding CLI tool for frontend projects')
    .version(packageJson.version, '-V, --version', 'output the version number')
    .option('-v', 'output the version number', () => {
      console.log(packageJson.version);
      process.exit(0);
    })
    .addHelpText('after', 
  `

Documentation: https://github.com/TraceRicochet/weez-cli
Repository: https://github.com/TraceRicochet/weez-cli
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
