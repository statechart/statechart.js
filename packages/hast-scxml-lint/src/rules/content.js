import { props } from './util';

export default function content(node, check) {
  props(node, check, {
    'expr': false
  });

  // TODO check expr vs children
};
