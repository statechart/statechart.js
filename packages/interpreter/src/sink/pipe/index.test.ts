import { test } from 'ava';
import { Pipe } from './';

class Instance extends Pipe<number, boolean> {
  event(t: number, x: number) {
    return this.sink.event(t, x > 5);
  }
}

test('ready task', (t) => {
  t.plan(7);

  const sink = {
    event(time: number, b: boolean) {
      t.true(typeof time === 'number');
      t.true(typeof b === 'boolean');
    },
    end(time: number) {
      t.true(typeof time === 'number');
    },
    error(time: number, e: Error) {
      t.true(typeof time === 'number');
      t.true(e instanceof Error);
    }
  };

  const i = new Instance(sink);

  i.event(0, 1);
  i.event(0, 6);
  i.end(0);
  i.error(0, new Error('foo'));
});
