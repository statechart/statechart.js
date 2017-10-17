import { Time, Sink } from '@most/types';

export interface IOProcessor<Event> {
  event(t: Time, x: Event): any;
  end(t: Time): any;
}
export type IOProcessorMap<Event> = Map<string, IOProcessor<Event>>;

export interface PlatformEvent {
  type: string;
}

export class RoutingError<Event> extends Error {
  event: Event & PlatformEvent;
  type: string;

  constructor(event: Event & PlatformEvent) {
    const { type } = event;
    super(`Unknown ioprocessor ${JSON.stringify(type)}`);
    this.event = event;
    this.type = type;
  }
}

export class IOProcessorRouter<Event> implements Sink<Event & PlatformEvent> {
  private ioprocessors: IOProcessorMap<Event>;

  constructor(
    ioprocessors: IOProcessorMap<Event>,
  ) {
    this.ioprocessors = ioprocessors;
  }

  event(t: Time, x: Event & PlatformEvent) {
    const { ioprocessors } = this;
    const { type } = x;
    const processor = ioprocessors.get(type);
    if (typeof processor !== 'undefined') {
      processor.event(t, x);
    } else {
      throw new RoutingError(x);
    }
  }

  error(_T: Time, _E: Error) {
    // noop
  }

  end(t: Time) {
    const { ioprocessors } = this;
    ioprocessors.forEach((ioprocessor) => {
      ioprocessor.end(t);
    });
  }
}
