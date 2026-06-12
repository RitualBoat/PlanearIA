module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // unstable_transformImportMeta: pdfjs-dist uses `import.meta`, which the
      // Hermes engine cannot parse when bundling the standalone Android APK.
      // This polyfill rewrites it so the release build succeeds.
      ['babel-preset-expo', { unstable_transformImportMeta: true }],
    ],
  };
};
