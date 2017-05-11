'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var transform = _interopDefault(require('unist-util-transform'));
var createGroup = _interopDefault(require('unist-util-transform-group'));
var createStack = _interopDefault(require('unist-util-transform-stack'));

const SCXML = 'scxml';
const STATE = 'state';
const PARALLEL = 'parallel';
const INITIAL = 'initial';
const FINAL = 'final';
const HISTORY = 'history';
const TRANSITION = 'transition';

const COMPOUND = 'compound';
const ATOMIC = 'atomic';

const HISTORY_DEEP = 'history_deep';
const HISTORY_SHALLOW = 'history_shallow';

const TARGETLESS = 'targetless';
const INTERNAL = 'internal';
const SPONTANEOUS = 'spontaneous';
const EXTERNAL = 'external';

const stateTypes = new Set([
  SCXML,
  STATE,
  PARALLEL,
  INITIAL,
  FINAL,
  HISTORY,
]);

function isState(node) {
  return !!(node && stateTypes.has(node.type));
}

function createTranslator(passes) {
  return function translator(opts) {
    return function mapper(ast, file) {
      function init() {
        return createGroup(passes.map(function(fn) {
          return fn(opts, file);
        }));
      }

      var stacker = createStack(SCXML, init, {
        enter: function(node, index, parent, group) {
          return group ?
            group.enter(node, index, parent) :
            node;
        },
        exit: function(node, index, parent, group) {
          return group ?
            group.exit(node, index, parent) :
            node;
        }
      });

      return transform(ast, stacker);
    };
  }
}

var ifToCond = function() {
  return {
    types: ['if'],
    enter: function(node) {
      var clauses = [];
      node.children.reduce(function(acc, child) {
        var type = child.type;
        if (type === 'elseif' || type === 'else') acc = createClause(child, clauses);
        else acc.children.push(child);
        return acc;
      }, createClause(node, clauses));

      return {
        type: 'cond',
        children: clauses,
        position: node.position,
      };
    }
  };
};

function createClause(node, clauses) {
  var clause = Object.assign({}, node, {
    type: 'clause',
    children: [],
  });
  clauses.push(clause);
  return clause;
}

const scores = {};
scores[INITIAL] = 3;
scores[HISTORY_DEEP] = 3;
scores[HISTORY_SHALLOW] = 1;

function getScore(node) {
  var type = node.type;
  if (type === HISTORY) type = HISTORY + '_' + node.t;
  return scores[type] || 0;
}

var stateSort = function() {
  return {
    types: stateTypes,
    enter: function(node) {
      node.children = node.children.sort(function(a, b) {
        return getScore(b) - getScore(a);
      });
      return node;
    }
  };
};

