import { props, childTypes } from './util';

const validChildren = {
  'onentry': true,
  'onexit': true,
  'transition': true,
  'onevent': true,
  'state': true,
  'parallel': true,
  'history': true,
  'datamodel': [0, 1],
  'invoke': true,
};

export default function parallel(node, check) {
  props(node, check, {
    'id': false,
    'name': false,
  });

  childTypes(node, check, validChildren);
};
