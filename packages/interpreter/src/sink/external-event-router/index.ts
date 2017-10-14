import { Time, Sink } from '@most/types';
import { IEvent, EventType } from '@statechart/types';

export class ExternalEventRouter<Data> implements Sink<IEvent<Data>> {
  private internal: Sink<IEvent<Data>>;
  private external: Sink<IEvent<Data>>;

  constructor(internalEventSink: Sink<IEvent<Data>>, externalEventSink: Sink<IEvent<Data>>) {
    this.internal = internalEventSink;
    this.external = externalEventSink;
  }

  event(t: Time, x: IEvent<Data>) {
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
