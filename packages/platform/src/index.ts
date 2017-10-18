import { Stream, Scheduler, Sink, Disposable } from '@most/types';
import { RoutableEvent } from './sink/router/index';
import { InvocationRouter, InvokerMap } from './sink/invocation-router/index';
import { IOProcessorRouter, IOProcessorMap } from './sink/ioprocessor-router/index';

export { InvokerMap, IOProcessorMap, RoutableEvent };

export class PlatformInvocations<Event, Invocation extends RoutableEvent> implements Stream<Event> {
  private invocations: Stream<Invocation>;
  private invokers: InvokerMap<Event, Invocation>;

  constructor(
    invocations: Stream<Invocation>,
    invokers: InvokerMap<Event, Invocation>,
  ) {
    this.invocations = invocations;
    this.invokers = invokers;
  }

  run(events: Sink<Event>, scheduler: Scheduler): Disposable {
    const { invokers, invocations } = this;
    const invocationRouter = new InvocationRouter(events, scheduler, invokers);
    return invocations.run(invocationRouter, scheduler);
  }
}

export class PlatformEvents<Event extends RoutableEvent> implements Stream<Event> {
  private events: Stream<Event>;
  private ioprocessors: IOProcessorMap<Event>;

  constructor(
    events: Stream<Event>,
    ioprocessors: IOProcessorMap<Event>,
  ) {
    this.events = events;
    this.ioprocessors = ioprocessors;
  }

  run(outgoingEvents: Sink<Event>, scheduler: Scheduler): Disposable {
    const { events, ioprocessors } = this;
    const eventRouter = new IOProcessorRouter(outgoingEvents, scheduler, ioprocessors);
    return events.run(eventRouter, scheduler);
  }
}

export function withInvocations<Event, Invocation extends RoutableEvent>(
  invokers: InvokerMap<Event, Invocation>,
  invocations: Stream<Invocation>,
) {
  return new PlatformInvocations(invocations, invokers);
}

export function withIOProcessors<Event extends RoutableEvent>(
  ioprocessors: IOProcessorMap<Event>,
  events: Stream<Event>,
) {
  return new PlatformEvents(events, ioprocessors);
}
