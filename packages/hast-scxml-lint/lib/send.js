var util = require('./util');

var validChildren = {
  'param': true,
  'content': [0, 1]
};

module.exports = function send(node, check) {
  util.props(node, check, {
    'event': {
      type: 'alias',
      suffix: 'expr',
      required: true
    },
    'target': {
      type: 'alias',
      suffix: 'expr'
    },
    'type': {
      type: 'alias',
      suffix: 'expr'
    },
    'id': {
      type: 'alias',
      suffix: 'location'
    },
    'delay': {
      type: 'alias',
      suffix: 'expr'
    },
    'namelist': false
  });
  var childCounts = util.childTypes(node, check, validChildren);

  check(
    !(childCounts.content && childCounts.param),
    'child-type-conflict',
    '<send> must specify either a single <content> element or one or more <param> elements',
    node
  );

  var props = node.properties;
  check(
    !(childCounts.content && props.namelist),
    'child-type-conflict',
    '<send> must specify either a single <content> element or a "namelist" attribute',
    node
  );
};
