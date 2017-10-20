import { Time, Sink } from '@most/types';
import { Pipe } from '../pipe/index';

export interface Raisable<Configuration, Event> extends Sink<Configuration> {
  raise(t: Time, x: Event): any;
}

export class InternalEventSink<Configuration, Event> extends Pipe<Event, Configuration> {
  public sink: Raisable<Configuration, Event>;

  event(t: Time, x: Event) {
    return this.sink.raise(t, x);
  }
}
