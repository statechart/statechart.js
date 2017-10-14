import { Stream, Scheduler, Sink, Disposable } from '@most/types';
import { PlaformSink, Invocation, IOProcessorMap, InvokerMap } from './sink/platform/index';

export class Plaform<Event> implements Stream<Event> {
  private invocations: Stream<Invocation>;
  private ioprocessors: IOProcessorMap<Event>;
  private invokers: InvokerMap<Event>;

  constructor(
    invocations: Stream<Invocation>,
    ioprocessors: IOProcessorMap<Event>,
    invokers: InvokerMap<Event>,
  ) {
    this.invocations = invocations;
    this.ioprocessors = ioprocessors;
    this.invokers = invokers;
  }

  run(sink: Sink<Event>, scheduler: Scheduler): Disposable {
    const { invocations, ioprocessors, invokers } = this;
    const platformSink = new PlaformSink(sink, scheduler, ioprocessors, invokers);
    return invocations.run(platformSink, scheduler);
  }
}
