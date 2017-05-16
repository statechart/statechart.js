import { props } from './util';

export default function param(node, check) {
  props(node, check, {
    'name': true,
    'expr': false,
    'location': false,
  });

  var properties = node.properties;
  check(
    !(properties.expr && properties.location),
    'prop-conflict',
    '<param> must specify either the "expr" or "location" attribute, but not both',
    node
  );
};
