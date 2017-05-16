import { props, childTypes } from './util';

const validChildren = {
  'param': true,
  'content': [0, 1],
};

export default function send(node, check) {
  props(node, check, {
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
  var childCounts = childTypes(node, check, validChildren);

  check(
    !(childCounts.content && childCounts.param),
    'child-type-conflict',
    '<send> must specify either a single <content> element or one or more <param> elements',
    node
  );

  var properties = node.properties;
  check(
    !(childCounts.content && properties.namelist),
    'child-type-conflict',
    '<send> must specify either a single <content> element or a "namelist" attribute',
    node
  );
};
