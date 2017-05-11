var util = require('./util');

module.exports = function content(node, check) {
  util.props(node, check, {
    'expr': false
  });

  // TODO check expr vs children
};
