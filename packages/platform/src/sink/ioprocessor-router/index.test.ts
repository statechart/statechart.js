import { test } from 'ava';
import { Time, Scheduler, Sink, Stream } from '@most/types';
import { newDefaultScheduler } from '@most/scheduler';
import { RoutableEvent } from '../router/index';
import {
  IOProcessor,
  IOProcessorMap,
  IOProcessorRouter,
} from './';

type Event = {} & RoutableEvent;

test('ioprocessor router', async (t) => {
  t.plan(5);

  const ioprocessors: IOProcessorMap<Event> = new Map();

  const eventSink = {
    event(time: Time, { type }: Event) {
      if (time === 0) return t.true(type === 'first');
      if (time === 1) return t.true(type === 'second');
      if (time === 2) return t.true(type === 'first');
      t.fail();
    },
    error(_T: Time, _E: Error) {
      t.fail();
    },
    end(time: Time) {
      t.true(time === 2);
    },
  };

  class Instance<Event> implements Stream<Event> {
    events: Stream<Event>;

    constructor(events: Stream<Event>) {
      this.events = events;
    }

    run(sink: Sink<Event>, scheduler: Scheduler) {
      return this.events.run(sink, scheduler);
    }
  }

  const first: IOProcessor<Event> = (events: Stream<Event>) => {
    return new Instance(events);
  };

  const second: IOProcessor<Event> = (events: Stream<Event>) => {
    return new Instance(events);
  };

  ioprocessors.set('first', first);
  ioprocessors.set('second', second);

  const scheduler = newDefaultScheduler();

  const router = new IOProcessorRouter(eventSink, scheduler, ioprocessors);

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

  router.event(2, {
    type: 'first',
  });

  router.end(2);
});
