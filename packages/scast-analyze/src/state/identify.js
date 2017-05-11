import createStack from 'unist-util-transform-stack';
import {
  SCXML,
} from '../identifiers';
import { stateTypes } from '../util';

export default function() {
  return createStack(SCXML, function(scxml) {
    const acc = scxml.data.states = new Map();
    return {
      idx: 0,
      acc: acc,
    };
  }, {
    types: stateTypes,
    enter: function(node, index, parent, conf) {
      node.idx = conf.idx++;
      node.data.parent = parent.hasOwnProperty('idx') ? parent.idx : node.idx;
      conf.acc.set(node.idx, node);
      return node;
    }
  });
};
