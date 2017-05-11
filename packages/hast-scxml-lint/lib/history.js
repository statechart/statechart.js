var util = require('./util');

var validChildren = {
  'transition': 1,
};

module.exports = function history(node, check) {
  util.props(node, check, {
    'id': false,
    'type': ['shallow', 'deep'],
  });

  util.childTypes(node, check, validChildren, function(type, props, child) {
    check(
      props.target,
      'child-transition-target',
      '<transition> must specify a non-null "target"',
      child
    );

    check(
      !props.cond,
      'child-transition-cond',
      '<transition> must not specify a "cond"',
      child
    );

    check(
      !props.event,
      'child-transition-event',
      '<transition> must not specify a "event"',
      child
    );
  });
};
