import { test } from 'ava';
import { Time, Scheduler, Sink } from '@most/types';
import { newDefaultScheduler } from '@most/scheduler';
import {
  Invoker,
  InvokerMap,
  InvocationInstance,
  InvocationRouter,
  PlatformInvocation,
} from './';

type Event = {};
type Invocation = {} & PlatformInvocation;

test('it should work', async (t) => {
  t.plan(21);

  const invokers: InvokerMap<Event, Invocation> = new Map();

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

      if (invocationTarget) invocationSink.event(time, {
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

  const first: Invoker<Event, Invocation> = {
    event(time: Time, _X: Invocation) {
      t.true(time === 0);
      return new Instance(time, 'third');
    },
    end(time: Time) {
      t.true(time === 2);
    },
  };

  const second: Invoker<Event, Invocation> = {
    event(time: Time, _X: Invocation) {
      t.true(time === 1);
      return new Instance(time, 'third');
    },
    end(time: Time) {
      t.true(time === 2);
    },
  };

  const third: Invoker<Event, Invocation> = {
    event(time: Time, _X: Invocation) {
      t.true(time === 0 || time === 1);
      return new Instance(time);
    },
    end(time: Time) {
      t.true(time === 2);
    },
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
