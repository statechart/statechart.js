import { props, childTypes } from './util';
import executable from './executable';

const validChildren = Object.assign(
  {
    'elseif': true,
    'else': [0, 1]
  },
  executable
);

export default function if_(node, check) {
  props(node, check, {
    'cond': true
  });
  childTypes(node, check, validChildren);
};
