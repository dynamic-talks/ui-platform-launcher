'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var router = _ref.router;

  router.get('*', function (req, res) {
    return res.renderApp();
  });
};