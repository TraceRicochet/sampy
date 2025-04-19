const prettierCommand = require('./prettier');
const eslintCommand = require('./eslint');
const nextjsCleanCommand = require('./next-clean');

/**
 * Registers all commands with the Commander program
 * @param {Object} program - Commander program instance
 */
function registerCommands(program) {
  // Register each command
  const commands = [
    prettierCommand,
    eslintCommand,
    nextjsCleanCommand
    // Add new commands here as they are created
  ];

  commands.forEach(cmd => {
    program
      .command(cmd.command)
      .description(cmd.description)
      .action(cmd.action);
  });
}

module.exports = {
  registerCommands
};
