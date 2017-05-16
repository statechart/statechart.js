import { props, childTypes } from './util';
import validChildren from './executable';

export default function onexit(node, check) {
  props(node, check, {});
  childTypes(node, check, validChildren);
};
