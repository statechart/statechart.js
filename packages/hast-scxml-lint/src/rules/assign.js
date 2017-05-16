import { props } from './util';

export default function assign(node, check) {
  props(node, check, {
    'location': true,
    'expr': false
  });

  // TODO check expr vs children
};
