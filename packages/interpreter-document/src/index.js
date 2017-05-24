import escape from 'escape-string-regexp';

export default class Document {
  constructor(doc, datamodels) {
    var dm = datamodels[doc.datamodel];
    this.datamodel = {
      load: function(node) {
        return node && dm.load(node);
      },
      init: function(node) {
        var d = dm.init(node);

        return Object.assign({}, d, {
          exec: function(node) {
            return node && d.exec(node);
          },
        });
      }
    };

    if (!dm) throw new Error('Unsupported datamodel: ' + doc.datamodel);
    load.call(this, doc);
  }

  init(api, ioprocessors) {
    return this.datamodel.init(api, ioprocessors);
  }
}

function load(doc) {
  this.states = doc.states.map(loadState.bind(this));
  this.transitions = doc.transitions.map(loadTransition.bind(this));
}

function loadState(state) {
  var loadExpr = this.datamodel.load;
  return Object.assign(
    {},
    state,
    {
      onInitialize: (state.onInitialize || []).map(loadExpr),
      onEnter: (state.onEnter || []).map(loadExpr),
      onExit: (state.onExit || []).map(loadExpr),
      invocations: (state.invocations || []).map(loadInvoke.bind(this)),
      data: (state.datamodel || []).map(loadExpr),
    }
  );
}

function loadTransition(transition) {
  var loadExpr = this.datamodel.load;
  return Object.assign(
    {},
    transition,
    {
      events: createMatcher(transition.events),
      condition: loadExpr(transition.condition),
      onTransition: (transition.onTransition || []).map(loadExpr),
    }
  );
}

function loadInvoke(invoke) {
  var loadExpr = this.datamodel.load;
  return Object.assign(
    {},
    invoke,
    {
      type: loadExpr(invoke.type),
      src: loadExpr(invoke.src),
      id: loadExpr(invoke.id),
      content: invoke.content ?
        loadExpr(invoke.content) :
        (invoke.params || []).map(loadExpr),
      onExit: (invoke.onExit || []).map(loadExpr),
    }
  );
}

function createMatcher(matches) {
  if (matches[0] === '*') return function() { return true; }
  var regexps = matches.map(function(match) {
    var pattern = escape(match).replace(/\\\*/g, '.+')
    return new RegExp('^' + pattern + '$');
  });
  return function(event) {
    return regexps.some(function(re) {
      return re.test(event.name);
    });
  };
}
