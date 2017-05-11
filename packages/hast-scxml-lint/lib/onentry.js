var util = require('./util');
var validChildren = require('./executable');

module.exports = function onentry(node, check) {
  util.props(node, check, {});
  util.childTypes(node, check, validChildren);
};
