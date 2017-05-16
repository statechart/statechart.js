import { props, childTypes } from './util';

export default function datamodel(node, check) {
  props(node, check, {});
  childTypes(node, check, {
    'data': true
  });
};
