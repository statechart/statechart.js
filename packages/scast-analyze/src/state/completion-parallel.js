import {
  PARALLEL,
} from '../identifiers';
import { isState } from '../util';

export default function() {
  return {
    types: [PARALLEL],
    exit: function(node, index, parent) {
      node.data.completion = node.data.children.slice();
      return node;
    }
  };
};
