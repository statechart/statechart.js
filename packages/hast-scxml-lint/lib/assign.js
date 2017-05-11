var util = require('./util');

module.exports = function assign(node, check) {
  util.props(node, check, {
    'location': true,
    'expr': false
  });

  // TODO check expr vs children
};
