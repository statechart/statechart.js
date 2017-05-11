var util = require('./util');

var validChildren = Object.assign(
  {
    'elseif': true,
    'else': [0, 1]
  },
  require('./executable')
);

module.exports = function if_(node, check) {
  util.props(node, check, {
    'cond': true
  });
  util.childTypes(node, check, validChildren);
};
