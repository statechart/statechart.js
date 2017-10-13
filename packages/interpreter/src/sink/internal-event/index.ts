import { Time } from '@most/types';
import { Pipe } from '../pipe/index';
import { MacrostepSink } from '../macrostep/index';
import { Configuration } from '../../types/index';

export class InternalEventSink<Event> extends Pipe<Event, Configuration> {
  public sink: MacrostepSink<Event>;

  event(t: Time, x: Event) {
    return this.sink.raise(t, x);
  }
}
