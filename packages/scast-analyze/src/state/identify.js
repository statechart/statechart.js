import createStack from 'unist-util-transform-stack';
import {
  SCXML,
} from '../identifiers';
import { stateTypes } from '../util';

export default function(_opts, file) {
  var usedIds = new Set();
  return createStack(SCXML, function(scxml) {
    const acc = scxml.data.states = new Map();
    return {
      idx: 0,
      acc: acc,
    };
  }, {
    types: stateTypes,
    enter: function(node, index, parent, conf) {
      const id = node.id;
      if (id && usedIds.has(id)) {
        var msg = file.message('duplicate id: ' + JSON.stringify(id), node, 'state/identify');
        msg.source = '@statechart/scast-analyze';
        msg.fatal = true;
      }
      usedIds.add(id);
      node.idx = conf.idx++;
      node.data.parent = parent.hasOwnProperty('idx') ? parent.idx : node.idx;
      conf.acc.set(node.idx, node);
      return node;
    }
  });
};
