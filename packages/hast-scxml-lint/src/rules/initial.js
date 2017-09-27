import { props, childTypes } from './util';

const validChildren = {
  'transition': 1,
};

export default function initial(node, check) {
  props(node, check, {
    'name': false,
  });
  childTypes(node, check, validChildren, function(type, props, child) {
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
