import { isState, stateTypes } from '../util';

export default function() {
  return {
    types: stateTypes,
    enter: function(node, index, parent) {
      node.data.ancestors = isState(parent) ?
        parent.data.ancestors.concat([parent.idx]) :
        [];

      return node;
    }
  };
};
