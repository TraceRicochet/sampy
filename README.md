```
██     ██ ███████ ███████ ███████ 
██     ██ ██      ██         ███  
██  █  ██ █████   █████     ███   
██ ███ ██ ██      ██       ███    
 ███ ███  ███████ ███████ ███████ 
```

A command-line tool to scaffold frontend projects, one tool at a time. Weez helps you set up and configure development tools with minimal effort, providing a consistent and optimized setup for your projects.



> [!IMPORTANT]  
> Weez is currently in alpha and may have breaking changes.


## Features

- 🚀 **Interactive setup**: Guided installation and configuration for each tool
- 🔧 **Modern tooling**: Support for the latest versions of popular development tools
- 📦 **Zero config**: Sensible defaults with minimal configuration required
- 🎨 **Customizable**: Options to tailor configurations to your project needs
- 🔄 **Consistent**: Standardized configurations across all your projects

## Installation

> [!TIP] 
> The recommended way to install Weez is using npx or pnpm dlx. 

Using npx

```bash
npx weez prettier
```

Or using pnpm dlx:

```bash
pnpm dlx weez prettier
```

Or install globally:

```bash
# Install globally
npm install -g weez-cli

# Or with pnpm
pnpm add -g weez-cli
```



For development:

```bash
# Clone the repository
git clone https://github.com/yourusername/weez-cli.git
cd weez-cli

# Install dependencies
pnpm install

# Link for local development
pnpm link
```

## Available Commands

Weez provides the following commands to configure various tools:

### Code Formatting & Linting

```bash
# Set up Prettier with sensible defaults
weez prettier

# Configure ESLint with modern flat config (v9)
weez eslint
```

### Testing

```bash
# Set up Vitest for React testing
weez vitest
```

### Git Workflows

```bash
# Configure commitlint and husky for conventional commits
weez commitlint

# Set up changelogen for automatic changelog generation
weez changelog
```

### Next.js Utilities

```bash
# Clean up Next.js boilerplate for a cleaner starting point
weez next-clean

# Configure shadcn/ui and next-themes for your Next.js project
weez shadcn
```

## Command Details

### `weez prettier`

Configures Prettier for your project with:
- Installation of required dependencies
- Creation of .prettierrc.js with sensible defaults
- Addition of format scripts to package.json

### `weez eslint`

Sets up ESLint with the modern flat config (v9):
- Installs ESLint and related plugins
- Creates eslint.config.mjs with optimized rules
- Configures TypeScript support
- Adds lint scripts to package.json

### `weez vitest`

Configures Vitest for testing React applications:
- Installs Vitest and testing libraries
- Sets up JSDOM for component testing
- Creates configuration files with proper TypeScript support
- Adds test scripts to package.json
- Includes example tests to get started

### `weez commitlint`

Sets up commitlint and husky to enforce conventional commits:
- Installs commitlint and husky
- Configures commit message validation
- Sets up Git hooks for automated validation

### `weez changelog`

Configures changelogen for automatic changelog generation:
- Installs changelogen
- Creates configuration for changelog format
- Adds scripts to generate changelogs from commits

### `weez next-clean`

Cleans up Next.js boilerplate code:
- Simplifies global CSS with modern variables
- Replaces complex starter page with minimal template
- Optimizes for a cleaner starting point

### `weez shadcn`

Configures shadcn/ui and next-themes for Next.js projects:
- Sets up component library integration
- Configures dark mode support
- Adds necessary dependencies and configurations

## Development

To contribute to Weez CLI:

```bash
# Clone the repository
git clone https://github.com/yourusername/weez-cli.git
cd weez-cli

# Install dependencies
pnpm install

# Link for local development
pnpm link
```

## License

ISC
