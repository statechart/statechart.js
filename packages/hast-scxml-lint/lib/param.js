var util = require('./util');

module.exports = function param(node, check) {
  util.props(node, check, {
    'name': true,
    'expr': false,
    'location': false,
  });

  var props = node.properties;
  check(
    !(props.expr && props.location),
    'prop-conflict',
    '<param> must specify either the "expr" or "location" attribute, but not both',
    node
  );
};
