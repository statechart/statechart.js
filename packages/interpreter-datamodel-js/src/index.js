import createSandbox from './sandbox';
export { default as load } from './loader';

export function init(api, ioprocessors) {
  var sandbox = createSandbox({
    _ioprocessors: ioprocessors,
    In: api.isActive,
    _raise: api.raise,
    _send: api.send,
    _cancel: api.cancel,
    _log: function(props) {
      // TODO
      console.log(props);
    },
    _foreach: foreach,
  });

  var pending = [];

  var datamodel = Object.assign({
    push: function(str) {
      try {
        var value = sandbox.exec(str);
      } catch (err) {
        // TODO send error into api
        console.error(err);
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

function foreach(collection, fn) {
  var out = [];
  if (!collection) return out;

  var i = 0;

  if (typeof collection.length === 'number') {
    for (var l = collection.length; i < l; i++) {
      fn(collection[i], i);
    }
  } else if (typeof collection[Symbol.iterator] === 'function') {
    for (var value of iterable) {
      fn(value, i++);
    }
  } else {
    Object.keys(collection).forEach(function(k) {
      fn(collection[k], k);
    });
  }

  return out;
}
