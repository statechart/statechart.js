import { Disposable, Scheduler, Sink, Time } from '@most/types';
import { IDatamodel } from '@statechart/types';
import { Invoker, InvocationInstance } from '@statechart/platform';
import { Interpreter, Configuration } from '@statechart/interpreter';
import { Document } from '@statechart/scexe';
import { StreamSink } from '@statechart/util-most';

export type MapSink<Event> = Map<string, Sink<Event>>;

export interface SCXMLInvocation<Executable> {
  content: Document<Executable>;
}

export type SCXMLDatamodel<Event, Executable> =
  IDatamodel<Configuration, Event, Executable>;

export type createDatamodel<Event, Executable> =
  (sessionId: string) => SCXMLDatamodel<Event, Executable>;

class SCXMLInterpreterInstance<Event, Invocation extends SCXMLInvocation<Executable>, Executable>
    implements InvocationInstance<Event, Invocation>,
               Sink<Event> {
  private invocation: Invocation;
  private datamodel: SCXMLDatamodel<Event, Executable>;
  private interpreter: Interpreter<Event, Executable>;
  private sink: Sink<Event>;

  constructor(invocation: Invocation, datamodel: SCXMLDatamodel<Event, Executable>) {
    this.invocation = invocation;
    this.datamodel = datamodel;
    const incomingEvents = this.sink = new StreamSink();
    const document = invocation.content;
    this.interpreter = new Interpreter(incomingEvents, datamodel, document);
  }

  run(
    outgoingEvents: Sink<Event>,
    outgoingInvocations: Sink<Invocation>,
    scheduler: Scheduler,
  ): Disposable {
    const { interpreter } = this;
    // TODO wrap outgoingEvents so they have the correct origin id and type
    // TODO wrap the outgoingInvocations so they have the correct origin id and type
    return interpreter.run(outgoingEvents, outgoingInvocations, configuration, scheduler);
  }

  event(t: Time, x: Event) {
    this.sink.event(t, x);
  }

  error(t: Time, e: Error) {
    this.sink.error(t, e);
  }

  end(t: Time) {
    this.sink.end(t);
  }
}

export function createSCXMLInterpreter<Event, Invocation, Executable>(
  createDatamodel: createDatamodel<Event, Executable>,
  sinks: MapSink<Event>,
): Invoker<Event, Invocation> {
  return (_T: Time, invocation: Invocation & SCXMLInvocation<Executable>) => {
    const sessionId = '123';
    const datamodel = createDatamodel(sessionId);

    const instance = new SCXMLInterpreterInstance(invocation, datamodel);

    sinks.set(sessionId, instance);

    return instance;
  };
}
