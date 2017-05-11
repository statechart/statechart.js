import createStack from 'unist-util-transform-stack';
import {
  SCXML,
  HISTORY,
} from '../identifiers';

export default function() {
  return createStack(SCXML, function(scxml) {
    return scxml.data.states;
  }, {
    types: [HISTORY],
    enter: function(node, index, parent, states) {
      const idx = node.idx;
      const children = node.t === 'deep' ?
        parent.data.descendants :
        parent.data.children;

      node.data.completion = (children || []).filter(function(i) {
        return i !== idx && states.get(i).type !== HISTORY;
      });

      return node;
    }
  });
};
