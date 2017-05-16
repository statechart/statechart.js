import { props } from './util';

export default function script(node, check) {
  props(node, check, {
    'src': false,
  });

  // TODO check expr vs children
};
