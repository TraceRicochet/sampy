const fs = require('fs');
const path = require('path');

/**
 * Checks if a file exists at the given path
 * @param {string} filePath - Path to check
 * @returns {boolean} - True if file exists, false otherwise
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Creates a directory if it doesn't exist
 * @param {string} dirPath - Directory path to create
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Writes content to a file
 * @param {string} filePath - Path to write to
 * @param {string|object} content - Content to write (string or object to be stringified)
 * @param {boolean} isJson - Whether to stringify the content as JSON
 */
function writeToFile(filePath, content, isJson = false) {
  const fileContent = isJson ? JSON.stringify(content, null, 2) : content;
  fs.writeFileSync(filePath, fileContent, 'utf8');
}

/**
 * Reads content from a file
 * @param {string} filePath - Path to read from
 * @param {boolean} isJson - Whether to parse the content as JSON
 * @returns {string|object} - File content as string or parsed JSON
 */
function readFromFile(filePath, isJson = false) {
  if (!fileExists(filePath)) {
    return isJson ? {} : '';
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  return isJson ? JSON.parse(content) : content;
}

module.exports = {
  fileExists,
  ensureDirectoryExists,
  writeToFile,
  readFromFile
};
