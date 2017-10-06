import transform from 'unist-util-transform';
import createGroup from 'unist-util-transform-group';
import createStack from 'unist-util-transform-stack';

const SCXML = 'scxml';
const STATE = 'state';
const PARALLEL = 'parallel';
const INITIAL = 'initial';
const FINAL = 'final';
const HISTORY = 'history';
const TRANSITION = 'transition';

const ROOT = 'root';
const DOCUMENT = 'document';

function recordSource(sources, source) {
  return id => {
    const states = sources.get(id) || new Set();
    states.add(source);
    sources.set(id, states);
  };
}

function rootVisitor(file, sources, stateNodes) {
  return {
    types: [ROOT],
    exit: function(node) {
      var documents = node.children.filter(function(child) {
        return child.type === DOCUMENT;
      });

      if (documents.length !== 1) {
        file.fail('Only one root document allowed', node);
      }

      const document = documents[0];

      const reachableStates = new Map([[0, true]]);
      const isReachable = idx => {
        if (reachableStates.has(idx)) return reachableStates.get(idx);

        const states = sources.get(idx);
        if (!states) {
          reachableStates.set(idx, false);
          return false;
        }

        reachableStates.set(idx, false);

        const res = Array.from(states).some(isReachable);

        reachableStates.set(idx, res);

        return res;
      }

      document.states.forEach((state) => {
        const idx = state.idx;
        if (isReachable(idx)) return;
        const id = state.id ? ': ' + JSON.stringify(state.id) : '';
        const loc = stateLoc(stateNodes, idx);
        const msg = file.message('unreachable state' + id, loc, 'scexe/unreachable');
        msg.source = '@statechart/scast-to-scexe';
      });

      return document;
    },
  };
}

function stateLoc(stateNodes, idx) {
  const node = stateNodes[idx] || {};
  const position = (node.data || {}).position || {};
  return position.opening || node;
}

function stateVisitor(file, sources, stateNodes) {
  const covExpr = convertExpression.bind(null, file);
  function covInvoke(invoke) {
    return convertInvoke(invoke, file);
  }
  function covData(invoke) {
    return convertData(invoke, file);
  }
  return {
    types: [
      SCXML,
      STATE,
      PARALLEL,
      INITIAL,
      FINAL,
      HISTORY,
    ],
    enter: function(node, index, parent, doc) {
      const { idx, data: { ancestors, completion } } = node;
      const fn = recordSource(sources, idx);
      ancestors.forEach(fn);
      completion.forEach(fn);
      stateNodes[idx] = node;
      return node;
    },
    exit: function(node, index, parent, doc) {
      var data = node.data;
      var state = doc.states[node.idx] = {
        type: data.type,
        idx: node.idx,
        id: node.id,
        onEnter: (data.onEnter || []).map(covExpr).filter(isDefined),
        onExit: (data.onExit || []).map(covExpr).filter(isDefined),
        invocations: (data.invocations || []).map(covInvoke).filter(isDefined),
        data: (data.datamodel || []).map(covData).filter(isDefined),
        parent: data.parent,
        children: data.children,
        ancestors: data.ancestors,
        completion: data.completion,
        transitions: data.transitions,
        hasHistory: data.hasHistory,
        name: node.name,
      };
      return node.type !== SCXML ? null : doc;
    },
  };
}

function transitionVisitor(file, sources) {
  const covExpr = convertExpression.bind(null, file);
  return {
    types: [TRANSITION],
    enter: function(node) {
      node.data.targets.forEach(recordSource(sources, node.data.source));
      return node;
    },
    exit: function(node, index, parent, doc) {
      var data = node.data;
      var transition = doc.transitions[node.idx] = {
        type: data.type,
        idx: node.idx,
        source: data.source,
        events: node.event,
        condition: covExpr(node.cond),
        onTransition: (data.onTransition || []).map(covExpr).filter(isDefined),
        targets: data.targets,
        conflicts: data.conflicts,
        exits: data.exits,
        name: node.name,
      };
      return null;
    },
  };
}

function ignoreVisitor(file) {
  return {
    types: [
      'comment',
    ],
    enter: function() {
      return null;
    },
  };
}

function init(scxml) {
  return {
    type: DOCUMENT,
    name: scxml.name,
    states: [],
    transitions: [],
    datamodel: scxml.datamodel,
  };
}

