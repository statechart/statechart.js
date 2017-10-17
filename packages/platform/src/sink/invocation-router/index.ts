import { Time, Scheduler, Sink, Disposable } from '@most/types';

export interface InvocationInstance<Event, Invocation> {
  run(eventSink: Sink<Event>, invocationSink: Sink<Invocation>, scheduler: Scheduler): Disposable;
}

export interface Invoker<Event, Invocation> {
  event(t: Time, invocation: Invocation): InvocationInstance<Event, Invocation>;
  end(t: Time): any;
}
export type InvokerMap<Event, Invocation> = Map<string, Invoker<Event, Invocation>>;

export interface PlatformInvocation {
  type: string;
}

export class InvocationError<Invocation> extends Error {
  invocation: Invocation & PlatformInvocation;
  type: string;

  constructor(invocation: Invocation & PlatformInvocation) {
    const { type } = invocation;
    super(`Unknown invoker ${JSON.stringify(type)}`);
    this.invocation = invocation;
    this.type = type;
  }
}

class UnendableSink<Event> implements Sink<Event> {
  private sink: Sink<Event>;

  constructor(sink: Sink<Event>) {
    this.sink = sink;
  }

  event(t: Time, x: Event) {
    this.sink.event(t, x);
  }

  error(t: Time, e: Error) {
    this.sink.error(t, e);
  }

  end(_T: Time) {

  }
}

export class InvocationRouter<Event, Invocation> implements Sink<Invocation & PlatformInvocation> {
  private sink: Sink<Event>;
  private scheduler: Scheduler;
  private invokers: InvokerMap<Event, Invocation>;
  private disposables: Set<Disposable>;

  constructor(
    sink: Sink<Event>,
    scheduler: Scheduler,
    invokers: InvokerMap<Event, Invocation>,
  ) {
    this.sink = sink;
    this.scheduler = scheduler;
    this.invokers = invokers;
    this.disposables = new Set();
  }

  event(t: Time, invocation: Invocation & PlatformInvocation) {
    const { invokers } = this;
    const { type } = invocation;
    const invoker = invokers.get(type);
    if (typeof invoker !== 'undefined') {
      this.invoke(t, invocation, invoker);
    } else {
      throw new InvocationError(invocation);
    }
  }

  invoke(t: Time, invocation: Invocation, invoker: Invoker<Event, Invocation>) {
    const { sink, scheduler, disposables } = this;
    const instance = invoker.event(t, invocation);
    const disposable = instance.run(
      new UnendableSink(sink),
      new UnendableSink(this),
      scheduler,
    );
    const { dispose } = disposable;
    disposable.dispose = () => {
      disposables.delete(disposable);
      dispose.apply(disposable);
    };
    disposables.add(disposable);
  }

  error(_T: Time, _E: Error) {
    // noop
  }

  end(t: Time) {
    const { disposables, invokers, sink } = this;
    disposables.forEach((disposable) => {
      disposable.dispose();
    });
    disposables.clear();
    invokers.forEach((invoker) => {
      invoker.end(t);
    });
    sink.end(t);
  }
}
