#!/usr/bin/env node

const { build } = require('esbuild');
const { copyFileSync, mkdirSync, existsSync, readdirSync, statSync, copySync } = require('fs-extra');
const path = require('path');

// Ensure the dist directory exists
if (!existsSync('dist')) {
  mkdirSync('dist');
}

// Copy templates directory
const copyTemplates = () => {
  const templatesDir = path.join(__dirname, 'src', 'templates');
  const destDir = path.join(__dirname, 'dist', 'templates');
  
  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }
  
  // Recursive function to copy directory contents
  const copyDir = (src, dest) => {
    if (!existsSync(dest)) {
      mkdirSync(dest, { recursive: true });
    }
    
    const entries = readdirSync(src);
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry);
      const destPath = path.join(dest, entry);
      
      const stat = statSync(srcPath);
      
      if (stat.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        copyFileSync(srcPath, destPath);
      }
    }
  };
  
  copyDir(templatesDir, destDir);
  console.log('✅ Templates copied successfully');
};

// Build the CLI with esbuild
const buildCli = async () => {
  try {
    // Create dist and bin directories
    const distDir = path.join(__dirname, 'dist');
    const binDir = path.join(distDir, 'bin');
    
    if (!existsSync(distDir)) {
      mkdirSync(distDir, { recursive: true });
    }
    
    if (!existsSync(binDir)) {
      mkdirSync(binDir, { recursive: true });
    }
    
    // Bundle the main module
    await build({
      entryPoints: ['src/index.js'],
      bundle: true,
      platform: 'node',
      target: 'node14',
      outfile: 'dist/index.js',
      minify: true,
      format: 'cjs',
      external: [
        // External packages that shouldn't be bundled
        'inquirer',
        'chalk',
        'commander',
        'shelljs',
        'update-notifier'
      ],
    });
    
    // Create a direct CLI entry point
    const binPath = path.join(binDir, 'weez.js');
    const binContent = `#!/usr/bin/env node

require('${path.relative(binDir, path.join(__dirname, 'bin', 'weez.js'))}');
`;
    
    // Write the bin file
    require('fs').writeFileSync(binPath, binContent);
    require('fs').chmodSync(binPath, '755'); // Make it executable
    
    console.log('✅ CLI bundled successfully');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
};

// Main build process
const main = async () => {
  console.log('🚀 Building weez-cli...');
  await buildCli();
  copyTemplates();
  console.log('✨ Build completed successfully!');
};

main();