const expressions = {
  comment: function() {
    return undefined;
  },
  text: function() {
    return undefined;
  },
  raise: function(expr) {
    return {
      type: 'raise',
      props: {
        event: createLiteral(expr.event),
      },
    };
  },
  cond: function(expr, file) {
    const covExpr = convertExpression.bind(null, file);
    return {
      type: 'cond',
      children: expr.children.map(function(child) {
        return {
          type: 'clause',
          props: {
            condition: covExpr(child.cond),
          },
          children: child.children.map(covExpr).filter(isDefined),
        };
      }),
    };
  },
  foreach: function(expr, file) {
    const covExpr = convertExpression.bind(null, file);
    return {
      type: 'foreach',
      props: {
        array: covExpr(expr.array),
        item: covExpr(expr.item),
        index: covExpr(expr.index),
      },
      children: expr.children.map(covExpr),
    };
  },
  log: function(expr, file) {
    return {
      type: 'log',
      props: {
        label: createLiteral(expr.label),
        value: convertExpression(file, expr.expr),
      },
    };
  },
  assign: function(expr, file) {
    const covExpr = convertExpression.bind(null, file);
    return {
      type: 'assign',
      props: {
        location: covExpr(expr.location),
        value: covExpr(expr.expr),
      },
    };
  },
  param: function(expr, file) {
    return {
      type: 'param',
      props: {
        name: createLiteral(expr.name),
        value: convertExpression(file, expr.expr),
      },
    };
  },
  script: function({ src, children }, file) {
    if (src) return {
      type: 'script_ext',
      props: {
        src: createLiteral(src),
      },
    };

    if (children.length === 1 && children[0].type === 'eval') {
      return convertExpression(file, children[0]);
    }

    return {
      type: 'script',
      value: children.map(child => typeof child === 'string' ? child : (child.value || '')).join(''),
    };
  },
  send: function(expr, file) {
    const covExpr = convertExpression.bind(null, file);
    return {
      type: 'send',
      props: {
        event: covExpr(expr.event),
        target: covExpr(expr.target),
        type: covExpr(expr.t),
        id: covExpr(expr.id),
        delay: covExpr(expr.delay),
        content: covExpr(expr.data.content),
      },
      children: (expr.data.params || []).map(covExpr).filter(isDefined),
    };
  },
  cancel: function(expr) {
    return {
      type: 'cancel',
      props: {
        sendid: convertExpression(file, expr.sendid),
      },
    };
  },
  expr: function(expr) {
    return {
      type: 'expr',
      value: expr.value,
    };
  },
  eval: function(expr) {
    return {
      type: 'eval',
      value: expr.value,
    };
  },
  literal: function(expr) {
    return {
      type: 'literal',
      value: expr.value,
    };
  },
  location: function(expr) {
    return {
      type: 'location',
      value: expr.value,
    };
  },
};

function convertExpression(file, expr) {
  return expr && (expressions[expr.type] || invalidElement)(expr, file);
}

function convertInvoke(invoke, file) {
  const covExpr = convertExpression.bind(null, file);
  return {
    type: covExpr(invoke.t),
    src: covExpr(invoke.src),
    id: covExpr(invoke.id),
    autoforward: invoke.autoforward,
    params: (invoke.data.params || []).map(covExpr).filter(isDefined),
    content: covExpr(invoke.data.content),
    onExit: (invoke.data.onExit || []).map(covExpr).filter(isDefined),
  };
}

function convertData(data, file) {
  return {
    id: data.id,
    value: convertExpression(file, data.expr),
    src: data.src,
  };
}

function isDefined(node) {
  return !!node;
}

function createLiteral(value) {
  return value ? {
    type: 'literal',
    value: value
  } : undefined;
}

function invalidElement(node, file) {
  file.message('Cannot encode element: ' + node.type, node).fatal = true;
  return undefined;
}

export default function(opts) {
  return function(root, file) {
    const sources = new Map([[0, new Set([0])]]);
    const stateNodes = [];
    const stack = createStack(SCXML, init, createGroup([
      stateVisitor(file, sources, stateNodes),
      transitionVisitor(file, sources),
      ignoreVisitor(file),
      rootVisitor(file, sources, stateNodes),
    ]));

    return transform(root, stack);
  };
};
