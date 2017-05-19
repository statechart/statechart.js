import { stateTypes } from '../util';

export default function() {
  return {
    types: stateTypes,
    exit: function(node) {
      var data = node.data;
      node.children = node.children.filter(function(child) {
        if (child.type !== 'datamodel') return true;
        data.datamodel = child.children;
      });
      return node;
    }
  };
};
