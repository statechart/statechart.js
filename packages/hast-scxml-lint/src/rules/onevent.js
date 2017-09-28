import { props, childTypes } from './util';
import validChildren from './executable';

export default function onevent(node, check) {
  var properties = node.properties;

  props(node, check, {
    'event': false,
    'cond': false,
    'name': false,
  });

  childTypes(node, check, validChildren);
};
