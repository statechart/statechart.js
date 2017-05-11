var util = require('./util');

var validChildren = {
  'onentry': true,
  'onexit': true,
  'transition': true,
  'initial': [0, 1],
  'state': true,
  'parallel': true,
  'final': true,
  'history': true,
  'datamodel': [0, 1],
  'invoke': true,
};

module.exports = function state(node, check) {
  util.props(node, check, {
    'initial': false,
    'id': false,
  });

  var initialProp = node.properties.initial;
  util.childTypes(node, check, validChildren, function(type, props, child) {
    check(
      initialProp ? type !== 'initial' : true,
      'child-initial-conflict',
      '<state> may specify either an "initial" attribute or an <initial> element, but not both',
      child
    );
  });
};
