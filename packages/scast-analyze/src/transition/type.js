import {
  TRANSITION,
  SPONTANEOUS,
  INTERNAL,
  TARGETLESS,
  INITIAL,
  HISTORY,
  EXTERNAL,
} from '../identifiers';

export default function() {
  return {
    types: [TRANSITION],
    enter: function(node, index, parent) {
      var type = EXTERNAL;

      if (isEmpty(node.event)) type = SPONTANEOUS;
      if (node.t == INTERNAL) type = INTERNAL;
      if (isEmpty(node.target)) type = TARGETLESS;
      if (parent.type === INITIAL) type = INITIAL;
      if (parent.type === HISTORY) type = HISTORY;

      node.data.type = type;

      return node;
    }
  };
};

function isEmpty(arr) {
  return !arr || !arr.length;
}
