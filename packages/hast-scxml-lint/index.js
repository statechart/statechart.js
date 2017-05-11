var visit = require('unist-util-visit');

var elements = {
  scxml: require('./lib/scxml'),
  state: require('./lib/state'),
  parallel: require('./lib/parallel'),
  transition: require('./lib/transition'),
  initial: require('./lib/initial'),
  final: require('./lib/final'),
  onentry: require('./lib/onentry'),
  onexit: require('./lib/onexit'),
  history: require('./lib/history'),

  raise: require('./lib/raise'),
  'if': require('./lib/if'),
  elseif: require('./lib/elseif'),
  'else': require('./lib/else'),
  foreach: require('./lib/foreach'),
  log: require('./lib/log'),

  datamodel: require('./lib/datamodel'),
  data: require('./lib/data'),
  assign: require('./lib/assign'),
  donedata: require('./lib/donedata'),
  content: require('./lib/content'),
  param: require('./lib/param'),
  script: require('./lib/script'),

  send: require('./lib/send'),
  cancel: require('./lib/cancel'),
  invoke: require('./lib/invoke'),
  finalize: require('./lib/finalize'),
};

module.exports = function lint(opts) {
  opts = opts || {};
  return function transformer(ast, file) {
    visit(ast, 'element', function(node) {
      var n = node.tagName;
      var fn = elements[n];
      if (fn) fn(node, function check(isValid, opt, description, node, rule) {
        if (opts[n + '-' + opt] !== false && !isValid) {
          var msg = file.message(description, node, rule || n + '-' + opt);
          msg.source = '@statechart/hast-scxml-lint';
        }
      });
    });
  };
};
