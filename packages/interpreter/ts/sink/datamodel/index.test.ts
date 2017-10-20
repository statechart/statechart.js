import { test, TestContext } from 'ava';
import { newDefaultScheduler } from '@most/scheduler';
import { DatamodelSink } from './';

class Datamodel {
  public internalEvents: any;
  public externalEvents: any;

  public $error?: Error;
  public $end?: boolean;
  public $event?: any;
  public $configuration?: any;
  public $get?: boolean;

  get() {
    return this.$get = true;
  }

  exec(executable: (() => Promise<any>)) {
    return executable();
  }

  error(error: Error) {
    this.$error = error;
  }

  query(executable: (() => any)) {
    return executable();
  }

  end() {
    this.$end = true;
  }

  setEvent(event: any) {
    this.$event = event;
  }

  setConfiguration(configuration: any) {
    this.$configuration = configuration;
  }
}

class Sink<Event> {
  private t: TestContext;

  constructor(t: TestContext) {
    this.t = t;
  }

  event(_t: number, _b: Event) {
    this.t.fail();
  }

  end(_t: number) {
    this.t.fail();
  }

  error(_t: number, _e: Error) {
    this.t.fail();
  }
}

test.cb('event', (t) => {
  t.plan(1);

  const sink = new Sink(t);
  const datamodel = new Datamodel();
  const scheduler = newDefaultScheduler();

  sink.event = (_t: number, _x: any) => {
    t.end();
  };

  const s = new DatamodelSink(sink, datamodel, scheduler);

  const event = { name: 'event' };
  s.event(0, event);
  t.true(datamodel.$event === event);

  s.exec(0, () => true);
});

test('configuration', (t) => {
  t.plan(1);

  const sink = new Sink(t);
  const datamodel = new Datamodel();
  const scheduler = newDefaultScheduler()

  const s = new DatamodelSink(sink, datamodel, scheduler);

  const configuration = new Set([0,1]);
  s.configuration(0, configuration);
  t.true(datamodel.$configuration === configuration);
});

test.cb('exec', (t) => {
  t.plan(2);

  const sink = new Sink<undefined>(t);
  const datamodel = new Datamodel();
  const scheduler = newDefaultScheduler();

  sink.event = function(time: number, b: undefined) {
    t.true(typeof time === 'number');
    t.true(typeof b === 'undefined');
    t.end();
  };

  const s = new DatamodelSink(sink, datamodel, scheduler);

  s.exec(0, () => new Promise((resolve) => setTimeout(resolve, 10)));
  s.exec(0, () => new Promise((resolve) => setTimeout(resolve, 15)));
  s.exec(0, () => 50);
});

test.cb('exec error', (t) => {
  t.plan(1);

  const sink = new Sink<undefined>(t);
  const datamodel = new Datamodel();
  const scheduler = newDefaultScheduler();
  const s = new DatamodelSink(sink, datamodel, scheduler);

  const err = new Error('foo');

  s.exec(0, () => { throw err; });

  setTimeout(() => {
    t.true(datamodel.$error == err);
    t.end();
  }, 1);
});

test('query', (t) => {
  const sink = new Sink(t);
  const datamodel = new Datamodel();
  const scheduler = newDefaultScheduler();

  const s = new DatamodelSink(sink, datamodel, scheduler);

  t.true(s.query(() => true));
});

test.cb('error', (t) => {
  t.plan(2);

  const sink = new Sink(t);
  const datamodel = new Datamodel();
  const scheduler = newDefaultScheduler();

  const s = new DatamodelSink(sink, datamodel, scheduler);

  const err = new Error('foo');
  s.error(0, err);

  t.true(datamodel.$error === err);

  datamodel.$error = undefined;

  s.exec(1, () => Promise.reject(err));

  setTimeout(() => {
    t.true(datamodel.$error === err);
    t.end();
  }, 0);
});

test('end', (t) => {
  t.plan(2);

  const sink = new Sink(t);
  const datamodel = new Datamodel();
  const scheduler = newDefaultScheduler();

  sink.end = (time: number) => {
    t.true(time === 0);
  };

  const s = new DatamodelSink(sink, datamodel, scheduler);

  s.end(0);

  t.true(datamodel.$end);
});
