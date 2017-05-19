import createSandbox from './sandbox';

export function load(ast) {
  // TODO
}

export function init(api, ioprocessors) {
  var sandbox = createSandbox({
    _ioprocessors: ioprocessors,
    In: api.isActive,
    __raise: api.raise,
    __send: api.send,
  });

  var pending = [];

  var datamodel = Object.assign({
    push: function(str) {
      try {
        var value = sandbox.exec(str);
      } catch (err) {
        // TODO send error into api
      }
      if (value && value.then) pending.push(value);
      return datamodel;
    },

    event: function(event) {
      sandbox.global._event = event;
      return datamodel;
    },

    flush: function() {
      var p = pending;
      pending = [];
      return Promise
        .all(p)
        .then(function() {
          sandbox.global._event = null;
          return Promise.resolve(datamodel);
        })
        .catch(function(error) {
          sandbox.global._event = null;
          // TODO send error into api
          return Promise.reject(error);
        });
    }
  }, sandbox);

  return datamodel;
}
