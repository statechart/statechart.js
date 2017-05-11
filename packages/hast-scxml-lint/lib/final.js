var util = require('./util');

var validChildren = {
  'onentry': true,
  'onexit': true,
  'donedata': [0, 1],
};

module.exports = function final(node, check) {
  util.props(node, check, {
    'id': false
  });
  util.childTypes(node, check, validChildren);
};
