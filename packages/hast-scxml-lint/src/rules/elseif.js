import { props } from './util';

export default function elseif(node, check) {
  props(node, check, {
    'cond': true
  });
};
