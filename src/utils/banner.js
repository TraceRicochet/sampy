/**
 * Displays the CLI banner with ASCII art
 */
async function displayBanner() {
  // Handle both ESM and CommonJS versions of chalk
  let chalk;
  try {
    // Try CommonJS first
    chalk = require('chalk');
  } catch (error) {
    // Fall back to ESM if CommonJS fails
    if (error.code === 'ERR_REQUIRE_ESM') {
      chalk = (await import('chalk')).default;
    } else {
      throw error;
    }
  }
  
  console.log(chalk.cyan(`
███████  █████  ███    ███ ██████  ██    ██ 
██      ██   ██ ████  ████ ██   ██  ██  ██  
███████ ███████ ██ ████ ██ ██████    ████   
     ██ ██   ██ ██  ██  ██ ██         ██    
███████ ██   ██ ██      ██ ██         ██  
                                                                
`));

  console.log(chalk.cyan("Sampy: Projects setup in a breeze") + chalk.red(" 🌴") + "\n");
}

module.exports = {
  displayBanner
};
