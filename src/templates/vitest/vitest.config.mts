// @ts-nocheck

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    css: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8', // or 'istanbul'
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        '.next/**',
        'public/**',
        'styles/**',
        'coverage/**',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        'vitest.config.{ts,mts}'
      ],
      include: [
        'src/**/*.{ts,tsx}'
      ],
      all: true,
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
      // Enable these options to ensure coverage is visible in UI
      enabled: true,
      clean: true
    },
    ui: {
      // Enable coverage in UI
      coverage: {
        enabled: true
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
