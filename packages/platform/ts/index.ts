import { Stream, Scheduler, Sink, Disposable } from '@most/types';
import { IInvocationCommand } from '@statechart/types';
import {
  Invoker,
  InvokerMap,
  InvocationEvent,
  InvocationRouter,
  InvocationInstance,
} from './sink/invocation-router/index';
import {
  IOProcessor,
  IOProcessorMap,
  IOProcessorEvent,
  IOProcessorRouter,
} from './sink/ioprocessor-router/index';

export {
  Invoker,
  InvokerMap,
  IOProcessor,
  IOProcessorMap,
  IOProcessorEvent,
  InvocationEvent,
  InvocationInstance,
};

export class PlatformInvocations<Event, Invocation extends InvocationEvent>
    implements Stream<Event> {
  private invocations: Stream<IInvocationCommand<Invocation>>;
  private invokers: InvokerMap<Event, Invocation>;

  constructor(
    invocations: Stream<IInvocationCommand<Invocation>>,
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

export class PlatformEvents<Event extends IOProcessorEvent> implements Stream<Event> {
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

export function withInvocations<Event, Invocation extends InvocationEvent>(
  invokers: InvokerMap<Event, Invocation>,
  invocations: Stream<IInvocationCommand<Invocation>>,
) {
  return new PlatformInvocations(invocations, invokers);
}

export function withIOProcessors<Event extends IOProcessorEvent>(
  ioprocessors: IOProcessorMap<Event>,
  events: Stream<Event>,
) {
  return new PlatformEvents(events, ioprocessors);
}
