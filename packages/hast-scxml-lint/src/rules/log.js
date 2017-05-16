import { props } from './util';

export default function log(node, check) {
  props(node, check, {
    'label': false,
    'expr': false,
  });
};
