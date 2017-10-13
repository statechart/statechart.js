import { test, TestContext } from 'ava';
import { MicrostepSink } from './';
import { IDatamodelSink, Configuration } from '../../types';

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

type Executable = (t: number) => any;
class DatamodelSink<Data> extends Sink implements IDatamodelSink<Data, Executable> {
  public $event: any;

  event(_t: number, e: any) {
    this.$event = e;
  }

  configuration(_t: number, _c: Configuration) {

  }

  exec(t: number, e: Executable) {
    return e(t);
  }

  query(e: Executable) {
    return e(0);
  }
}

test.cb('microstep', (t) => {
  t.plan(8);

  const sink = new Sink(t);
  const datamodel = new DatamodelSink(t);

  sink.event = (time: number, configuration: Configuration) => {
    if (time === 0.5) {
      t.deepEqual(configuration, [0, 2]);
      microstep.event(1, {
        name: 'first',
      });
      return;
    }

    if (time === 1) {
      t.deepEqual(configuration, [0, 2]);
      return;
    }

    t.fail(`unhandled time ${time}`);
  };

  datamodel.error = sink.error = (time: number, _e: Error) => {
    t.true(time === 2);
  };

  datamodel.end = sink.end = (time: number) => {
    t.true(time === 3);
  };

  const document = {
    states: [
      {
        idx: 0,
        completion: [1],
        invocations: [],
        parent: 0,
        ancestors: [],
        descendants: [1, 2],
        onEnter: [],
        onExit: [],
        data: [],
      },
      {
        idx: 1,
        completion: [],
        invocations: [],
        parent: 0,
        ancestors: [0],
        descendants: [],
        onEnter: [],
        onExit: [],
        data: [],
      },
      {
        idx: 2,
        completion: [],
        invocations: [],
        parent: 0,
        ancestors: [0],
        descendants: [],
        onEnter: [],
        onExit: [],
        data: [],
      },
    ],
    transitions: [
      {
        type: 'eventless',
        idx: 0,
        source: 1,
        targets: [2],
        conflicts: [1],
        exits: [1],
        onTransition: [
          (time: number) => {
            t.true(true);
            microstep.event(time + 0.5);
          },
        ],
        events: null,
      },
      {
        type: 'event',
        idx: 1,
        source: 2,
        targets: [1],
        conflicts: [0],
        exits: [2],
        onTransition: [],
        events: ({ name }: any) => name === 'first',
      },
    ],
  };

  const microstep = new MicrostepSink(sink, datamodel, document);

  microstep.event(0);
  microstep.error(2, new Error('foo'));

  setTimeout(() => {
    microstep.end(3);
    t.end();
  }, 1)
});
