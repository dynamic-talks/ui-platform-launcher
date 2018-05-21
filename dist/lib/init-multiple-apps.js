'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var appsPath = _ref.appsPath;

  var app = (0, _express2.default)();
  var appSettings = (0, _mutipleAppsSettings.resolveMultipleAppsSettings)(appsPath);

  app.use(_express2.default.json());
  app.use(_express2.default.urlencoded({ extended: false }));

  // add static middleware with each `public` app folder
  appSettings.forEach(function (_ref2) {
    var rootPath = _ref2.rootPath;

    app.use(_express2.default.static(_path2.default.join(rootPath, 'public')));
  });

  // initialize app pages
  appSettings.forEach(function (_ref3) {
    var rootPath = _ref3.rootPath,
        name = _ref3.name,
        version = _ref3.version,
        params = _ref3.params;

    var baseConfigPath = _path2.default.join(rootPath, 'config', 'base.yaml');
    var configPath = params.configPath,
        assetsManifestPath = params.assetsManifestPath;

    var absConfigPath = void 0;

    if (configPath) {
      absConfigPath = _path2.default.join(rootPath, configPath);
    } else {
      absConfigPath = baseConfigPath;
    }

    // initialize root IoC container
    var iocContainer = (0, _server.createServerIocContainer)({
      configPath: absConfigPath,
      baseConfigPath: baseConfigPath,
      assetsManifestPath: assetsManifestPath
    });

    app.use('/' + name, (0, _uiRouter.uiRouterFactory)({
      rootDir: rootPath,
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
};

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _httpErrors = require('http-errors');

var _httpErrors2 = _interopRequireDefault(_httpErrors);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _server = require('ui-platform-core/dist/lib/ui-application/server.ioc-container');

var _mutipleAppsSettings = require('ui-platform-core/dist/lib/path-resolvers/mutiple-apps-settings.resolver');

var _uiRouter = require('./router/ui-router.factory');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }