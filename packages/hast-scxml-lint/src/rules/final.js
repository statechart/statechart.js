import { props, childTypes } from './util';

var validChildren = {
  'onentry': true,
  'onexit': true,
  'donedata': [0, 1],
};

export default function final(node, check) {
  props(node, check, {
    'id': false
  });
  childTypes(node, check, validChildren);
};
