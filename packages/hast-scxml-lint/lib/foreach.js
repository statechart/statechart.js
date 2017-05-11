var util = require('./util');

var validChildren = require('./executable');

module.exports = function foreach(node, check) {
  util.props(node, check, {
    'array': true,
    'item': true,
    'index': false
  });
  util.childTypes(node, check, validChildren);
};
