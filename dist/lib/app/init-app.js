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
 * @returns {Promise<express>}
 */
function configureExpressApp(app, appsParams) {
  app.use(_express2.default.json());
  app.use(_express2.default.urlencoded({ extended: false }));

  // add static middleware with each `public` app folder
  appsParams.forEach(function (_ref) {
    var rootDir = _ref.rootDir;

    app.use(_express2.default.static(_path2.default.join(rootDir, 'public')));
  });

  return Promise
  // initialize configuration manager for each app
  .all(appsParams.map(function (_ref2) {
    var rootDir = _ref2.rootDir,
        appName = _ref2.appName,
        configReaderType = _ref2.configReaderType;

    var _require = require(rootDir + '/node_modules/ui-platform-core/dist/lib/configuration-manager'),
        ConfigurationManager = _require.ConfigurationManager;

    var configManager = new ConfigurationManager(rootDir);

    return configManager.initialize({ appName: appName, readerType: configReaderType });
  }))
  // As soon as config managers are ready do the rest of initialization
  .then(function (configCollection) {

    appsParams
    // merge each app params with an appropriate config
    .map(function (param, i) {
      return Object.assign({ config: configCollection[i] }, param);
    })
    // initialize app pages
    .forEach(function (_ref3) {
      var rootDir = _ref3.rootDir,
          appName = _ref3.appName,
          config = _ref3.config,
          version = _ref3.version,
          _ref3$useAppURIPrefix = _ref3.useAppURIPrefix,
          useAppURIPrefix = _ref3$useAppURIPrefix === undefined ? true : _ref3$useAppURIPrefix;

      // todo: think about better solution
      var _require2 = require(rootDir + '/node_modules/ui-platform-core/dist/lib/ui-application/server.ioc-container'),
          createServerIocContainer = _require2.createServerIocContainer;

      // initialize root IoC container


      var iocContainer = createServerIocContainer({
        // todo: `build-manifest.json` appName is hardcored, should be configured somehow
        assetsManifestPath: _path2.default.join(rootDir, 'build-manifest.json'),
        config: config
      });

      var namespace = useAppURIPrefix ? '/' + appName : '/';

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
  });
}

/**
 * Initial single app (Micro-site)
 *
 * @param {String} rootDir
 * @param {String} version
 * @param {String} appName - app appName
 * @param {String} configReaderType
 * @returns {Promise<express>}
 */
function initSingleApp(_ref4) {
  var rootDir = _ref4.rootDir,
      appName = _ref4.appName,
      version = _ref4.version,
      configReaderType = _ref4.configReaderType;

  return configureExpressApp((0, _express2.default)(), [{ appName: appName, rootDir: rootDir, version: version, configReaderType: configReaderType, useAppURIPrefix: false }]);
}

/**
 * Initialize set of apps (Micro-sites), which set of artifact folders placed in supplied `appsPath`
 *
 * @param {String} appsPath
 * @param {String} configType
 * @returns {Promise<express>}
 */
function initMultipleApps(_ref5) {
  var appsPath = _ref5.appsPath,
      configReaderType = _ref5.configReaderType;

  var appParams = (0, _mutipleAppsSettings.resolveMultipleAppsSettings)(appsPath).map(function (params) {
    return Object.assign({ configReaderType: configReaderType }, params);
  });

  return configureExpressApp((0, _express2.default)(), appParams);
}