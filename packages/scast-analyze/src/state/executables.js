import { stateTypes } from '../util';

const types = {
  'onentry': 'onEnter',
  'onexit': 'onExit',
};

export default function() {
  return {
    types: stateTypes,
    exit: function(node) {
      var data = node.data;
      node.children = node.children.filter(function(child) {
        var t = types[child.type];
        if (!t) return true;
        data[t] = (data[t] || []).concat(child.children);
      });
      return node;
    }
  };
};
