import { props, childTypes } from './util';

const validChildren = {
  'onentry': true,
  'onexit': true,
  'transition': true,
  'onevent': true,
  'initial': [0, 1],
  'state': true,
  'parallel': true,
  'final': true,
  'history': true,
  'datamodel': [0, 1],
  'invoke': true,
};

export default function state(node, check) {
  props(node, check, {
    'initial': false,
    'id': false,
    'name': false,
  });

  var initialProp = node.properties.initial;
  childTypes(node, check, validChildren, function(type, props, child) {
    check(
      initialProp ? type !== 'initial' : true,
      'child-initial-conflict',
      '<state> may specify either an "initial" attribute or an <initial> element, but not both',
      child
    );
  });
};
