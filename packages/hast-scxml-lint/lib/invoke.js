var util = require('./util');

var validChildren = {
  'param': true,
  'finalize': [0, 1],
  'content': [0, 1]
};

module.exports = function send(node, check) {
  util.props(node, check, {
    'type': {
      type: 'alias',
      suffix: 'expr'
    },
    'src': {
      type: 'alias',
      suffix: 'expr'
    },
    'id': {
      type: 'alias',
      suffix: 'location'
    },
    'namelist': false,
    'autoforward': ['true', 'false']
  });
  var childCounts = util.childTypes(node, check, validChildren);

  var props = node.properties;
  check(
    !(childCounts.param && props.namelist),
    'child-type-conflict',
    '<invoke> must specify either a single <content> element or a "namelist" attribute',
    node
  );
};
