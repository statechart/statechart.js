var util = require('./util');

module.exports = function log(node, check) {
  util.props(node, check, {
    'label': false,
    'expr': false,
  });
};
