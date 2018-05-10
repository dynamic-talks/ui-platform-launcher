'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var rootPath = _ref.rootPath,
      serverIoCFactory = _ref.serverIoCFactory;

  var args = (0, _cliArgs2.default)(process.argv.slice(2));
  var app = (0, _express2.default)();
  var baseConfigPath = _path2.default.join(rootPath, 'config', 'base.yaml');

  var configPath = void 0;

  if (args.c) {
    // TODO: we might need to give ability to pass absolute path to concrete config
    configPath = _path2.default.join(rootPath, args.c);
  } else {
    console.warn('`-c` argument with configuration filename is not passed, so default config is going to be used');

    configPath = baseConfigPath;
  }

  // initialize root IoC container
  var iocContainer = serverIoCFactory({
    baseConfigPath: baseConfigPath,
    configPath: configPath
  });

  app.use(_express2.default.json());
  app.use(_express2.default.urlencoded({ extended: false }));
  app.use(_express2.default.static(_path2.default.join(rootPath, 'public')));

  app.use('/', (0, _uiRouter.uiRouterFactory)({
    rootDir: rootPath,
    iocContainer: iocContainer
  }));

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next((0, _httpErrors2.default)(404));
  });

  // error handler
  app.use(function (err, req, res, next) {
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

var _cliArgs = require('cli-args');

var _cliArgs2 = _interopRequireDefault(_cliArgs);

var _uiRouter = require('./router/ui-router.factory');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }