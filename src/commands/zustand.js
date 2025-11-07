const path = require('path');
const fs = require('fs');
const { fileExists, ensureDirectoryExists, writeToFile } = require('../utils/file');
const { installDependencies } = require('../utils/npm');

/**
 * Configures Zustand state management for a React project
 */
async function configureZustand() {
  console.log('Setting up Zustand state management...');
  const inquirer = await import('inquirer');
  const chalk = (await import('chalk')).default;

  const answers = await inquirer.default.prompt([
    {
      type: 'confirm',
      name: 'installZustand',
      message: 'Do you want to install Zustand?',
      default: true
    },
    {
      type: 'confirm',
      name: 'createExampleStore',
      message: 'Do you want to create an example store?',
      default: true,
      when: (answers) => answers.installZustand
    },
    {
      type: 'list',
      name: 'storeLocation',
      message: 'Where would you like to create the store?',
      choices: [
        { name: 'src/store/', value: 'src/store' },
        { name: 'src/stores/', value: 'src/stores' },
        { name: 'src/lib/', value: 'src/lib' }
      ],
      default: 'src/store',
      when: (answers) => answers.installZustand && answers.createExampleStore
    }
  ]);

  if (answers.installZustand) {
    console.log('Installing Zustand...');
    const success = installDependencies(['zustand']);
    
    if (success) {
      console.log('Zustand installed successfully!');
      
      if (answers.createExampleStore) {
        // Create store directory
        const storeDir = path.join(process.cwd(), answers.storeLocation);
        ensureDirectoryExists(storeDir);
        
        // Create example store
        const storePath = path.join(storeDir, 'useCounterStore.ts');
        const templatePath = path.join(__dirname, '../templates/zustand/useCounterStore.ts');
        
        if (fileExists(templatePath)) {
          const templateContent = fs.readFileSync(templatePath, 'utf8');
          writeToFile(storePath, templateContent);
          console.log(`Created example store at ${answers.storeLocation}/useCounterStore.ts`);
        } else {
          // Fallback if template doesn't exist
          const storeContent = `import { create } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
`;
          writeToFile(storePath, storeContent);
          console.log(`Created example store at ${answers.storeLocation}/useCounterStore.ts`);
        }
        
        // Create usage example component
        const exampleComponentPath = path.join(storeDir, 'CounterExample.tsx');
        const exampleContent = `import React from 'react';
import { useCounterStore } from './useCounterStore';

export const CounterExample: React.FC = () => {
  const { count, increment, decrement, reset } = useCounterStore();

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Counter Example</h2>
      <div className="flex items-center gap-4">
        <button 
          onClick={decrement}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          -
        </button>
        <span className="text-2xl font-mono">{count}</span>
        <button 
          onClick={increment}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          +
        </button>
        <button 
          onClick={reset}
          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Reset
        </button>
      </div>
    </div>
  );
};
`;
        writeToFile(exampleComponentPath, exampleContent);
        console.log(`Created example component at ${answers.storeLocation}/CounterExample.tsx`);
        
        console.log(chalk.green('\n✅ Zustand setup complete!'));
        console.log(chalk.yellow('\nUsage:'));
        console.log(`1. Import the store: ${chalk.cyan(`import { useCounterStore } from './${answers.storeLocation}/useCounterStore';`)}`);
        console.log(`2. Use in component: ${chalk.cyan('const { count, increment } = useCounterStore();')}`);
        console.log(`3. Check out the example component: ${chalk.cyan(`${answers.storeLocation}/CounterExample.tsx`)}`);
      }
    } else {
      console.log('Failed to install Zustand. Please check your package manager configuration.');
    }
  } else {
    console.log('Skipping Zustand installation.');
  }
}

module.exports = {
  command: 'zustand',
  description: 'Set up Zustand state management with example store',
  action: configureZustand
};
