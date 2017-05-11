import {
  SCXML,
  STATE,
  COMPOUND,
  ATOMIC,
  INITIAL,
  HISTORY,
  HISTORY_DEEP,
  HISTORY_SHALLOW,
} from '../identifiers';
import { stateTypes } from '../util';

export default function() {
  return {
    types: stateTypes,
    enter: function(node, index, parent) {
      var type = node.type;

      if (type === STATE) {
        type = node.data.children.length ? COMPOUND : ATOMIC;
      }
      if (type === HISTORY) {
        type = node.t === 'deep' ? HISTORY_DEEP : HISTORY_SHALLOW;
      }
      if (type === SCXML) type = COMPOUND;

      node.data.type = type;

      return node;
    }
  };
};

function isEmpty(arr) {
  return !arr || arr.length;
}
