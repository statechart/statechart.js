var util = require('./util');

var validChildren = {
  'state': true,
  'parallel': true,
  'final': true,
  'datamodel': [0, 1],
  'script': [0, 1],
};

module.exports = function scxml(node, check) {
  util.props(node, check, {
    'version': '1.0',
    'binding': ['early', 'late'],
    'initial': false,
    'name': false,
    'datamodel': false,
  });

  var childCounts = util.childTypes(node, check, validChildren);

  check(
    childCounts.state || childCounts.parallel || childCounts.final,
    'child-state-count',
    '<scxml> must have at least one <state>, <parallel> or <final> child',
    node
  );
};
