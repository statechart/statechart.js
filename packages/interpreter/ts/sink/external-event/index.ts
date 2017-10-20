import { Time, Sink } from '@most/types';
import { Pipe } from '../pipe/index';

export interface Sendable<Configuration, Event> extends Sink<Configuration> {
  send(t: Time, x: Event): any;
}

export class ExternalEventSink<Configuration, Event> extends Pipe<Event, Configuration> {
  public sink: Sendable<Configuration, Event>;

  event(t: Time, x: Event) {
    return this.sink.send(t, x);
  }
}
