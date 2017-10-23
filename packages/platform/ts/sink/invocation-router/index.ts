import { Disposable, Time, Scheduler, Sink } from '@most/types';
import { IInvocationCommand, EInvocationCommandType } from '@statechart/types';
import { ThroughSink } from '@statechart/util-most';
import { Router } from '../router/index';

export interface InvocationEvent {
  type: string;
}

export interface InvocationInstance<Event, Invocation> {
  run(
    events: Sink<Event>,
    invocation: Sink<IInvocationCommand<Invocation>>,
    scheduler: Scheduler,
  ): Disposable;
}

export type Invoker<Event, Invocation> =
  (t: Time, invocation: Invocation, id: string, scheduler: Scheduler)
    => InvocationInstance<Event, Invocation>;

export type InvokerMap<Event, Invocation> =
  Map<string, Invoker<Event, Invocation>>;

export class InvocationRouter<
  Event,
  Invocation extends InvocationEvent
> extends Router<
  IInvocationCommand<Invocation>,
  Event,
  Invoker<Event, Invocation>
> {

  getType({ invocation }: IInvocationCommand<Invocation>) {
    return invocation !== undefined ?
      invocation.type :
      undefined;
  }

  getId({ id }: IInvocationCommand<Invocation>) {
    return id;
  }

  init(
    t: Time,
    x: IInvocationCommand<Invocation>,
    sink: Sink<Event>,
    scheduler: Scheduler,
    processor: Invoker<Event, Invocation>,
  ): Disposable | void {
    const { disposables } = this;
    const { id, type, invocation } = x;

    if (type === EInvocationCommandType.CLOSE) {
      const disposable = disposables.get(id);
      if (disposable !== undefined) disposable.dispose();
      return;
    }

    const instance = processor(t, invocation, id, scheduler);

    const invocationSink = new UnendableSink(this);

    return instance.run(
      sink,
      invocationSink,
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
