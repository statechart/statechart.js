var util = require('./util');
var validChildren = require('./executable');

module.exports = function onexit(node, check) {
  util.props(node, check, {});
  util.childTypes(node, check, validChildren);
};
