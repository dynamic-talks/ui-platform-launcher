const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const {
  BUILD_MANIFEST_FILENAME,
  PUBLIC_PATH
} = require('./manifest-config');

module.exports = (coreConfig) => {
  const styleLoadersRule = coreConfig.module.rules.find(rule => rule.use && rule.use[0] === 'style-loader');
  // Add ExtractTextPlugin for styles
  const styleExtractFile = new MiniCssExtractPlugin({
    filename: '[name].[hash].css',
    chunkFilename: '[id].[hash].css'
  });

  coreConfig.plugins.push(
    styleExtractFile,

    new ManifestPlugin({
      fileName: BUILD_MANIFEST_FILENAME,
      basePath: PUBLIC_PATH,
      stripSrc: true
    })
  );

  styleLoadersRule.use[0] = MiniCssExtractPlugin.loader;

  return coreConfig;
};
