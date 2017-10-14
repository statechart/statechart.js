import { Time } from '@most/types';
import { Configuration } from '@statechart/types';
import { Pipe } from '../pipe/index';
import { MacrostepSink } from '../macrostep/index';

export class ExternalEventSink<Event> extends Pipe<Event, Configuration> {
  public sink: MacrostepSink<Event>;

  event(t: Time, x: Event) {
    return this.sink.send(t, x);
  }
}
