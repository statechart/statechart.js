import { props, childTypes } from './util';

const validChildren = {
  'param': true,
  'finalize': [0, 1],
  'content': [0, 1]
};

export default function invoke(node, check) {
  props(node, check, {
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
  var childCounts = childTypes(node, check, validChildren);

  var properties = node.properties;
  check(
    !(childCounts.param && properties.namelist),
    'child-type-conflict',
    '<invoke> must specify either a single <content> element or a "namelist" attribute',
    node
  );
};
