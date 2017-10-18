import { Disposable, Time, Scheduler, Sink } from '@most/types';
import { ThroughSink } from '@statechart/util-most';
import { Router } from '../router/index';

export interface InvocationInstance<Event, Invocation> {
  run(
    events: Sink<Event>,
    invocation: Sink<Invocation>,
    scheduler: Scheduler,
  ): Disposable;
}

export type Invoker<Event, Invocation> =
  (t: Time, invocation: Invocation) => InvocationInstance<Event, Invocation>;

export type InvokerMap<Event, Invocation> =
  Map<string, Invoker<Event, Invocation>>;

export class InvocationRouter<Event, Invocation>
    extends Router<Invocation, Event, Invoker<Event, Invocation>> {
  init(
    t: Time,
    x: Invocation,
    sink: Sink<Event>,
    scheduler: Scheduler,
    processor: Invoker<Event, Invocation>,
  ): Disposable | void {
    const invocation = processor(t, x);

    return invocation.run(
      new UnendableSink(sink),
      new UnendableSink(this),
      scheduler,
    );
  }
}

class UnendableSink<Event> extends ThroughSink<Event, Event> {
  constructor(sink: Sink<Event>) {
    super();
    this.sink = sink;
  }

  event(t: Time, x: Event) {
    this.sink.event(t, x);
  }

  end(_T: Time) {
    // noop
  }
}
