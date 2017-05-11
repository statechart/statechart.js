import {
  SCXML,
  STATE,
  INITIAL,
  FINAL,
} from '../identifiers';
import { isState } from '../util';

export default function() {
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
        findInitialChildren(node, initial) :
        findInitial(node);
      return node;
    }
  };
};

function findInitialChildren(node, initials) {
  initials = new Set(initials);

  var selected = [];
  function traverse(n) {
    for (var i = 0, children = n.children, child; i < children.length; i++) {
      child = children[i];
      if (initials.has(child.id)) selected.push(child.idx);
      if (isState(child)) traverse(child);
    }
  }
  traverse(node);

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
