import { test, TestContext } from 'ava';
import { Sink as ISink } from '@most/types';
import { newDefaultScheduler } from '@most/scheduler';
import { Configuration, IDatamodel, IEvent } from '@statechart/types';
import { StateType, TransitionType } from '@statechart/scexe';
import { toArray } from '@statechart/util-set';
import Interpreter from './';

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

type Executable = (d: any, context: any) => any;
class Datamodel<Data> implements IDatamodel<Data, Executable> {
  public internalEvents: ISink<IEvent<Data>>;
  public externalEvents: ISink<IEvent<Data>>;

  private d: any;
  private context: any;
  private configuration: Configuration;
  private scheduler: any;

  constructor(scheduler: any) {
    this.scheduler = scheduler;
    this.d = {};
    this.context = {
      raise: (name: string) => {
        this.internalEvents.event(this.scheduler.currentTime(), { name });
      },
      In: (idx: number) => {
        return this.configuration.has(idx);
      },
    };
  }

  get() {
    return this.d;
  }

  exec(executable: Executable) {
    return executable(this.d, this.context);
  }

  error(_error: Error) {

  }

  query(executable: Executable) {
    return executable(this.d, this.context);
  }

  end() {

  }

  setEvent(event: any) {
    this.d._event = event;
  }

  setConfiguration(configuration: Configuration) {
    this.configuration = configuration;
  }
}

class Stream<V> {
  sink: any;
  isRunning: boolean;

  run(sink: any, _scheduler: any) {
    this.isRunning = true;
    this.sink = sink;
    return {
      dispose: () => this.isRunning = false,
    };
  }

  push(t: number, v: V) {
    if (this.isRunning) this.sink.event(t, v);
  }
}

test.cb('interpreter', (t) => {
  t.plan(3);

  const scheduler = newDefaultScheduler();

  const inputEvents = new Stream();
  const datamodel = new Datamodel(scheduler);
  const document = {
    states: [
      {
        type: StateType.COMPOUND,
        idx: 0,
        completion: [1],
        invocations: [],
        parent: 0,
        ancestors: [],
        descendants: [1, 2],
        onInit: [],
        onEnter: [],
        onExit: [],
        transitions: [],
        children: [1, 2],
        hasHistory: false,
      },
      {
        type: StateType.ATOMIC,
        idx: 1,
        completion: [],
        invocations: [],
        parent: 0,
        ancestors: [0],
        descendants: [],
        onInit: [],
        onEnter: [],
        onExit: [],
        transitions: [0, 2],
        children: [],
        hasHistory: false,
      },
      {
        type: StateType.ATOMIC,
        idx: 2,
        completion: [],
        invocations: [],
        parent: 0,
        ancestors: [0],
        descendants: [],
        onInit: [],
        onEnter: [],
        onExit: [],
        transitions: [],
        children: [1, 3],
        hasHistory: false,
      },
    ],
    transitions: [
      {
        type: TransitionType.EXTERNAL,
        idx: 0,
        onTransition: [
          (_data: any, { raise }: any) => raise('internal_first'),
          () => Promise.resolve(true),
        ],
        source: 1,
        targets: [2],
        conflicts: [1, 2, 3],
        exits: [1],
        events: ({ name }: any) => name === 'first',
        condition: (_: any, { In }: any) => In(1),
      },
      {
        type: TransitionType.EXTERNAL,
        idx: 1,
        source: 2,
        targets: [1],
        conflicts: [0, 2, 3],
        exits: [2],
        onTransition: [],
        events: ({ name }: any) => name === 'internal_first',
      },
      {
        type: TransitionType.EXTERNAL,
        idx: 2,
        source: 1,
        targets: [2],
        conflicts: [0, 1, 3],
        exits: [1],
        onTransition: [],
        events: ({ name }: any) => name === 'second',
      },
      {
        type: TransitionType.EXTERNAL,
        idx: 3,
        source: 2,
        targets: [1],
        conflicts: [0, 1, 2],
        exits: [2],
        onTransition: [],
        events: ({ name }: any) => name === 'third',
      }
    ],
  };

  const interpreter = new Interpreter(inputEvents, datamodel, document);

  const outputEvents = new Sink(t);
  const invocations = new Sink(t);
  const configurationSink = new Sink(t);

  let i = 0;
  configurationSink.event = (_time: number, configuration: Configuration) => {
    switch (i++) {
      case 0:
        t.deepEqual(toArray(configuration), [0, 1]);
        break;
      case 1:
        t.deepEqual(toArray(configuration), [0, 2]);
        break;
      case 2:
        t.deepEqual(toArray(configuration), [0, 1]);
        t.end();
        break;
      default:
        t.fail();
        break;
    }
  };

  interpreter.run(outputEvents, invocations, configurationSink, scheduler);

  inputEvents.push(scheduler.currentTime(), {
    name: 'first',
  });
  inputEvents.push(scheduler.currentTime(), {
    name: 'second',
  });

  setTimeout(() => {
    inputEvents.push(scheduler.currentTime(), {
      name: 'third',
    });
  }, 1);
});
