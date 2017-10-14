import { Time, Stream, Scheduler, Sink, Disposable } from '@most/types';

export interface IOProcessor<Event> {
  event(t: Time, event: Event): any;
}
export type IOProcessorMap<Event> = Map<string, IOProcessor<Event>>;

export type Invoker<Event> = (invocation: Invocation) => Stream<Event>;
export type InvokerMap<Event> = Map<string, Invoker<Event>>;

export interface Invocation {
  type: string;
}

export class InvocationError extends Error {
  invocation: Invocation;

  constructor(invocation: Invocation) {
    super(`Invocation error`);
    this.invocation = invocation;
  }
}

export class PlaformSink<Event> implements Sink<Invocation> {
  private sink: Sink<Event>;
  private scheduler: Scheduler;
  private ioprocessors: IOProcessorMap<Event>;
  private invokers: InvokerMap<Event>;
  private disposables: Disposable[];

  constructor(
    sink: Sink<Event>,
    scheduler: Scheduler,
    ioprocessors: IOProcessorMap<Event>,
    invokers: InvokerMap<Event>,
  ) {
    this.sink = sink;
    this.scheduler = scheduler;
    this.ioprocessors = ioprocessors;
    this.invokers = invokers;
    this.disposables = [];
  }

  event(t: Time, invocation: Invocation) {
    const { invokers } = this;
    const { type } = invocation;
    const invoker = invokers.get(type);
    if (typeof invoker !== 'undefined') {
      this.invoke(invoker, invocation);
    } else {
      const error = new InvocationError(invocation);
      this.error(t, error);
    }
  }

  invoke(invoker: Invoker<Event>, invocation: Invocation) {
    const { sink, scheduler, disposables } = this;
    // TODO make a in sink for this instance
    // TODO make an out sink for this instance
    const instance = invoker(invocation);
    const disposable = instance.run(sink, scheduler);
    const { dispose } = disposable;
    disposable.dispose = () => {
      this.disposables = this.disposables.filter(d => d !== disposable);
      dispose.apply(disposable);
    };
    disposables.push(disposable);
  }

  error(t: Time, e: Error) {
    this.sink.error(t, e);
  }

  end(t: Time) {
    const { disposables, sink } = this;
    disposables.forEach((disposable) => {
      disposable.dispose();
    });
    this.disposables = [];
    sink.end(t);
  }
}
