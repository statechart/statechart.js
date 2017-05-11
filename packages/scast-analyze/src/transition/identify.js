import createStack from 'unist-util-transform-stack';
import {
  SCXML,
  TRANSITION,
} from '../identifiers';

export default function() {
  return createStack(SCXML, function(scxml) {
    const acc = scxml.data.transitions = new Map();
    return {
      idx: 0,
      acc: acc,
    };
  }, {
    types: [TRANSITION],
    enter: function(node, index, parent, conf) {
      node.idx = conf.idx++;
      conf.acc.set(node.idx, node);
      node.data.source = parent.idx;
      return node;
    }
  });
};
