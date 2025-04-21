const path = require('path');
const shell = require('shelljs');
const { fileExists, readFromFile, writeToFile } = require('./file');

/**
 * Installs npm packages as dev dependencies
 * @param {string|string[]} packages - Package(s) to install
 * @returns {boolean} - True if installation was successful
 */
function installDevDependencies(packages) {
  const packageList = Array.isArray(packages) ? packages.join(' ') : packages;
  // Use pnpm-specific flags
  // --prefer-offline to speed up installations when possible
  const result = shell.exec(`pnpm add -D ${packageList} --prefer-offline`);
  return result.code === 0;
}

/**
 * Updates package.json scripts
 * @param {Object} scripts - Scripts to add/update
 * @returns {boolean} - True if update was successful
 */
function updatePackageJsonScripts(scripts) {
  const pkgJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!fileExists(pkgJsonPath)) {
    console.log('Could not find package.json in current directory. Scripts not added.');
    return false;
  }
  
  try {
    const pkgJson = readFromFile(pkgJsonPath, true);
    pkgJson.scripts = pkgJson.scripts || {};
    
    // Add/update scripts
    Object.assign(pkgJson.scripts, scripts);
    
    // Write back to package.json
    writeToFile(pkgJsonPath, pkgJson, true);
    console.log('Updated scripts in package.json');
    return true;
  } catch (error) {
    console.error('Error updating package.json:', error.message);
    return false;
  }
}

module.exports = {
  installDevDependencies,
  updatePackageJsonScripts
};
