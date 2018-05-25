require('babel-register');
let webpackConfig = require('./webpack.core.config')();
const env = webpackConfig.plugins[0].definitions['process.env'].__PROD__ ? 'prod' : 'dev';

const resultConfig = require('./webpack.' + env + '.config')(webpackConfig);

module.exports = resultConfig;
