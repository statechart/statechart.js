import { stateTypes } from '../util';

export default function() {
  return {
    types: ['transition'],
    exit: function(node) {
      var data = node.data;
      data.onTransition = (data.onTransition || []).concat(node.children);
      node.children = [];
      return node;
    }
  };
};
