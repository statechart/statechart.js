import { test, TestContext } from 'ava';
import { Configuration } from '@statechart/interpreter-microstep';
import { Document, StateType, TransitionType } from '@statechart/scexe';
import { toArray } from '@statechart/util-set';
import { MicrostepSink, IDatamodelSink } from './';

class Sink {
  private t: TestContext;

  constructor(t: TestContext) {
    this.t = t;
  }

  event(_R: number, _V: any) {
    this.t.fail();
  }

  end(_R: number) {
    this.t.fail();
  }

  error(_R: number, _E: Error) {
    this.t.fail();
  }
}

type Executable = (t: number) => any;
class DatamodelSink<Data> extends Sink implements IDatamodelSink<Data, Executable> {
  public $event: any;

  event(_R: number, e: any) {
    this.$event = e;
  }

  configuration(_R: number, _C: Configuration) {

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
      t.deepEqual(toArray(configuration), [0, 2]);
      microstep.event(1, {
        name: 'first',
      });
      return;
    }

    if (time === 1) {
      t.deepEqual(toArray(configuration), [0, 2]);
      return;
    }

    t.fail(`unhandled time ${time}`);
  };

  datamodel.error = sink.error = (time: number, _E: Error) => {
    t.true(time === 2);
  };

  datamodel.end = sink.end = (time: number) => {
    t.true(time === 3);
  };

  const document: Document<any> = {
    states: [
      {
        type: StateType.COMPOUND,
        idx: 0,
        completion: [1],
        invocations: [],
        parent: 0,
        ancestors: [],
        onInit: [],
        onEnter: [],
        onExit: [],
        hasHistory: false,
        transitions: [],
        children: [1, 2],
      },
      {
        type: StateType.ATOMIC,
        idx: 1,
        completion: [],
        invocations: [],
        parent: 0,
        ancestors: [0],
        onInit: [],
        onEnter: [],
        onExit: [],
        hasHistory: false,
        transitions: [0],
        children: [],
      },
      {
        type: StateType.ATOMIC,
        idx: 2,
        completion: [],
        invocations: [],
        parent: 0,
        ancestors: [0],
        onInit: [],
        onEnter: [],
        onExit: [],
        hasHistory: false,
        transitions: [1],
        children: [],
      },
    ],
    transitions: [
      {
        type: TransitionType.SPONTANEOUS,
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
        event: undefined,
      },
      {
        type: TransitionType.EXTERNAL,
        idx: 1,
        source: 2,
        targets: [1],
        conflicts: [0],
        exits: [2],
        onTransition: [],
        event: ({ name }: any) => name === 'first',
      },
    ],
  };

  const microstep = new MicrostepSink(sink, datamodel, document);

  microstep.event(0);
  microstep.error(2, new Error('foo'));

  setTimeout(
    () => {
      microstep.end(3);
      t.end();
    },
    1,
  );
});
