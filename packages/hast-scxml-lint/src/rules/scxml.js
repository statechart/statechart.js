import { props, childTypes } from './util';

const validChildren = {
  'state': true,
  'parallel': true,
  'final': true,
  'datamodel': [0, 1],
  'script': [0, 1],
};

export default function scxml(node, check) {
  props(node, check, {
    'version': false,
    'binding': ['early', 'late'],
    'initial': false,
    'name': false,
    'datamodel': false,
  });

  var childCounts = childTypes(node, check, validChildren);

  check(
    childCounts.state || childCounts.parallel || childCounts.final,
    'child-state-count',
    '<scxml> must have at least one <state>, <parallel> or <final> child',
    node
  );
};
