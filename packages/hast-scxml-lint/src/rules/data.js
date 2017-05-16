import { props } from './util';

export default function data(node, check) {
  props(node, check, {
    'id': true,
    'src': false,
    'expr': false
  });

  // TODO check expr vs children
};
