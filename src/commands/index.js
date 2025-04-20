const prettierCommand = require('./prettier');
const eslintCommand = require('./eslint');
const nextjsCleanCommand = require('./next-clean');
const shadcnCommand = require('./shadcn');
const commitlintCommand = require('./commitlint');
const changelogCommand = require('./changelogen');
const vitestCommand = require('./vitest');

/**
 * Registers all commands with the Commander program
 * @param {Object} program - Commander program instance
 */
function registerCommands(program) {
  // Register each command
  const commands = [
    prettierCommand,
    eslintCommand,
    nextjsCleanCommand,
    shadcnCommand,
    commitlintCommand,
    changelogCommand,
    vitestCommand
    // Add new commands here
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
