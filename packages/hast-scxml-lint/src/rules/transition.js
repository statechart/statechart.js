import { props, childTypes } from './util';
import validChildren from './executable';

export default function transition(node, check) {
  var properties = node.properties;

  props(node, check, {
    'event': false,
    'cond': false,
    'target': false,
    'type': ['external', 'internal'],
    'name': false,
  });

  childTypes(node, check, validChildren);

  check(
    properties.event || properties.cond || properties.target,
    'valid',
    '<transition> must specify at least one of "event", "cond" or "target"',
    node
  );
};
