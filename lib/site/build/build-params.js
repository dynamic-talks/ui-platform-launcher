const path = require('path');
const cliArgs = require('cli-args');
const args = cliArgs(process.argv.slice(2));

exports.ROOT_DIR = process.cwd();
exports.PACKAGE_ROOT = path.resolve(__dirname, '..' , '..', '..');

exports.PACKAGE_NODE_MODULES_PATH = path.resolve(__dirname, '..' , '..', '..', 'node_modules');


exports.MANIFEST_FILENAME = 'build-manifest.json';
exports.PUBLIC_PATH = '';

exports.DIST_FOLDER_NAME = 'dist';
// exports.DIST_FOLDER_PATH = path.resolve(exports.ROOT_DIR, 'dist');
exports.DIST_FOLDER_PATH = './dist';
