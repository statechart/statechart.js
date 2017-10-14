import { test, TestContext } from 'ava';
import { Configuration } from '@statechart/interpreter-microstep';
import { MacrostepSink } from './';

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

test('macrostep', (t) => {
  t.plan(19);

  const eventSink = new Sink(t);
  const configurationSink = new Sink(t);
  const invocationSink = new Sink(t);

  configurationSink.event = (time: number, configuration: Configuration) => {
    t.deepEqual(configuration, new Set());
    if (time === 6) sink.event(6.5, new Set());
  };

  configurationSink.end = (time: number) => {
    t.deepEqual(time, 9);
  };

  eventSink.event = (time: number, event: any) => {
    if (time === 0) return t.true(event.name === 'internal1');
    if (time === 1) {
      t.true(event.name === 'internal2');
      sink.event(2, new Set());
      return;
    }
    if (time === 2) return t.true(event.name === 'external1');
    if (time === 3) {
      t.true(event.name === 'external2');
      sink.event(4, new Set());
      return;
    }
    if (time === 5) return t.true(event.name === 'internal3');
    if (time === 8) return t.true(event.name === 'should happen');
    t.fail();
  };

  eventSink.error = (time: number, _error: Error) => {
    t.true(time === 7);
  };

  eventSink.end = (time: number) => {
    t.true(time === 9);
  };

  invocationSink.event = (time: number, _configuration: any) => {
    t.true(time === 2 || time === 3 || time === 4 || time === 6 || time === 6.5 || time === 8);
  };

  invocationSink.end = (time: number) => {
    t.true(time === 9);
  };

  const sink = new MacrostepSink(eventSink, configurationSink, invocationSink);

  sink.raise(0, {
    name: 'internal1'
  });
  sink.send(0, {
    name: 'external1'
  });
  sink.send(0, {
    name: 'external2',
  });
  sink.raise(0, {
    name: 'internal2',
  });

  sink.event(0, new Set());
  sink.event(1, new Set());
  // 2 is triggered inside the event sink
  sink.event(3, new Set());
  // 4 is triggered inside the event sink

  sink.raise(5, {
    name: 'internal3',
  });

  sink.event(6, new Set());
  // 6.5 is triggered inside the configuration sink

  sink.error(7, new Error('foo'));

  sink.send(8, { name: 'should happen' });
  sink.send(8, { name: 'shouldnt happen' });

  sink.end(9);

  sink.raise(10, {
    name: 'shouldnt happen',
  });
  sink.send(10, {
    name: 'shouldnt happen',
  });

  sink.event(10, new Set());
  sink.event(9, new Set());
});
