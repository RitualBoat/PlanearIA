const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  // Mammoth references `require("underscore")`; Metro can fail with package exports resolution.
  underscore: path.resolve(__dirname, "node_modules/underscore/underscore-umd.js"),
};

module.exports = config;