var stateIdentify = function() {
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

var transitionIdentify = function() {
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

var stateMap = function() {
  return createStack(SCXML, function(scxml) {
    return scxml.data.ids = new Map();
  }, {
    types: stateTypes,
    enter: function(node, index, parent, ids) {
      if (node.id) ids.set(node.id, node.idx);
      return node;
    }
  });
};

var stateAncestors = function() {
  return {
    types: stateTypes,
    enter: function(node, index, parent) {
      node.data.ancestors = isState(parent) ?
        parent.data.ancestors.concat([parent.idx]) :
        [];

      return node;
    }
  };
};

var stateDescendants = function() {
  return {
    types: stateTypes,
    enter: function(node, index, parent) {
      node.data.descendants = [];
      node.data.children = [];

      if (isState(parent)) {
        parent.data.children.push(node.idx);
        parent.data.descendants.push(node.idx);
      }

      return node;
    },
    exit: function(node, index, parent) {
      if (isState(parent)) {
        parent.data.descendants = parent.data.descendants.concat(node.data.descendants);
      }

      return node;
    }
  };
};

var stateCompletion = function() {
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

var stateCompletionParallel = function() {
  return {
    types: [PARALLEL],
    exit: function(node, index, parent) {
      node.data.completion = node.data.children.slice();
      return node;
    }
  };
};

var stateCompletionHistory = function() {
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

var stateType = function() {
  return {
    types: stateTypes,
    enter: function(node, index, parent) {
      var type = node.type;

      if (type === STATE) {
        type = node.data.children.length ? COMPOUND : ATOMIC;
      }
      if (type === HISTORY) {
        type = node.t === 'deep' ? HISTORY_DEEP : HISTORY_SHALLOW;
      }
      if (type === SCXML) type = COMPOUND;

      node.data.type = type;

      return node;
    }
  };
};

var transitionType = function() {
  return {
    types: [TRANSITION],
    enter: function(node, index, parent) {
      var type = EXTERNAL;

      if (isEmpty$1(node.event)) type = SPONTANEOUS;
      if (node.t == INTERNAL) type = INTERNAL;
      if (isEmpty$1(node.target)) type = TARGETLESS;
      if (parent.type === INITIAL) type = INITIAL;
      if (parent.type === HISTORY) type = HISTORY;

      node.data.type = type;

      return node;
    }
  };
};

function isEmpty$1(arr) {
  return !arr || arr.length;
}

function getTransitionSource(states, transition) {
  var source = states.get(transition.data.source);
  if (source.type === INITIAL) source = states.get(source.data.parent);
  return source;
}

function unknownTarget(target) {
  throw new Error('Unknown target: ' + target)
}

var transitionExitSet = function() {
  return createStack(SCXML, function(scxml) {
    return scxml.data;
  }, {
    types: [TRANSITION],
    enter: function(node, index, parent, conf) {
      const targets = node.data.targets = (node.target || []).map(function(target) {
        return conf.ids.get(target) || unknownTarget(target);
      });

      node.data.exits = targets.length ?
        getExitSet(conf.states, node, targets) :
        [];

      return node;
    }
  });
};

const exitTypes = new Set([PARALLEL, COMPOUND, ATOMIC, FINAL]);
function getExitSet(states, transition, targets) {
  const domain = getTransitionDomain(states, transition, targets);
  return domain.data.descendants.filter(function(anc) {
    return exitTypes.has(states.get(anc).data.type)
  });
}

function getTransitionDomain(states, transition, targets) {
  const source = getTransitionSource(states, transition);

  if (
    transition.data.type === INTERNAL &&
    source.data.type === COMPOUND &&
    areDescendants(source, targets)
  ) return source;

  return findLCCA(states, source, targets);
}

const lccaTypes = new Set([PARALLEL, COMPOUND, ATOMIC]);
function findLCCA(states, source, targets) {
  const ancestors = source.data.ancestors.filter(function(anc) {
    return lccaTypes.has(states.get(anc).data.type);
  });

  const selfAndTargets = targets.concat([source.idx]);

  var anc;
  for (var i = ancestors.length - 1; i >= 0; i--) {
    anc = states.get(ancestors[i]);
    if (areDescendants(anc, selfAndTargets)) break;
  }
  return anc || source;
}

function areDescendants(state, targets) {
  const descendants = new Set(state.data.descendants);
  for (var i = 0; i < targets.length; i++) {
    if (!descendants.has(targets[i])) return false;
  }
  return true;
}

var transitionConflicts = function() {
  return createStack(SCXML, function(scxml) {
    return scxml.data;
  }, {
    types: [TRANSITION],
    enter: function(node, index, parent, scxml) {
      const conflicts = node.data.conflicts = [];
      const states = scxml.states;
      scxml.transitions.forEach(function(t2) {
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

var index = [
  createTranslator([
    ifToCond,

    stateSort,

    // identify
    stateIdentify,
    transitionIdentify,

    // accumulate
    stateMap,

    // state heiarchy
    stateAncestors,
    stateDescendants,
    stateCompletion,
    stateCompletionParallel,

    // establish types
    stateType,
    transitionType,
  ]),
  createTranslator([
    stateCompletionHistory,
    transitionExitSet,
  ]),
  createTranslator([
    transitionConflicts
  ]),
  createTranslator([
    function() {
      return {
        types: [SCXML],
        enter: function cleanup(scxml) {
          const data = scxml.data;
          delete data.states;
          delete data.transitions;
          delete data.ids;
        },
      };
    }
  ]),
  function() {
    return function(root) {
      root.data.scastAnalyzed = true;
      return root;
    }
  }
];

module.exports = index;
