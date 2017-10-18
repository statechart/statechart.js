import { Disposable, Time, Scheduler, Sink } from '@most/types';

export interface RoutableEvent {
  type: string;
}

export class RoutingError<Event> extends Error {
  event: Event & RoutableEvent;
  type: string;

  constructor(event: Event & RoutableEvent) {
    const { type } = event;
    super(`Unknown ioprocessor ${JSON.stringify(type)}`);
    this.event = event;
    this.type = type;
  }
}

export type ProcessorMap<Processor> = Map<string, Processor>;

export abstract class Router<InEvent, OutEvent, Processor>
    implements Sink<InEvent & RoutableEvent> {
  protected sink: Sink<OutEvent>;
  protected scheduler: Scheduler;
  protected processors: ProcessorMap<Processor>;
  protected disposables: Set<Disposable>;

  constructor(sink: Sink<OutEvent>, scheduler: Scheduler, processors: ProcessorMap<Processor>) {
    this.sink = sink;
    this.scheduler = scheduler;
    this.processors = processors;
    this.disposables = new Set();
  }

  abstract init(
    t: Time,
    x: InEvent,
    sink: Sink<OutEvent>,
    scheduler: Scheduler,
    processor: Processor,
  ): Disposable | void;

  event(t: Time, x: InEvent & RoutableEvent) {
    const { type } = x;
    const { sink, scheduler, processors, disposables } = this;
    const processor = processors.get(type);
    if (typeof processor === 'undefined') throw new RoutingError(x);

    const disposable = this.init(t, x, sink, scheduler, processor);

    if (typeof disposable !== 'undefined') {
      const { dispose } = disposable;
      disposable.dispose = () => {
        disposables.delete(disposable);
        dispose.apply(disposable);
      };
      disposables.add(disposable);
    }
  }

  error(_T: Time, _E: Error) {
    // noop
  }

  end(t: Time) {
    const { disposables, sink } = this;
    disposables.forEach((disposable) => {
      disposable.dispose();
    });
    disposables.clear();
    sink.end(t);
  }
}
