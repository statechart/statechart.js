import { props } from './util';

export default function cancel(node, check) {
  props(node, check, {
    'sendid': {
      type: 'alias',
      suffix: 'expr',
      required: true
    }
  });
};
