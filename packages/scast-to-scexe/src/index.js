const transform = require('unist-util-transform');
const createGroup = require('unist-util-transform-group');
const createStack = require('unist-util-transform-stack');

const SCXML = 'scxml';
const STATE = 'state';
const PARALLEL = 'parallel';
const INITIAL = 'initial';
const FINAL = 'final';
const HISTORY = 'history';
const TRANSITION = 'transition';

const ROOT = 'root';
const DOCUMENT = 'document';

function rootVisitor(file) {
  return {
    types: [ROOT],
    exit: function(node) {
      var documents = node.children.filter(function(child) {
        return child.type === DOCUMENT;
      });

      if (documents.length > 1) {
        file.fail('Only one root document allowed', node);
      }

      return documents[0] || {};
    },
  };
}

const stateVisitor = {
  types: [
    SCXML,
    STATE,
    PARALLEL,
    INITIAL,
    FINAL,
    HISTORY,
  ],
  exit: function(node, index, parent, doc) {
    var data = node.data;
    var state = doc.states[node.idx] = {
      type: data.type,
      idx: node.idx,
      id: node.id,
      onEnter: (data.onEnter || []).map(convertExpression),
      onExit: (data.onExit || []).map(convertExpression),
      parent: data.parent,
      children: data.children,
      ancestors: data.ancestors,
      completion: data.completion,
      transitions: data.transitions,
      hasHistory: data.hasHistory,
    };
    return node.type !== SCXML ? null : doc;
  }
};

const transitionVisitor = {
  types: [TRANSITION],
  exit: function(node, index, parent, doc) {
    var data = node.data;
    doc.transitions[node.idx] = {
      type: data.type,
      idx: node.idx,
      source: data.source,
      events: node.events,
      condition: convertExpression(node.cond),
      onTransition: (data.onTransition || []).map(convertExpression),
      targets: data.targets,
      conflicts: data.conflicts,
      exits: data.exits,
    };
    return null;
  }
};

const ignoreVisitor = {
  types: [
    'comment',
  ],
  enter: function() {
    return null;
  }
};

function errorVisitor(file) {
  return {
    exit: function(node) {
      if (node.type !== DOCUMENT) {
        try {
          file.message('Cannot encode element: ' + node.type, node);
        } catch(e) { }
      }
    }
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

function convertExpression() {
  // TODO
  return undefined;
}

module.exports = function(opts) {
  return function(root, file) {
    const stack = createStack(SCXML, init, createGroup([
      stateVisitor,
      transitionVisitor,
      ignoreVisitor,
      rootVisitor(file),
      errorVisitor(file),
    ]));

    return transform(root, stack);
  };
};
