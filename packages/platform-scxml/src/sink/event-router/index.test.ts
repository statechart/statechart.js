import { test } from 'ava';
import { Time, Sink } from '@most/types';
import { EventRouterSink, RoutableEvent, InvalidTargetError } from './';

test('it should work', (t) => {
  t.plan(9);

  const sinks = new Map<string, Sink<RoutableEvent>>();

  sinks.set('a', {
    event(time: Time, { target, origin }: RoutableEvent) {
      t.true(time === 0);
      t.true(target === 'a');
      t.true(origin === 'b');
    },
    error(_T: Time, _E: Error) {
      t.fail();
    },
    end(time: Time) {
      t.true(time === 4);
    },
  });

  sinks.set('b', {
    event(_T: Time, _X: RoutableEvent) {

    },
    error(time: Time, { target, origin }: InvalidTargetError<RoutableEvent>) {
      t.true(time === 1);
      t.true(target === 'invalid');
      t.true(origin === 'b');
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
