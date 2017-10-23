import { test } from 'ava';
import { newDefaultScheduler } from '@most/scheduler';
import { Sink, Scheduler } from '@most/types';
import { Platform, IOProcessorEvent } from '@statechart/platform';
import { Document, StateType, TransitionType } from '@statechart/scexe';
import { IDatamodel, EInvocationCommandType } from '@statechart/types';
import { StreamSink } from '@statechart/util-most';
import { createSCXMLPlatform } from './';

type Configuration = any;
type Event = { name: string } & IOProcessorEvent;
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
        this.internalEvents.event(this.scheduler.currentTime(), { name, type: '' });
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

function throws(t: any, fn: any) {
  return t.throws(new Promise(() => fn()));
}

test('it should work', async (t) => {
  const events = new StreamSink();
  const invocations = new StreamSink();
  const outgoingEvents = {
    event() {

    },
    error() {

    },
    end() {},
  };
  const platform = new Platform(events, invocations);
  const scheduler = newDefaultScheduler();

  platform.use(createSCXMLPlatform(createDatamodel));

  const disposable = platform.run(outgoingEvents, scheduler);

  await throws(t, () => {
    events.event(0, {});
  });

  await throws(t, () => {
    events.event(0, {
      type: 'http://www.w3.org/TR/scxml/#SCXMLEventProcessor',
    });
  });

  await throws(t, () => {
    events.event(0, {
      type: 'http://www.w3.org/TR/scxml/#SCXMLEventProcessor',
      target: 'foo',
    });
  });

  const firstDoc: Document<Executable> = {
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
        onInit: [],
        onEnter: [],
        onExit: [],
        transitions: [0],
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
        transitions: [1],
        children: [1, 3],
        hasHistory: false,
      },
    ],
    transitions: [
      {
        type: TransitionType.EXTERNAL,
        idx: 0,
        source: 1,
        targets: [2],
        conflicts: [1],
        exits: [1],
        onTransition: [],
        event: ({ name }: any) => name === 'event1',
      },
      {
        type: TransitionType.EXTERNAL,
        idx: 1,
        source: 2,
        targets: [1],
        conflicts: [0],
        exits: [2],
        onTransition: [],
        event: ({ name }: any) => name === 'event2',
      },
    ],
  };

  invocations.event(0, {
    id: 'first',
    type: EInvocationCommandType.OPEN,
    invocation: {
      type: 'http://www.w3.org/TR/scxml/',
      content: firstDoc,
    },
  });

  invocations.event(0, {
    id: 'first',
    type: EInvocationCommandType.CLOSE,
    invocation: {
      type: 'http://www.w3.org/TR/scxml/',
      content: firstDoc,
    },
  });

  disposable.dispose();
});
