var util = require('./util');

module.exports = function script(node, check) {
  util.props(node, check, {
    'src': false,
  });

  // TODO check expr vs children
};
