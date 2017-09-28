import createStack from 'unist-util-transform-stack';
import {
  SCXML,
  TRANSITION,
} from '../identifiers';
import { getTransitionSource } from './util';

export default function() {
  return createStack(SCXML, function(scxml) {
    return scxml.data;
  }, {
    types: [TRANSITION],
    enter: function(node, index, parent, scxml) {
      const conflicts = node.data.conflicts = [];
      if (node.target === false) return node;
      const states = scxml.states;
      scxml.transitions.forEach(function(t2) {
        if (node.idx === t2.idx) return;
        if (hasConflict(states, node, t2)) conflicts.push(t2.idx);
      });
      return node;
    }
  });
};

function hasIntersection(arr1, arr2) {
  const set2 = new Set(arr2);
  for (var i = 0; i < arr1.length; i++) {
    if (set2.has(arr1[i])) return true;
  }
  return false;
}

function hasConflict(states, t1, t2) {
  const s1 = getTransitionSource(states, t1);
  const s2 = getTransitionSource(states, t2);
  return (
    s1.idx === s2.idx ||
    hasIntersection(t1.data.exits, t2.data.exits) ||
    ~s1.data.descendants.indexOf(s2.idx) ||
    ~s2.data.descendants.indexOf(s1.idx) ||
    false
  );
}
