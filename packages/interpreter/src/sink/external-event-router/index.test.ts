import { test, TestContext } from 'ava';
import { EventType } from '@statechart/types';
import { ExternalEventRouter } from './';

class Sink {
  private t: TestContext;

  constructor(t: TestContext) {
    this.t = t;
  }

  event(_t: number, _b: any) {
    this.t.fail();
  }

  end(_t: number) {
    this.t.fail();
  }

  error(_t: number, _e: Error) {
    this.t.fail();
  }
}

test.cb('_internal', (t) => {
  t.plan(2);

  const internal = new Sink(t);
  const external = new Sink(t);

  internal.event = (time: number, event: any) => {
    t.true(typeof time === 'number');
    t.true(event.name === 'event');
    t.end();
  };

  const r = new ExternalEventRouter(internal, external);

  r.event(0, {
    name: 'event',
    type: EventType.INTERNAL,
  });
});

test.cb('external', (t) => {
  t.plan(2);

  const internal = new Sink(t);
  const external = new Sink(t);

  external.event = (time: number, event: any) => {
    t.true(typeof time === 'number');
    t.true(event.name === 'event');
    t.end();
  };

  const r = new ExternalEventRouter(internal, external);

  r.event(0, {
    name: 'event',
    type: EventType.EXTERNAL,
  });
});

test('clean up', (t) => {
  t.plan(3);

  const internal = new Sink(t);
  const external = new Sink(t);

  internal.error = external.error = (time: number, _error: Error) => {
    t.true(time === 0);
  };

  external.end = (time: number) => {
    t.true(time === 1);
  };

  const r = new ExternalEventRouter(internal, external);

  r.error(0, new Error('foo'));
  r.end(1);
});
