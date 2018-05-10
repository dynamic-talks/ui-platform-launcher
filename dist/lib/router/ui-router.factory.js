'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uiRouterFactory = undefined;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _clientApp = require('./client-app.middleware');

var _defaultUiRouteHandler = require('./default-ui-route-handler');

var _defaultUiRouteHandler2 = _interopRequireDefault(_defaultUiRouteHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function resolvePagesSettings(rootDir) {
  var cwd = _path2.default.join(rootDir, 'src', 'ui');
  return {
    cwd: cwd,
    routes: glob.sync('**/*.page.js', { cwd: cwd }).map(function (pagePath) {
      var dirPath = _path2.default.dirname(pagePath, '.page.js');
      var name = _path2.default.basename(pagePath, '.page.js');
      var routePath = _path2.default.join(dirPath, name + '.route.js');
      var clientPath = _path2.default.join(dirPath, name + '.client.js');
      var dirPieces = dirPath.replace(/^\./, '').split('/');
      var namespace = dirPieces;

      if (namespace[namespace.length - 1] !== name) {
        namespace.push(name);
      }

      return {
        name: name,
        namespace: namespace.join('.'),
        routePath: routePath,
        pagePath: pagePath,
        clientPath: clientPath,
        dirPath: dirPath,
        dirPieces: dirPieces
      };
    })
  };
}

var uiRouterFactory = exports.uiRouterFactory = function uiRouterFactory(_ref) {
  var rootDir = _ref.rootDir,
      iocContainer = _ref.iocContainer;

  var _resolvePagesSettings = resolvePagesSettings(rootDir),
      cwd = _resolvePagesSettings.cwd,
      routes = _resolvePagesSettings.routes;

  var uiRouter = _express2.default.Router();

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = routes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var routeConfig = _step.value;
      var routePath = routeConfig.routePath,
          dirPieces = routeConfig.dirPieces;

      var pageRouter = _express2.default.Router();

      var routeFullPath = _path2.default.join(cwd, routePath);
      var setRouteHandler = void 0;

      if (_fs2.default.existsSync(routeFullPath)) {
        setRouteHandler = require(routeFullPath).default;
      } else {
        setRouteHandler = _defaultUiRouteHandler2.default;
      }

      setRouteHandler({ router: pageRouter });

      uiRouter.use('/' + dirPieces.join('/'), (0, _clientApp.clientAppMiddleware)({ routeConfig: routeConfig, cwd: cwd, iocContainer: iocContainer }), pageRouter);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return uiRouter;
};