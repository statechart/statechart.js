import {
  SCXML,
  STATE,
} from '../identifiers';
import { createStacker, stateTypes } from '../util';

export default function() {
  return createStacker(SCXML, function(scxml) {
    return scxml.data.initial = [];
  }, {
    types: [SCXML, STATE],
    enter: function(node, index, parent, initials) {
      const initial = node.initial;
      if (initial && initial.length) initials[node.idx] = initial;
      return node;
    }
  });
};
