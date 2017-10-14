import { Sink, Time } from '@most/types';

export class ProxySink<Event> implements Sink<Event> {
  public sink: Sink<Event>;

  event(t: Time, x: Event) {
    return this.sink.event(t, x);
  }

  end(t: Time) {
    return this.sink.end(t);
  }

  error(t: Time, e: Error) {
    return this.sink.error(t, e);
  }
}
