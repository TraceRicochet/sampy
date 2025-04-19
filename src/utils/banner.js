/**
 * Displays the CLI banner with ASCII art
 */
async function displayBanner() {
  // Use dynamic import for chalk due to ES module compatibility
  const chalk = (await import('chalk')).default;
  
  console.log(chalk.cyan(`
██     ██ ███████ ███████ ███████ 
██     ██ ██      ██         ███  
██  █  ██ █████   █████     ███   
██ ███ ██ ██      ██       ███    
 ███ ███  ███████ ███████ ███████ 
                                                                
`));

  console.log(chalk.cyan("Weez: Projects setup in a breeze") + chalk.red(" 🌴") + "\n");
}

module.exports = {
  displayBanner
};
