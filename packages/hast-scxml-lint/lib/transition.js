var util = require('./util');

var validChildren = require('./executable');

module.exports = function transition(node, check) {
  var props = node.properties;

  util.props(node, check, {
    'event': false,
    'cond': false,
    'target': false,
    'type': ['external', 'internal']
  });

  util.childTypes(node, check, validChildren);

  check(
    props.event || props.cond || props.target,
    'valid',
    '<transition> must specify at least one of "event", "cond" or "target"',
    node
  );
};
