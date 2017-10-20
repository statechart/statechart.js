import { test } from 'ava';
import { ExternalEventSink } from './';

test('external events', (t) => {
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
    send(time: number, b: any) {
      t.true(typeof time === 'number');
      t.true(b);
    },
  };

  const e = new ExternalEventSink(sink);

  e.event(0, true);
});
