import { Sink, Time } from '@most/types';

export abstract class Pipe<From, To> implements Sink<From> {
  public sink: Sink<To>;

  constructor(sink: Sink<To>) {
    this.sink = sink;
  }

  abstract event(t: Time, x: From): any;

  end(t: Time) {
    return this.sink.end(t);
  }

  error(t: Time, e: Error) {
    return this.sink.error(t, e);
  }
}
