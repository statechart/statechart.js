var util = require('./util');

module.exports = function donedata(node, check) {
  util.props(node, check, {});
  var childCounts = util.childTypes(node, check, {
    'content': [0, 1],
    'param': true
  });

  check(
    !(childCounts.content && childCounts.param),
    'child-type-conflict',
    '<donedata> must specify either a single <content> element or one or more <param> elements',
    node
  );
};
