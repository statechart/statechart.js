var util = require('./util');

module.exports = function elseif(node, check) {
  util.props(node, check, {
    'cond': true
  });
};
