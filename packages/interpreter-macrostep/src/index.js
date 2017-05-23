import Emitter from 'events';
import { init, handleEvent, synchronize } from '@statechart/interpreter-microstep';

export default function createInterpreter(doc, ioprocessors, invokers) {
  var isRunning = false;
  var step;
  var emitter = new Emitter();

  var invocations = new Map();
  var internalEvents = [];
  var externalEvents = [];
  var datamodel;
  var state;

  var backend = {
    exec: function(execution) {
      datamodel.push(execution);
    },

    query: function(execution) {
      return datamodel.exec(execution);
    },
  };

  function handleError(err) {
    // TODO
  }

  function macrostep() {
    var event;
    if (event = internalEvents.pop()) return handleInternalEvent(event);
    if (!isRunning) return exit();

    if (internalEvents.length) return macrostep();

    invoke();

    if (event = externalEvents.pop()) return handleExternalEvent(event);

    step = null;
    // TODO emit stable event
    return Promise.resolve(state.configuration);
  }

  function handleInternalEvent(event) {
    state = handleEvent(backend, doc, state, event);
    return datamodel
      .event(event)
      .flush()
      .then(function() {
        state = synchronize(backend, doc, state);
        return datamodel
          .flush()
          .then(macrostep)
          .catch(handleError);
      })
      .catch(handleError);
  }

  function handleExternalEvent(event) {
    // TODO isCancelEvent?

    datamodel = datamodel.event(event);

    // TODO finalize matching invocations

    state = handleEvent(backend, doc, state, event);
    return datamodel
      .flush()
      .then(macrostep)
      .catch(handleError);
  }

  function invoke() {
    var acc = new Map();

    state.configuration.forEach(function(idx) {
      var st = doc.states[idx];
      st.invocations.forEach(function(invocation, i) {
        var prev = invocations.get(invocation);
        if (prev) return acc.set(invocation, prev);

        try {
          var inv = {
            idx: i,
            type: datamodel.exec(invocation.type),
            src: datamodel.exec(invocation.src),
            id: datamodel.exec(invocation.id),
            content: datamodel.exec(invocation.content),
            source: idx,
            parent: st.parent,
            depth: st.ancestors.length,
          };

          var invoker = invokers[inv.type];
          if (invoker) {
            var cancel = invoker(inv, api.send);
            acc.set(invocation, cancel);
          } else {
            console.error('Invalid invocation', inv);
          }
        } catch (err) {
          console.error(err);
          // TODO push internal error
        }
      });
    });

    invocations.forEach(function(invocation, cancel) {
      if (acc.has(invocation)) return;
      cancel();
    });

    invocations = acc;
  }

  function exit() {
    // TODO
  }

  var api = {
    events: emitter,

    start: function() {
      isRunning = true;
      state = init(backend, doc);
      return step = datamodel
        .flush()
        .then(macrostep)
        .catch(handleError);
    },

    send: function(event) {
      if (!step) return step = handleExternalEvent(event);
      externalEvents.push(event);
      return step;
    },

    dump: function() {
      return {
        configuration: state.configuration,
        history: state.history,
        datamodel: datamodel.dump(),
      };
    },

    load: function(conf) {
      state = Object.assign(
        {},
        state,
        {
          configuration: conf.configuration,
          history: conf.history,
        }
      );
      datamodel = datamodel.load(conf.datamodel);
    },

    subscribe: function(fn) {
      emitter.on('change', fn);
      return function() {
        return emitter.removeListener('change', fn);
      };
    },

    isActive: function(s) {
      if (Array.isArray(s)) {
        return state.every(function(s) { return api.isActive(s); });
      }

      var configuration = state.configuration;
      for (var i = 0, idx; i < configuration.length; i++) {
        idx = configuration[i];
        if (s === idx || s === doc.states[idx].id) return true;
      }
      return false;
    },

    getConfiguration: function() {
      return state.configuration.reduce(function(acc, idx) {
        var id = doc.states[idx].id;
        if (id) acc.push(id);
        return acc;
      }, []);
    },
  };

  datamodel = doc.init({
    isActive: api.isActive,
    raise: function(event) {
      if (!step) return step = handleInternalEvent(event);
      internalEvents.push(event);
      return step;
    },
    send: function(event) {
      // TODO
    },
  }, ioprocessors);

  return api;
}
