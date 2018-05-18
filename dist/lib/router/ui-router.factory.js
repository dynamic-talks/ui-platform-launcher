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

var _require = require('ui-platform-core/dist/lib/pages/pages-settings.resolver'),
    resolvePagesSettings = _require.resolvePagesSettings;

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