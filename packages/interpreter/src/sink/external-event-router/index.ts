import { Time, Sink } from '@most/types';

export type INTERNAL = '#_internal';
export const INTERNAL = '#_internal';

export interface RoutableEvent {
  type?: INTERNAL | string;
}

export interface ExternalEvent {
  type: string;
}

export class ExternalEventRouter<Event> implements Sink<Event & RoutableEvent> {
  private internal: Sink<Event>;
  private external: Sink<Event & ExternalEvent>;

  constructor(internalEventSink: Sink<Event>, externalEventSink: Sink<Event & ExternalEvent>) {
    this.internal = internalEventSink;
    this.external = externalEventSink;
  }

  event(t: Time, x: Event & RoutableEvent) {
    const { type } = x;
    return typeof type === 'undefined' || type === INTERNAL ?
      this.internal.event(t, x) :
      this.external.event(t, (x as Event & ExternalEvent));
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
