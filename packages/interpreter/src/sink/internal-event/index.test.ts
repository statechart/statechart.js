import { test } from 'ava';
import { InternalEventSink } from './';

test('internal events', (t) => {
  t.plan(2);

  const sink = {
    event(_t: number, _b: any) {
      t.fail();
    },
    end(_t: number) {
      t.fail();
    },
    error(_t: number, _e: Error) {
      t.fail();
    },
    raise(time: number, b: any) {
      t.true(typeof time === 'number');
      t.true(b);
    },
  };

  const e = new InternalEventSink(sink);

  e.event(0, true);
});
