import { test, TestContext } from 'ava';
import { ExternalEventRouter, INTERNAL } from './';

class Sink {
  private t: TestContext;

  constructor(t: TestContext) {
    this.t = t;
  }

  event(_T: number, _B: any) {
    this.t.fail();
  }

  end(_T: number) {
    this.t.fail();
  }

  error(_T: number, _E: Error) {
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
    type: INTERNAL,
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
    type: '#_external',
  });
});

test('clean up', (t) => {
  t.plan(3);

  const internal = new Sink(t);
  const external = new Sink(t);

  internal.error = external.error = (time: number, _E: Error) => {
    t.true(time === 0);
  };

  external.end = (time: number) => {
    t.true(time === 1);
  };

  const r = new ExternalEventRouter(internal, external);

  r.error(0, new Error('foo'));
  r.end(1);
});
