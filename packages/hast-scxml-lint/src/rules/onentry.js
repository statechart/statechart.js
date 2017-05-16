import { props, childTypes } from './util';
import validChildren from './executable';

export default function onentry(node, check) {
  props(node, check, {});
  childTypes(node, check, validChildren);
};
