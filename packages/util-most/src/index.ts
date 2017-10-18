import { Disposable, Time, Sink, Scheduler } from '@most/types';
import { disposeNone } from '@most/disposable';

export abstract class ThroughSink<From, To> implements Sink<From> {
  protected sink: Sink<To>;

  abstract event(t: Time, x: From): any;

  error(t: Time, e: Error) {
    return this.sink.error(t, e);
  }

  end(t: Time) {
    return this.sink.end(t);
  }
}

export class StreamSink<Event> extends ThroughSink<Event, Event> {
  protected sink: Sink<Event>;

  run(sink: Sink<Event>, _S: Scheduler): Disposable {
    this.sink = sink;
    return disposeNone();
  }

  event(t: Time, x: Event) {
    return this.sink.event(t, x);
  }
}
