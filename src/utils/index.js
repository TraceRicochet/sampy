const banner = require('./banner');
const file = require('./file');
const npm = require('./npm');

module.exports = {
  ...banner,
  ...file,
  ...npm
};
