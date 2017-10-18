import { test } from 'ava';
import { Time, Scheduler, Sink } from '@most/types';
import { newDefaultScheduler } from '@most/scheduler';
import { RoutableEvent } from '../router/index';
import {
  Invoker,
  InvokerMap,
  InvocationInstance,
  InvocationRouter,
} from './';

type Event = {};
type Invocation = {} & RoutableEvent;

test('invocation router', async (t) => {
  t.plan(14);

  const invokers: InvokerMap<Event, Invocation>
    = new Map();

  const eventSink = {
    event(time: Time, _X: Event) {
      t.true(time === 0 || time === 1);
    },
    error(_T: Time, _E: Error) {
      t.fail();
    },
    end(time: Time) {
      t.true(time === 2);
    },
  };

  class Instance implements InvocationInstance<Event, Invocation> {
    time: Time;
    invocationTarget?: string;

    constructor(time: Time, invocationTarget?: string) {
      this.time = time;
      this.invocationTarget = invocationTarget;
    }

    run(eventSink: Sink<Event>, invocationSink: Sink<Invocation>, _S: Scheduler) {
      const { time, invocationTarget } = this;
      eventSink.event(time, {});
      eventSink.end(time); // shouldn't do anything - just for coverage

      if (typeof invocationTarget === 'string') invocationSink.event(time, {
        type: invocationTarget,
      });

      t.pass();
      return {
        dispose() {
          t.pass();
        },
      };
    }
  }

  const first: Invoker<Event, Invocation> = (t: Time, _I: Invocation) => {
    return new Instance(t, 'third');
  };

  const second: Invoker<Event, Invocation> = (t: Time, _I: Invocation) => {
    return new Instance(t, 'third');
  };

  const third: Invoker<Event, Invocation> = (t: Time, _I: Invocation) => {
    return new Instance(t);
  };

  invokers.set('first', first);
  invokers.set('second', second);
  invokers.set('third', third);

  const scheduler = newDefaultScheduler();

  const router = new InvocationRouter(eventSink, scheduler, invokers);

  router.event(0, {
    type: 'first',
  });

  router.event(1, {
    type: 'second',
  });

  await t.throws(new Promise(() => {
    router.event(2, {
      type: 'unknown',
    });
  }));

  router.error(2, new Error('shouldnt do anything - mainly for code coverage'));

  router.end(2);
});
