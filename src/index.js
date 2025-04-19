/**
 * Main entry point for weez-cli functionality
 * This file exports all the necessary modules for the CLI to function
 */

const commands = require('./commands');
const utils = require('./utils');

module.exports = {
  commands,
  utils
};
