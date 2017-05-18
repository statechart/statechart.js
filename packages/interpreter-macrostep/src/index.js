import Emitter from 'events';
import { init, handleEvent, synchronize } from '@statechart/interpreter-microstep';

export default function createInterpreter(document, ioprocessors, invokers) {
  var isRunning = false;
  var step;
  var emitter = new Emitter();

  var invocations = [];
  var pendingInvocations = [];
  var pendingCancellations = [];
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

    invoke: function(invocation) {
      pendingInvocations.push(invocation);
    },

    uninvoke: function(invocation) {
      pendingCancellations.push(invocation);
    },
  };

  function handleError(err) {
    // TODO
  }

  function macrostep() {
    var event;
    if (event = internalEvents.pop()) return handleInternalEvent(event);
    if (!isRunning) return exit();

    // TODO invoke

    if (internalEvents.length) return macrostep();

    if (event = externalEvents.pop()) return handleExternalEvent(event);

    step = null;
    // TODO emit stable event
    return Promise.resolve(state.configuration);
  }

  function handleInternalEvent(event) {
    state = handleEvent(backend, document, state, event);
    return datamodel
      .event(event)
      .flush()
      .then(function() {
        state = synchronize(backend, document, state);
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

    state = handleEvent(backend, document, state, event);
    return datamodel
      .flush()
      .then(macrostep)
      .catch(handleError);
  }

  function exit() {
    // TODO
  }

  var api = {
    events: emitter,

    start: function() {
      isRunning = true;
      state = init(backend, document);
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

    raise: function(event) {
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

    isActive: function(state) {
      if (Array.isArray(state)) {
        return state.every(function(s) { return api.isActive(s); });
      }
      // TODO
      return false;
    },
  };

  datamodel = document.init({
    isActive: api.isActive,
    raise: api.raise,
    send: function(event) {
      // TODO
    },
  }, ioprocessors);

  return api;
}
