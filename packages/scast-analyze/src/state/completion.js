import {
  SCXML,
  STATE,
  INITIAL,
  FINAL,
} from '../identifiers';
import { isState, getPropLoc } from '../util';

export default function(_opts, file) {
  return {
    types: [
      SCXML,
      STATE,
      INITIAL,
      FINAL,
    ],
    exit: function(node, index, parent) {
      const initial = node.initial;
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

  const selected = [];
  function traverse(n) {
    for (let i = 0, children = n.children, child; i < children.length; i++) {
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
    const loc = getPropLoc(node, 'initial');
    initials.forEach((initial) => {
      const msg = file.message('unknown initial state: ' + JSON.stringify(initial), loc, 'state/completion');
      msg.source = '@statechart/scast-analyze';
      msg.fatal = true;
    });
  }

  return selected;
}

function findInitial(node) {
  const childrenStates = node.data.children || [];
  const l = childrenStates.length;
  if (!l) return [];

  for (let i = 0, children = node.children, child; i < children.length; i++) {
    child = children[i];
    if (child.type === INITIAL) return [child.idx];
  }

  return [childrenStates[0]];
}
