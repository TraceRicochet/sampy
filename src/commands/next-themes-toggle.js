const path = require('path');
const fs = require('fs');
const shell = require('shelljs');
const { spawn } = require('child_process');
const { fileExists, writeToFile, ensureDirectoryExists } = require('../utils/file');
const { installDevDependencies } = require('../utils/npm');

/**
 * Configures next-themes with a shadcn/ui theme toggle for a Next.js project
 */
async function configureNextThemes() {
  console.log('Configuring next-themes...');
  const inquirer = await import('inquirer');
  
  const answers = await inquirer.default.prompt([
    {
      type: 'confirm',
      name: 'installShadcn',
      message: 'Do you want to install shadcn/ui and next-themes?',
      default: true
    }
  ]);

  if (answers.installShadcn) {
    // Check if this is a Next.js project
    const pkgJsonPath = path.join(process.cwd(), 'package.json');
    if (!fileExists(pkgJsonPath)) {
      console.log('Could not find package.json in current directory. Make sure you are in a Next.js project.');
      return;
    }

    try {
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
      const hasNextjs = pkgJson.dependencies && (pkgJson.dependencies.next || pkgJson.devDependencies?.next);
      
      if (!hasNextjs) {
        console.log('This does not appear to be a Next.js project. shadcn/ui requires Next.js.');
        const continueAnyway = await inquirer.default.prompt([
          {
            type: 'confirm',
            name: 'continue',
            message: 'Continue anyway?',
            default: false
          }
        ]);
        
        if (!continueAnyway.continue) {
          console.log('Aborting shadcn/ui installation.');
          return;
        }
      }
      
      // Install next-themes
      console.log('Installing next-themes...');
      const nextThemesSuccess = installDevDependencies(['next-themes', 'tw-animate-css']);
      
      if (nextThemesSuccess) {
        console.log('next-themes installed successfully!');
      } else {
        console.log('Failed to install next-themes. Please check your npm configuration.');
        return;
      }
      
      // Initialize shadcn/ui
      console.log('Initializing shadcn/ui...');
      try {
        await runInteractiveCommand('pnpm', ['dlx', 'shadcn@latest', 'init']);
        
        // Install required shadcn components (button and dropdown-menu)
        console.log('\nInstalling shadcn/ui button component...');
        await runInteractiveCommand('pnpm', ['dlx', 'shadcn@latest', 'add', 'button']);
        
        console.log('\nInstalling shadcn/ui dropdown-menu component...');
        await runInteractiveCommand('pnpm', ['dlx', 'shadcn@latest', 'add', 'dropdown-menu']);
      } catch (error) {
        console.error('Error during shadcn installation:', error.message);
        return;
      }
      
      // Create theme provider and toggle components
      createThemeComponents();

      // Update globals.css
      console.log('Updating globals.css...');

      const templatePath = path.join(__dirname, '../templates/nextjs/globals.css');
      let minimalCss;

      // Prepare the CSS content based on the template or fallback
      if (fileExists(templatePath)) {
        minimalCss = fs.readFileSync(templatePath, 'utf8');
        console.log('Using template CSS from templates/nextjs/globals.css');
      } else {
        // Fallback to a basic template if the file doesn't exist
        minimalCss = `@import "tailwindcss";`;
        console.log('Could not find CSS template, using basic fallback');
      }
      // Add instructions for next steps
      console.log('\n✅ shadcn/ui and next-themes setup complete!');
      console.log('\n --------------- Next steps ---------------\n');
      console.log('1. Add suppressHydrationWarning to your root layout.tsx <html> tag:');
      console.log(`
    <html lang="en" suppressHydrationWarning>`);
    console.log('\n2. Add the ThemeProvider inside your root layout.tsx <body> tag:');
    console.log(`
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    `);
      console.log('\n3. Use the ModeToggle component in your navbar or header:');
      console.log(`
import { ModeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header>
      <ModeToggle />
    </header>
  );
}`);
      
    } catch (error) {
      console.error('Error during shadcn/ui setup:', error.message);
    }
  } else {
    console.log('Skipping shadcn/ui and next-themes installation.');
  }
}

/**
 * Creates theme provider and toggle components
 */
function createThemeComponents() {
  const componentsDir = path.join(process.cwd(), 'components');
  ensureDirectoryExists(componentsDir);
  
  // Create theme-provider.tsx
  const themeProviderPath = path.join(componentsDir, 'theme-provider.tsx');
  const themeProviderContent = `'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import * as React from 'react';

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
`;
  
  // Create theme-toggle.tsx
  const themeTogglePath = path.join(componentsDir, 'theme-toggle.tsx');
  const themeToggleContent = `'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
`;
  
  writeToFile(themeProviderPath, themeProviderContent);
  console.log('Created theme-provider.tsx');
  
  writeToFile(themeTogglePath, themeToggleContent);
  console.log('Created theme-toggle.tsx');
}

/**
 * Runs a command with interactive input support
 * @param {string} command - The command to run
 * @param {string[]} args - Command arguments
 * @returns {Promise<void>}
 */
function runInteractiveCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit', // This is key for interactive prompts
      shell: true
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command exited with code ${code}`));
      }
    });
    
    child.on('error', (err) => {
      reject(err);
    });
  });
}

module.exports = {
  command: 'next-themes',
  description: 'Configure next-themes with a shadcn/ui theme toggle for a Next.js project',
  action: configureNextThemes
};
