const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite's web implementation (wa-sqlite) ships a .wasm binary; without
// this, Metro tries to parse it as JS when bundling for the web platform.
config.resolver.assetExts.push('wasm');

module.exports = config;
