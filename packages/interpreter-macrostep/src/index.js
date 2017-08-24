import Emitter from 'events';
import { init, handleEvent, synchronize } from '@statechart/interpreter-microstep';
import parseDuration from 'parse-duration';
import CancelablePromise from 'cancelable-promise';

const SCXML_SEND_TYPE = 'http://www.w3.org/TR/scxml/#SCXMLEventProcessor';

export default function createInterpreter(doc, ioprocessors, invokers) {
  var isRunning = false;
  var step;
  var emitter = new Emitter();

  var invocations = new Map();
  var pendingSends = new Map();
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
    setTimeout(function() {
      emitter.emit('stable');
    });

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
            var cancel = invoker(inv, api);
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

    invocations.forEach(function(cancel, invocation) {
      if (acc.has(invocation)) return;
      try {
        cancel();
      } catch (err) {
        console.error(err);
        // TODO push internal error
      }
    });

    invocations = acc;
  }

  function exit() {
    invocations.forEach(function(cancel) {
      try {
        cancel();
      } catch (err) {
        console.error(err);
      }
    });
    datamodel.exit();
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

    stop: function() {
      isRunning = false;
      if (!step) exit();
    },

    send: function(event) {
      if (typeof event === 'string') event = {name: event};
      emitter.emit('event', event);
      if (!step) return step = handleExternalEvent(event);
      externalEvents.push(event);
      return step;
    },

    raise: function(event) {
      if (typeof event === 'string') event = {name: event};
      emitter.emit('event', event);
      if (!step) return step = handleInternalEvent(event);
      internalEvents.push(event);
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

  datamodel = api.datamodel = doc.init({
    isActive: api.isActive,
    raise: api.raise,
    send: function send(event) {
      var type = event.type || SCXML_SEND_TYPE;
      var target = event.target;

      try {
        var sender = type === SCXML_SEND_TYPE && !target || target === "#_internal" ?
          api :
          ioprocessors[type];

        if (sender) {
          var receipt = maybeDelay(sender, event, api);
          if (!receipt || !receipt.cancel || !event.id) return;

          var id = event.id;
          pendingSends.set(id, receipt);

          function onDone() {
            pendingSends.delete(id);
          }

          receipt
            .then(onDone.bind(null, null))
            .catch(onDone);
        } else {
          console.error('Invalid send type', event);
        }
      } catch (err) {
        console.error(err);
        // TODO push internal error
      }
    },
    cancel: function(id) {
      var promise = pendingSends.get(id);
      if (promise && promise.cancel) return promise.cancel();
    }
  }, ioprocessors);

  return api;
}

function maybeDelay(sender, event, api) {
  var delay = event.delay;
  if (typeof delay === 'undefined') return sender.send(event, api);
  return new CancelablePromise(function(resolve) {
    setTimeout(function() {
      resolve(sender.send(event, api));
    }, parseDuration(delay));
  });
}
