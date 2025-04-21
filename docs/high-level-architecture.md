# High-Level Architecture of Sampy

The application follows a modular architecture typical of Node.js CLI tools:

## 1. Entry Point: bin/sampy.js

This is the actual executable that runs when a user types `sampy` in their terminal. Despite looking simple, it's crucial because:

- It has the shebang line (`#!/usr/bin/env node`) that tells the system to execute it with Node.js
- It's referenced in your package.json's `bin` field, which is what makes the `sampy` command available
- It imports and initializes the core components of your application
- It sets up the Commander.js framework which handles command-line parsing

## 2. Command Registration: src/commands/index.js

This file acts as a registry for all available commands:

- It imports each individual command module (prettier.js, eslint.js, etc.)
- It provides a `registerCommands` function that takes a Commander program instance
- It registers each command with Commander, making them available as CLI commands

## 3. Individual Command Modules: src/commands/*.js

Each command is defined in its own module (e.g., `src/commands/prettier.js`):

- Each module exports an object with:
  - `command`: The name of the command (e.g., "prettier")
  - `description`: Help text for the command
  - `action`: The function that runs when the command is invoked

## 4. Utility Modules: src/utils/*.js

These provide shared functionality used across different commands:

- `banner.js`: Displays the ASCII art banner
- `file.js`: File operations (reading, writing, checking existence)
- `npm.js`: Package.json operations and dependency installation (using `pnpm`)

## 5. Templates: src/templates/

These are template files that get copied to the user's project when they run a command. Templates are organized by command name (e.g., `src/templates/prettier/`, `src/templates/vitest/`).

## The Flow of Execution

When a user runs `sampy prettier`, this is what happens:

1. The system executes `bin/sampy.js` due to the package.json `bin` configuration
2. `bin/sampy.js` displays the banner and sets up the Commander program
3. It imports `src/commands/index.js` which registers all available commands
4. Commander parses the arguments (`prettier`) and executes the corresponding action
5. The action function in `src/commands/prettier.js` runs, which:
   - Prompts the user for configuration options
   - Installs necessary dependencies using `pnpm`
   - Copies template files to the user's project
   - Updates the user's package.json with scripts

## How Commands Get Exposed

The key to exposing commands is the combination of:

1. **package.json bin field**:
```json
"bin": {
  "sampy": "bin/sampy.js"
}
```

This tells npm to create a symlink named sampy that points to bin/sampy.js when the package is installed globally or linked.

2. **Commander.js registration**:

```javascript
program
  .command(cmd.command)
  .description(cmd.description)
  .action(cmd.action);
```

This registers each command with Commander, which handles parsing and execution.

3. **Command module exports**:

```javascript
module.exports = {
  command: 'prettier',
  description: 'Configure Prettier for your project',
  action: configurePrettier
};
```

This standardized format allows src/commands/index.js to easily register all commands.

The beauty of this architecture is its modularity - adding a new command is as simple as creating a new file in `src/commands/` with the proper exports and adding it to the commands list in `src/commands/index.js`.

## Development and Testing

To test new commands during development:

1. Make changes to an existing command or create a new one in `src/commands/`
2. Update `src/commands/index.js` to include your new command
3. Run `pnpm link` in the project root to make the CLI available globally
4. Test your command by running `sampy your-command`

This workflow allows for rapid iteration and testing of new features.

## Future Improvements

- Single command to install all dependencies (sampy-stack)
- Single command to install my usual dependencies
- Command for configuring Supabase Auth
- Sentry integration for error reporting

## License

ISC
