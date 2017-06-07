import {
  INITIAL,
  HISTORY,
  HISTORY_DEEP,
  HISTORY_SHALLOW,
} from '../identifiers';
import { stateTypes } from '../util';

const scores = {};
scores[INITIAL] = 3;
scores[HISTORY_DEEP] = 2;
scores[HISTORY_SHALLOW] = 1;

function getScore(node) {
  var type = node.type;
  if (type === HISTORY) type = HISTORY + '_' + node.t;
  return scores[type] || 0;
}

export default function() {
  return {
    types: stateTypes,
    enter: function(node) {
      node.children = node.children.sort(function(a, b) {
        return getScore(b) - getScore(a);
      });
      return node;
    }
  };
};
