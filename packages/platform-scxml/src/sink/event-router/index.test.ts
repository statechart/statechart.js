import { test } from 'ava';
import { Time } from '@most/types';
import { EventRouterSink, RoutableEvent, InvalidTargetError } from './';

test('it should work', (t) => {
  t.plan(9);

  const sinks = new Map();

  sinks.set('a', {
    event(time: Time, x: RoutableEvent) {
      t.true(time === 0);
      t.true(x.target === 'a');
      t.true(x.origin === 'b');
    },
    end(time: Time) {
      t.true(time === 4);
    },
  });

  sinks.set('b', {
    error(time: Time, e: InvalidTargetError<RoutableEvent>) {
      t.true(time === 1);
      t.true(e.target === 'invalid');
      t.true(e.origin === 'b');
    },
    end(time: Time) {
      t.true(time === 4);
    },
  });

  const sink = new EventRouterSink(sinks);

  sink.event(0, { target: 'a', origin: 'b' });
  sink.event(1, { target: 'invalid', origin: 'b' });

  sink.error(2, new Error('foo'));

  return t.throws(new Promise(() => {
    sink.event(3, { target: 'invalid', origin: 'also invalid' });
  })).then(() => {
    sink.end(4);
  });
});
