import { isState, stateTypes } from '../util';

export default function() {
  return {
    types: stateTypes,
    enter: function(node, index, parent) {
      node.data.descendants = [];
      node.data.children = [];

      if (isState(parent)) {
        parent.data.children.push(node.idx);
        parent.data.descendants.push(node.idx);
      }

      return node;
    },
    exit: function(node, index, parent) {
      if (isState(parent)) {
        parent.data.descendants = parent.data.descendants.concat(node.data.descendants);
      }

      return node;
    }
  };
};
