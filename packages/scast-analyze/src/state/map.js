import createStack from 'unist-util-transform-stack';
import {
  SCXML,
} from '../identifiers';
import { stateTypes } from '../util';

export default function() {
  return createStack(SCXML, function(scxml) {
    return scxml.data.ids = new Map();
  }, {
    types: stateTypes,
    enter: function(node, index, parent, ids) {
      if (node.id) ids.set(node.id, node.idx);
      return node;
    }
  });
};
