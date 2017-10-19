import { Disposable, Scheduler, Sink, Stream } from '@most/types';
import { Configuration } from '@statechart/interpreter-microstep';
import { IDatamodel, IInvocationCommand } from '@statechart/types';
import { Document } from '@statechart/scexe';
import {
  ExternalEventRouter,
  RoutableEvent,
  ExternalEvent,
} from './sink/external-event-router/index';
import { ExternalEventSink } from './sink/external-event/index';
import { InternalEventSink } from './sink/internal-event/index';
import { InvocationSink, Invocation } from './sink/invocation/index';
import { DatamodelSink } from './sink/datamodel/index';
import { MacrostepSink } from './sink/macrostep/index';
import { MicrostepSink } from './sink/microstep/index';
import { ProxySink } from './sink/proxy/index';

export type IncomingEvent = RoutableEvent;
export type OutgoingEvent = ExternalEvent;

export { Configuration, Invocation };

export class Interpreter<Event, Executable> {
  private datamodel: IDatamodel<Configuration, Event, Executable>;
  private document: Document<Executable>;
  private events: Stream<Event>;

  constructor(
    events: Stream<Event & IncomingEvent>,
    datamodel: IDatamodel<Configuration, Event, Executable>,
    document: Document<Executable>,
  ) {
    this.datamodel = datamodel;
    this.document = document;
    this.events = events;
  }

  run(
    eventsSink: Sink<Event & OutgoingEvent>,
    invocations: Sink<IInvocationCommand<Invocation<Executable>>>,
    configuration: Sink<Configuration>,
    scheduler: Scheduler,
  ): Disposable {
    const { datamodel, document } = this;
    const invocationSink = new InvocationSink(invocations, document, datamodel);

    const datamodelEvent = new ProxySink<Event>();
    const datamodelSink = new DatamodelSink(datamodelEvent, datamodel, scheduler);

    const microstepConfiguration = new ProxySink<Configuration>();
    const microstep = new MicrostepSink(microstepConfiguration, datamodelSink, document);
    datamodelEvent.sink = microstep;

    const macrostep = new MacrostepSink(microstep, configuration, invocationSink);
    microstepConfiguration.sink = macrostep;

    const internalEventSink = new InternalEventSink(macrostep);
    const externalEventSink = new ExternalEventSink(macrostep);

    datamodel.internalEvents = internalEventSink;
    datamodel.externalEvents = new ExternalEventRouter(externalEventSink, eventsSink);

    const disposable = this.events.run(externalEventSink, scheduler);

    // initialize the configuration
    microstep.event(scheduler.currentTime());

    return disposable;
  }
}
