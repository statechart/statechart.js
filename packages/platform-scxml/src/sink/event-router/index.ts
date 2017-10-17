import { Sink, Time } from '@most/types';

export interface RoutableEvent {
  target: string;
  origin: string;
}

export class InvalidTargetError<Event extends RoutableEvent> extends Error {
  event: Event;
  target: string;
  origin: string;

  constructor(event: Event) {
    const { target, origin } = event;
    super(`Invalid target ${JSON.stringify(target)} from ${JSON.stringify(origin)}`);
    this.event = event;
    this.target = target;
    this.origin = origin;
  }
}

export class EventRouterSink<Event> implements Sink<Event> {
  private sinks: Map<string, Sink<Event>>;

  constructor(sinks: Map<string, Sink<Event>>) {
    this.sinks = sinks;
  }

  event(t: Time, x: Event & RoutableEvent) {
    const { sinks } = this;
    const { target } = x;
    const sink = sinks.get(target);
    if (typeof sink !== 'undefined') {
      sink.event(t, x);
    } else {
      const { origin } = x;
      const sender = sinks.get(origin);
      const error = new InvalidTargetError(x);
      if (typeof sender !== 'undefined') {
        sender.error(t, error);
      } else {
        throw error;
      }
    }
  }

  end(t: Time) {
    this.sinks.forEach((sink) => {
      sink.end(t);
    });
  }

  error(_T: Time, _E: Error) {
    // errors should be converted into events before this
  }
}
