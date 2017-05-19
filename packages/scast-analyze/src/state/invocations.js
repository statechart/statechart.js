import { stateTypes } from '../util';

export default function() {
  return {
    types: stateTypes,
    enter: function(node) {
      node.data.invocations = node.children.reduce(function(acc, child) {
        if (child.type === 'invoke') acc.push(child);
        return acc;
      }, []);

      return node;
    }
  };
};
