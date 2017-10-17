import { Stream, Scheduler, Sink, Disposable } from '@most/types';
import { disposeBoth } from '@most/disposable';
import { InvocationRouter, InvokerMap, PlatformInvocation } from './sink/invocation-router/index';
import { IOProcessorRouter, IOProcessorMap, PlatformEvent } from './sink/ioprocessor-router/index';

export { InvokerMap, IOProcessorMap, PlatformEvent, PlatformInvocation };

export class Platform<Event extends PlatformEvent, Invocation> implements Stream<Event> {
  private events: Stream<Event>;
  private invocations: Stream<Invocation>;
  private ioprocessors: IOProcessorMap<Event>;
  private invokers: InvokerMap<Event, Invocation>;

  constructor(
    events: Stream<Event>,
    invocations: Stream<Invocation>,
    ioprocessors: IOProcessorMap<Event>,
    invokers: InvokerMap<Event, Invocation>,
  ) {
    this.events = events;
    this.invocations = invocations;
    this.ioprocessors = ioprocessors;
    this.invokers = invokers;
  }

  run(_S: Sink<Event>, scheduler: Scheduler): Disposable {
    const { ioprocessors, invokers, events, invocations } = this;
    const ioprocessorRouter = new IOProcessorRouter<Event>(ioprocessors);
    const invocationRouter = new InvocationRouter(ioprocessorRouter, scheduler, invokers);
    const eventDisposable = events.run(ioprocessorRouter, scheduler);
    const invocationDisposable = invocations.run(invocationRouter, scheduler);
    return disposeBoth(eventDisposable, invocationDisposable);
  }
}
