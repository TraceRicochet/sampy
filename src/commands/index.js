const prettierCommand = require('./prettier');
const eslintNextCommand = require('./eslint-next');
const eslintReactCommand = require('./eslint-react');
const installCommand = require('./install');
const nextjsCleanCommand = require('./next-clean');
const nextThemesToggleCommand = require('./next-themes-toggle');
const reactCleanCommand = require('./react-clean');
const commitlintCommand = require('./commitlint');
const changelogCommand = require('./changelogen');
const vitestCommand = require('./vitest');
const zustandCommand = require('./zustand');
const tailwindNextCommand = require('./tailwind-next');
const tailwindReactCommand = require('./tailwind-react');
const shadcnNextCommand = require('./shadcn-next');
const shadcnReactCommand = require('./shadcn-react');

/**
 * Registers all commands with the Commander program
 * @param {Object} program - Commander program instance
 */
function registerCommands(program) {
  // Register each command (alphabetically ordered)
  const commands = [
    changelogCommand,
    commitlintCommand,
    eslintNextCommand,
    eslintReactCommand,
    installCommand,
    nextjsCleanCommand,
    nextThemesToggleCommand,
    prettierCommand,
    reactCleanCommand,
    shadcnNextCommand,
    shadcnReactCommand,
    tailwindNextCommand,
    tailwindReactCommand,
    vitestCommand,
    zustandCommand
    // Add new commands here in alphabetical order
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
