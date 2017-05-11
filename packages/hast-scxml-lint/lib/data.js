var util = require('./util');

module.exports = function data(node, check) {
  util.props(node, check, {
    'id': true,
    'src': false,
    'expr': false
  });

  // TODO check expr vs children
};
