import { Disposable, Scheduler, Sink, Stream } from '@most/types';
import { Configuration } from '@statechart/interpreter-microstep';
import { IDatamodel } from '@statechart/types';
import { Document } from '@statechart/scexe';
import { InvocationCommand } from './types/index';
import { ExternalEventRouter, RoutableEvent } from './sink/external-event-router/index';
import { ExternalEventSink } from './sink/external-event/index';
import { InternalEventSink } from './sink/internal-event/index';
import { InvocationSink } from './sink/invocation/index';
import { DatamodelSink } from './sink/datamodel/index';
import { MacrostepSink } from './sink/macrostep/index';
import { MicrostepSink } from './sink/microstep/index';
import { Proxy } from './sink/proxy/index';

export type Event = { name: string } & RoutableEvent;

export { Configuration };

export class Interpreter<Executable> {
  private datamodel: IDatamodel<Configuration, Event, Executable>;
  private document: Document<Executable>;
  private events: Stream<Event>;

  constructor(
    events: Stream<Event>,
    datamodel: IDatamodel<Configuration, Event, Executable>,
    document: Document<Executable>,
  ) {
    this.datamodel = datamodel;
    this.document = document;
    this.events = events;
  }

  run(
    eventsSink: Sink<Event>,
    invocations: Sink<InvocationCommand<Executable>>,
    configuration: Sink<Configuration>,
    scheduler: Scheduler,
  ): Disposable {
    const { datamodel, document } = this;
    const invocationSink = new InvocationSink(invocations, document, datamodel);

    const datamodelEvent = new Proxy<Event>();
    const datamodelSink = new DatamodelSink(datamodelEvent, datamodel, scheduler);

    const microstepConfiguration = new Proxy();
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
