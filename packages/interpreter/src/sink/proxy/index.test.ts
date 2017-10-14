import { test } from 'ava';
import { ProxySink } from './';

test('internal events', (t) => {
  t.plan(4);

  const p = new ProxySink();

  p.sink = {
    event(time: number, b: boolean) {
      t.true(time === 0);
      t.true(b);
    },
    error(time: number, _E: Error) {
      t.true(time === 1);
    },
    end(time: number) {
      t.true(time === 2);
    },
  };

  p.event(0, true);
  p.error(1, new Error('foo'));
  p.end(2);
});
