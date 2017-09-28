import {
  SCXML,
  STATE,
  INITIAL,
  FINAL,
} from '../identifiers';
import { isState } from '../util';

export default function(_opts, file) {
  return {
    types: [
      SCXML,
      STATE,
      INITIAL,
      FINAL,
    ],
    exit: function(node, index, parent) {
      var initial = node.initial;
      node.data.completion = initial && initial.length ?
        findInitialChildren(node, initial, file) :
        findInitial(node);
      return node;
    }
  };
};

function findInitialChildren(node, initials, file) {
  initials = new Set(initials);

  // allow states to disable initial child selection
  if (initials.size === 1 && initials.has('_self')) return [];

  var selected = [];
  function traverse(n) {
    for (var i = 0, children = n.children, child; i < children.length; i++) {
      child = children[i];
      if (initials.has(child.id)) {
        selected.push(child.idx);
        initials.delete(child.id);
      }
      if (isState(child)) traverse(child);
    }
  }
  traverse(node);

  if (initials.size) {
    initials.forEach((initial) => {
      var msg = file.message('unknown initial state: ' + JSON.stringify(initial), node, 'state/completion');
      msg.source = '@statechart/scast-analyze';
      msg.fatal = true;
    });
  }

  return selected;
}

function findInitial(node) {
  var childrenStates = node.data.children || [];
  var l = childrenStates.length;
  if (!l) return [];

  for (var i = 0, children = node.children, child; i < children.length; i++) {
    child = children[i];
    if (child.type === INITIAL) return [child.idx];
  }

  return [childrenStates[0]];
}
