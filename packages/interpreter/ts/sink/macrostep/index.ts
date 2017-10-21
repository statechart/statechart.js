import { Sink, Time } from '@most/types';

export class MacrostepSink<Configuration, Event> implements Sink<Configuration> {
  private sink: Sink<Event>;
  private invocations: Sink<Configuration>;
  private loop: boolean;
  private next: boolean;
  private macrostepTime?: number;
  private external: Event[];
  private internal: Event[];
  private configuration: Configuration;
  private configurationSink: Sink<Configuration>;

  constructor(
    sink: Sink<Event>,
    configuration: Sink<Configuration>,
    invocations: Sink<Configuration>,
  ) {
    this.sink = sink;
    this.invocations = invocations;
    this.configurationSink = configuration;
    this.loop = false;
    this.next = false;
    this.external = [];
    this.internal = [];
  }

  event(t: Time, configuration: Configuration) {
    this.next = true;
    this.configuration = configuration;
    this.macrostep(t);
  }

  error(t: Time, e: Error) {
    this.sink.error(t, e);
  }

  end(t: Time) {
    this.loop = false;
    this.macrostepTime = t;
    this.internal.push = () => 0;
    this.external.push = () => 0;
    this.sink.end(t);
    this.invocations.end(t);
    this.configurationSink.end(t);
  }

  raise(t: Time, x: Event) {
    this.internal.push(x);
    if (this.next) this.macrostep(t);
  }

  send(t: Time, x: Event) {
    this.external.push(x);
    if (this.next) this.macrostep(t);
  }

  protected macrostep(t: Time) {
    this.loop = true;

    // if we already are in a macrostep then wait for a loop
    const { macrostepTime } = this;
    if (t >= (macrostepTime || 0)) this.macrostepTime = t;
    if (macrostepTime !== undefined) return;

    const {
      invocations,
      configurationSink,
      internal,
      external,
    } = this;

    let event;

    while (this.loop) {
      const {
        configuration,
        macrostepTime: t,
      } = this;

      // handle internal events
      if (event = internal.shift()) { // tslint:disable-line
        this.evt(t as number, event);
        continue;
      }

      // send invocations
      invocations.event(t as number, configuration);

      // handle external events
      if (event = external.shift()) { // tslint:disable-line
        this.evt(t as number, event);
        continue;
      }

      this.loop = false;
      configurationSink.event(t as number, configuration);
    }

    this.macrostepTime = undefined;
  }

  private evt(t: Time, event: Event) {
    this.loop = false;
    this.next = false;
    this.sink.event(t, event);
    if (!this.loop) this.macrostepTime = undefined;
  }
}
