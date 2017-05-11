var util = require('./util');

var validChildren = {
  'onentry': true,
  'onexit': true,
  'transition': true,
  'state': true,
  'parallel': true,
  'history': true,
  'datamodel': [0, 1],
  'invoke': true,
};

module.exports = function parallel(node, check) {
  util.props(node, check, {
    'id': false,
  });

  util.childTypes(node, check, validChildren);
};
