import { props, childTypes } from './util';

export default function donedata(node, check) {
  props(node, check, {});
  var childCounts = childTypes(node, check, {
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
