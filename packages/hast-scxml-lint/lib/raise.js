var util = require('./util');

module.exports = function raise(node, check) {
  util.props(node, check, {
    'event': true
  });
};
