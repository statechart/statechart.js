import { test } from 'ava';
import { Time } from '@most/types';
import {
  IOProcessor,
  IOProcessorMap,
  IOProcessorRouter,
  PlatformEvent,
} from './';

type Event = {} & PlatformEvent;

test('it should work', async (t) => {
  t.plan(5);

  const ioprocessors: IOProcessorMap<Event> = new Map();

  const first: IOProcessor<Event> = {
    event(time: Time, _X: Event) {
      t.true(time === 0);
    },
    end(time: Time) {
      t.true(time === 2);
    },
  };

  const second: IOProcessor<Event> = {
    event(time: Time, _X: Event) {
      t.true(time === 1);
    },
    end(time: Time) {
      t.true(time === 2);
    },
  };

  ioprocessors.set('first', first);
  ioprocessors.set('second', second);

  const router = new IOProcessorRouter(ioprocessors);

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
