import { Disposable, Scheduler, Sink, Time } from '@most/types';
import { IDatamodel, IInvocationCommand } from '@statechart/types';
import { Invoker, InvocationInstance } from '@statechart/platform';
import {
   Interpreter,
   Configuration,
   Invocation as InterpreterInvocation,
} from '@statechart/interpreter';
import { Document } from '@statechart/scexe';
import { StreamSink, ThroughSink } from '@statechart/util-most';

export type MapSink<Event> = Map<string, Sink<Event>>;

export interface SCXMLInvocation<Executable> {
  content: Document<Executable>;
}

export type SCXMLDatamodel<Event, Executable> =
  IDatamodel<Configuration, Event, Executable>;

export type createDatamodel<Event, Executable> =
  (scheduler: Scheduler, sessionId: string) => SCXMLDatamodel<Event, Executable>;

class SCXMLInterpreterInstance<Invocation, Content, Event, Executable>
    implements InvocationInstance<Event, InterpreterInvocation<Content>>,
               Sink<Event> {

  private invocation: Invocation & SCXMLInvocation<Executable>;
  private datamodel: SCXMLDatamodel<Event, Executable>;
  private interpreter: Interpreter<Event, Executable>;
  private sink: Sink<Event>;
  private configurationSink: Sink<Configuration>;

  constructor(
    invocation: Invocation & SCXMLInvocation<Executable>,
    datamodel: SCXMLDatamodel<Event, Executable>,
    configurationSink: Sink<Configuration>,
  ) {
    this.invocation = invocation;
    this.datamodel = datamodel;
    this.configurationSink = configurationSink;
    const incomingEvents = this.sink = new StreamSink();
    const document = invocation.content;
    this.interpreter = new Interpreter(incomingEvents, datamodel, document);
  }

  run(
    outgoingEvents: Sink<Event>,
    outgoingInvocations: Sink<IInvocationCommand<Invocation & InterpreterInvocation<any>>>,
    scheduler: Scheduler,
  ): Disposable {
    const { configurationSink, interpreter } = this;
    // TODO wrap outgoingEvents so they have the correct origin id and type
    // TODO wrap the outgoingInvocations so they have the correct origin id and type
    return interpreter.run(
      outgoingEvents,
      outgoingInvocations,
      configurationSink,
      scheduler,
    );
  }

  event(t: Time, x: Event) {
    this.sink.event(t, x);
  }

  error() {}
  end() {}
}

export interface ConfigurationEvent {
  configuration: Configuration;
  sessionId: string;
}

const noopSink = {
  event() {},
  error() {},
  end() {},
};

class ConfigurationThroughSink extends ThroughSink<Configuration, ConfigurationEvent> {
  private sessionId: string;
  constructor(sink: Sink<ConfigurationEvent>, sessionId: string) {
    super();
    this.sink = sink;
    this.sessionId = sessionId;
  }

  event(t: Time, configuration: Configuration) {
    const { sessionId, sink } = this;
    sink.event(t, { configuration, sessionId });
  }
}

export function createSCXMLInterpreter<Invocation, Event, Executable>(
  createDatamodel: createDatamodel<Event, Executable>,
  sinks: MapSink<Event>,
  configurationSink: Sink<ConfigurationEvent> = noopSink,
): Invoker<Event, Invocation & SCXMLInvocation<Executable>> {
  return (
    _T: Time,
    invocation: Invocation & SCXMLInvocation<Executable>,
    sessionId: string,
    scheduler: Scheduler,
  ) => {
    const datamodel = createDatamodel(scheduler, sessionId);

    const confSink = new ConfigurationThroughSink(configurationSink, sessionId);

    const instance = new SCXMLInterpreterInstance(invocation, datamodel, confSink);

    sinks.set(sessionId, instance);

    return instance;
  };
}
