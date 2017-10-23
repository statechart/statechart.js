import { test } from 'ava';
import { Time, Scheduler, Sink } from '@most/types';
import { newDefaultScheduler } from '@most/scheduler';
import { IDatamodel } from '@statechart/types';
import { Configuration } from '@statechart/interpreter';
import { StateType, TransitionType } from '@statechart/scexe';
import { createSCXMLInterpreter, SCXMLInvocation, ConfigurationEvent } from './';
import { toArray } from '@statechart/util-set';

type Event = { name: string };
type Executable = (d: any, context: any) => any;
class Datamodel implements IDatamodel<Configuration, Event, Executable> {
  public internalEvents: Sink<Event>;
  public externalEvents: Sink<Event>;

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
      send: (event: Event) => {
        this.externalEvents.event(this.scheduler.currentTime(), event);
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

  error(_E: Error) {

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

function createDatamodel(scheduler: Scheduler, _S: string) {
  return new Datamodel(scheduler);
}

test('it should work', (t) => {
  t.plan(5);

  const sinks = new Map();
  const scheduler = newDefaultScheduler();

  const configurations = new Map();
  const configurationSink = {
    event(_T: Time, x: ConfigurationEvent) {
      configurations.set(x.sessionId, x.configuration);
    },
    error() {},
    end() {},
  };

  const invoker = createSCXMLInterpreter(createDatamodel, sinks, configurationSink);

  const invocation: SCXMLInvocation<Executable> = {
    content: {
      states: [
        {
          type: StateType.COMPOUND,
          idx: 0,
          completion: [1],
          invocations: [],
          parent: 0,
          ancestors: [],
          onInit: [],
          onEnter: [
            (_: any, { send }: any) => send({
              name: 'rootEnter',
              type: '#external',
            }),
          ],
          onExit: [],
          transitions: [],
          children: [1, 2],
          hasHistory: false,
        },
        {
          type: StateType.ATOMIC,
          idx: 1,
          completion: [],
          invocations: [
            {
              type: () => 'scxml',
              src: () => 'src',
              id: () => 'child',
              autoforward: false,
              content: () => 'testing',
              onExit: [],
            },
          ],
          parent: 0,
          ancestors: [0],
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
          onTransition: [],
          source: 1,
          targets: [2],
          conflicts: [1, 2, 3],
          exits: [1],
          event: ({ name }: any) => name === 'first',
        },
      ],
    },
  };

  const interpreter = invoker(0, invocation, 'A', scheduler);

  const outgoingEvents = {
    event(_T: Time, x: Event) {
      t.true(x.name === 'rootEnter');
    },
    error() {},
    end() {},
  };
  const outgoingInvocations = {
    event(_T: Time, { type }: any) {
      t.true(type === 0 || type === 1);
    },
    error() {},
    end() {},
  };

  const disposable = interpreter.run(
    outgoingEvents,
    outgoingInvocations,
    scheduler,
  );

  const sink = sinks.get('A');

  if (!sink) throw new Error('Sink was not registered');

  t.deepEqual(toArray(configurations.get('A')), [0, 1]);

  sink.event(scheduler.currentTime(), {
    name: 'first',
  });

  sink.error(scheduler.currentTime(), new Error('foo'));

  t.deepEqual(toArray(configurations.get('A')), [0, 2]);

  disposable.dispose();

  sink.end(scheduler.currentTime());
});
