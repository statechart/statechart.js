import { Time, Sink } from '@most/types';
import { EventType } from '@statechart/types';

export interface RoutableEvent {
  type?: EventType;
};

export class ExternalEventRouter<Event extends RoutableEvent> implements Sink<Event> {
  private internal: Sink<Event>;
  private external: Sink<Event>;

  constructor(internalEventSink: Sink<Event>, externalEventSink: Sink<Event>) {
    this.internal = internalEventSink;
    this.external = externalEventSink;
  }

  event(t: Time, x: Event) {
    return x.type === EventType.INTERNAL ?
      this.internal.event(t, x) :
      this.external.event(t, x);
  }

  end(t: Time) {
    this.external.end(t);
  }

  error(t: Time, e: Error) {
    // TODO where should this go?
    this.internal.error(t, e);
    this.external.error(t, e);
  }
}
