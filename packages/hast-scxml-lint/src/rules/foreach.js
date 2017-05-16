import { props, childTypes } from './util';
import validChildren from './executable';

export default function foreach(node, check) {
  props(node, check, {
    'array': true,
    'item': true,
    'index': false
  });
  childTypes(node, check, validChildren);
};
