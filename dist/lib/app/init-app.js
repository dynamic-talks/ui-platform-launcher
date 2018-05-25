'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initSingleApp = initSingleApp;
exports.initMultipleApps = initMultipleApps;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _httpErrors = require('http-errors');

var _httpErrors2 = _interopRequireDefault(_httpErrors);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _mutipleAppsSettings = require('ui-platform-core/dist/lib/path-resolvers/mutiple-apps-settings.resolver');

var _uiRouter = require('../router/ui-router.factory');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Configure supplied express server with set of apps (micro-sites) provided in `appsParams` list
 *
 * @param {Object} app - instance of Express server
 * @param {Array} appsParams - set of setting for each app
 * @returns {express}
 */
function configureExpressApp(app, appsParams) {
  app.use(_express2.default.json());
  app.use(_express2.default.urlencoded({ extended: false }));

  // add static middleware with each `public` app folder
  appsParams.forEach(function (_ref) {
    var rootDir = _ref.rootDir;

    app.use(_express2.default.static(_path2.default.join(rootDir, 'public')));
  });

  // initialize app pages
  appsParams.forEach(function (_ref2) {
    var rootDir = _ref2.rootDir,
        name = _ref2.name,
        version = _ref2.version,
        configPath = _ref2.configPath;

    var baseYamlConfigPath = _path2.default.join(rootDir, 'config', 'base.yaml');
    var baseJsonConfigPath = _path2.default.join(rootDir, 'config', 'base.json');
    var baseConfigPath = void 0;

    // decide which base config file use in `YAML` or `JSON` format
    // `YAML` has precedence over `JSON`
    if (_fs2.default.existsSync(baseYamlConfigPath)) {
      baseConfigPath = baseYamlConfigPath;
    } else if (_fs2.default.existsSync(baseJsonConfigPath)) {
      baseConfigPath = baseJsonConfigPath;
    } else {
      throw new Error('Base configuration file isn\'t found in "' + _path2.default.join(rootDir, 'config') + '", in both formats: YAML and JSON');
    }

    // todo: think about better solution

    var _require = require(rootDir + '/node_modules/ui-platform-core/dist/lib/ui-application/server.ioc-container'),
        createServerIocContainer = _require.createServerIocContainer;

    var absConfigPath = void 0;

    if (configPath) {
      absConfigPath = _path2.default.join(rootDir, configPath);
    } else {
      absConfigPath = baseConfigPath;
    }

    // initialize root IoC container
    var iocContainer = createServerIocContainer({
      configPath: absConfigPath,
      // todo: `build-manifest.json` name is hardcored, should be configured somehow
      assetsManifestPath: _path2.default.join(rootDir, 'build-manifest.json'),
      baseConfigPath: baseConfigPath
    });

    var namespace = name ? '/' + name : '/';

    app.use(namespace, (0, _uiRouter.uiRouterFactory)({
      rootDir: rootDir,
      iocContainer: iocContainer
    }));
  });

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next((0, _httpErrors2.default)(404));
  });

  // error handler
  app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json(err);
    console.error(err);
  });

  return app;
}

/**
 * Initial single app (Micro-site)
 *
 * @param {String} rootDir
 * @param {String} version
 * @param {String} configPath
 * @returns {express}
 */
function initSingleApp(_ref3) {
  var rootDir = _ref3.rootDir,
      version = _ref3.version,
      configPath = _ref3.configPath;

  return configureExpressApp((0, _express2.default)(), [{ rootDir: rootDir, version: version, configPath: configPath }]);
}

/**
 * Initialize set of apps (Micro-sites), which set of artifact folders placed in supplied `appsPath`
 *
 * @param {String} appsPath
 * @returns {express}
 */
function initMultipleApps(_ref4) {
  var appsPath = _ref4.appsPath;

  return configureExpressApp((0, _express2.default)(), (0, _mutipleAppsSettings.resolveMultipleAppsSettings)(appsPath));
}