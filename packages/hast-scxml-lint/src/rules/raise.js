import { props } from './util';

export default function raise(node, check) {
  props(node, check, {
    'event': true
  });
};
