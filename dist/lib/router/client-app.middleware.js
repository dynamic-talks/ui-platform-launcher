'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clientAppMiddleware = undefined;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mapToString = function mapToString(array, mapper) {
  return array.map(mapper).join('\n');
};
var isProduction = process.env.NODE_ENV === 'production';

var renderHtmlTemplate = function renderHtmlTemplate(_ref) {
  var _ref$headerTitle = _ref.headerTitle,
      headerTitle = _ref$headerTitle === undefined ? '' : _ref$headerTitle,
      docLang = _ref.docLang,
      modulesStr = _ref.modulesStr,
      stateStr = _ref.stateStr,
      configStr = _ref.configStr,
      scripts = _ref.scripts,
      metaTags = _ref.metaTags,
      linkTags = _ref.linkTags;
  return '\n<!DOCTYPE html>\n<html lang="' + docLang + '">\n  <head>\n    <meta charset="utf-8">\n    <title>' + headerTitle + '</title>\n    \n    ' + mapToString(metaTags, function (_ref2) {
    var name = _ref2.name,
        content = _ref2.content;
    return '<meta name=' + name + ' content="' + content + '">';
  }) + '\n    \n    ' + mapToString(linkTags, function (_ref3) {
    var rel = _ref3.rel,
        href = _ref3.href,
        type = _ref3.type,
        media = _ref3.media,
        sizes = _ref3.sizes,
        charset = _ref3.charset;
    return '<link rel="' + rel + '" href="' + href + '" ' + (type ? 'type="' + type + '"' : '') + ' ' + (media ? 'media="' + media + '"' : '') + ' ' + (sizes ? 'sizes="' + sizes + '"' : '') + ' ' + (charset ? 'charset="' + charset + '"' : '') + '>';
  }) + '\n  </head>\n  <body>\n    ' + modulesStr + '\n    \n    <script>window.__CONFIG__ = ' + configStr + '</script>\n    <script>window.__STATE__ = ' + stateStr + '</script>\n    \n    ' + mapToString(scripts, function (src) {
    return '<script type="text/javascript" src="' + src + '"></script>';
  }) + '\n  </body>\n</html>\n';
};

var renderHtml = function renderHtml(_ref4) {
  var modules = _ref4.modules,
      state = _ref4.state,
      config = _ref4.config,
      routeConfig = _ref4.routeConfig,
      _ref4$htmlDocOptions = _ref4.htmlDocOptions,
      htmlDocOptions = _ref4$htmlDocOptions === undefined ? {} : _ref4$htmlDocOptions;

  var modulesStr = [];

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = modules[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var module = _step.value;

      modulesStr.push('<div id="' + module.id + '">' + module.html + '</div>');
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

  var scripts = ['/build/' + routeConfig.namespace + '.js'];

  // prepare <header/> specific data
  var _htmlDocOptions$title = htmlDocOptions.title,
      title = _htmlDocOptions$title === undefined ? routeConfig.namespace : _htmlDocOptions$title,
      _htmlDocOptions$docLa = htmlDocOptions.docLang,
      docLang = _htmlDocOptions$docLa === undefined ? 'en' : _htmlDocOptions$docLa,
      _htmlDocOptions$metaT = htmlDocOptions.metaTags,
      metaTags = _htmlDocOptions$metaT === undefined ? [] : _htmlDocOptions$metaT,
      _htmlDocOptions$linkT = htmlDocOptions.linkTags,
      linkTags = _htmlDocOptions$linkT === undefined ? [] : _htmlDocOptions$linkT;


  return renderHtmlTemplate({
    docLang: docLang,
    headerTitle: title,
    modulesStr: modulesStr.join(''),
    stateStr: JSON.stringify(state),
    configStr: JSON.stringify(config.get()),
    scripts: scripts,
    metaTags: metaTags,
    linkTags: linkTags
  });
};

var renderApp = function renderApp(res, app, routeConfig) {
  return function (htmlDocOptions) {
    if (isProduction) {
      var manifestManager = app._ioc.resolve('manifestManager');
      var prodCss = manifestManager.get(routeConfig.namespace + '.css');
      if (!htmlDocOptions.linkTags) htmlDocOptions.linkTags = [];
      if (prodCss) {
        htmlDocOptions.linkTags.push({
          href: '/build/' + prodCss,
          rel: 'stylesheet',
          type: 'text/css'
        });
      }
    }

    app.run({}).then(function (modules) {
      res.send(renderHtml({
        modules: modules,
        state: app.store ? app.store.getState() : {},
        config: app.getClientConfig(),
        routeConfig: routeConfig,
        htmlDocOptions: htmlDocOptions
      }));
    }).catch(function (error) {
      res.status(500).json(error);
    });
  };
};

var clientAppMiddleware = exports.clientAppMiddleware = function clientAppMiddleware(_ref5) {
  var routeConfig = _ref5.routeConfig,
      cwd = _ref5.cwd,
      iocContainer = _ref5.iocContainer;
  var pagePath = routeConfig.pagePath;

  // Check that page module exists

  var appModuleExists = true;

  return function (req, res, next) {

    if (appModuleExists) {
      var module = require(_path2.default.join(cwd, pagePath)).default;
      var app = iocContainer.resolve('ServerUiApplication');

      app.addModule(module);

      app.configure();

      res.$app = app;

      res.renderApp = renderApp(res, app, routeConfig);
    }

    next();
  };
};