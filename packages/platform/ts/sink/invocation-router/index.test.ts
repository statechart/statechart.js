import { test } from 'ava';
import { Time, Scheduler, Sink } from '@most/types';
import { newDefaultScheduler } from '@most/scheduler';
import { IInvocationCommand, EInvocationCommandType } from '@statechart/types';
import {
  Invoker,
  InvokerMap,
  InvocationEvent,
  InvocationInstance,
  InvocationRouter,
} from './';

type Event = {};
type Invocation = {} & InvocationEvent;
type Command = IInvocationCommand<Invocation>;

test('invocation router', async (t) => {
  t.plan(13);

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

    run(eventSink: Sink<Event>, invocationSink: Sink<Command>, _S: Scheduler) {
      const { time, invocationTarget } = this;
      eventSink.event(time, {});

      if (typeof invocationTarget === 'string') invocationSink.event(time, {
        id: invocationTarget,
        type: EInvocationCommandType.OPEN,
        invocation: {
          type: invocationTarget,
        },
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
    id: 'first',
    type: EInvocationCommandType.OPEN,
    invocation: {
      type: 'first',
    },
  });

  router.event(1, {
    id: 'second',
    type: EInvocationCommandType.OPEN,
    invocation: {
      type: 'second',
    },
  });

  router.event(1.5, {
    id: 'first',
    type: EInvocationCommandType.CLOSE,
    invocation: {
      type: 'first',
    },
  });

  router.event(1.5, {
    id: 'fooboar',
    type: EInvocationCommandType.CLOSE,
    invocation: {
      type: 'second',
    },
  });

  await t.throws(new Promise(() => {
    router.event(2, {
      id: 'unknown',
      type: EInvocationCommandType.OPEN,
      invocation: {
        type: 'unknown',
      },
    });
  }));

  router.error(2, new Error('shouldnt do anything - mainly for code coverage'));

  router.end(2);
});
