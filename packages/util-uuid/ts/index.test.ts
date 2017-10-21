import { test } from 'ava';
import uuid from './'; //tslint:disable-line

test('uuid', (t) => {
  t.true(typeof uuid() === 'string');
});
