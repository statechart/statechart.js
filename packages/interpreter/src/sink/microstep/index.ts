import { Sink, Time } from '@most/types';
import {
  init,
  handleEvent,
  synchronize,
  Configuration,
  InterpreterState,
} from '@statechart/interpreter-microstep';
import { Document } from '@statechart/scexe';

type INIT = 0;
const INIT = 0;
type STABLE = 1;
const STABLE = 1;
type AWAIT_EVENT = 2;
const AWAIT_EVENT = 2;
type HANDLE_EVENT = 3;
const HANDLE_EVENT = 3;
type SYNCHRONIZE = 4;
const SYNCHRONIZE = 4;
type STABILIZE = 5;
const STABILIZE = 5;

type State = INIT | STABLE | AWAIT_EVENT | HANDLE_EVENT | SYNCHRONIZE | STABILIZE;

export interface IDatamodelSink<Event, Executable> extends Sink<Event | undefined> {
  configuration(t: Time, x: Configuration): any;
  exec(t: Time, x: Executable): any;
  query(x: Executable): any;
}

export class MicrostepSink<Event, Executable> implements Sink<Event | undefined> {
  private document: Document<Executable>;
  private sink: Sink<Configuration>;
  private datamodel: IDatamodelSink<Event, Executable>;
  private s: State;
  public state: InterpreterState;
  private loop: boolean;
  private microstepTime?: number;
  private microstepEvent?: Event;

  constructor(
    sink: Sink<Configuration>,
    datamodel: IDatamodelSink<Event, Executable>,
    document: Document<Executable>,
  ) {
    this.document = document;
    this.sink = sink;
    this.datamodel = datamodel;
    this.s = INIT;
    this.loop = false;
    this.state = {
      configuration: new Set(),
      history: new Set(),
      initialized: new Set(),
      isStable: false,
    };
  }

  error(t: Time, e: Error) {
    this.datamodel.error(t, e);
    this.sink.error(t, e);
  }

  end(t: Time) {
    this.loop = false;
    this.microstepTime = t;
    this.microstepEvent = undefined;
    this.datamodel.end(t);
    this.sink.end(t);
  }

  event(t: Time, event?: Event): any {
    this.loop = true;

    // if we already are in a macrostep then wait for a loop
    const { microstepTime } = this;
    if (t >= (microstepTime || 0)) this.microstepTime = t;
    this.microstepEvent = event;
    if (typeof microstepTime !== 'undefined') return;

    const { datamodel, document } = this;

    const backend = {
      query: (x: Executable) => datamodel.query(x),
      exec: (x: Executable) => {
        this.loop = false;
        datamodel.exec(t, x);
      },
      match: (matcher: ((event: Event) => boolean), event: Event) => {
        return matcher(event);
      },
    };

    while (this.loop) {
      const { microstepTime: t, microstepEvent, state } = this;
      const { configuration } = state;

      datamodel.event(t as number, microstepEvent);
      datamodel.configuration(t as number, configuration);

      switch (this.s) {
        case INIT:
          this.s = STABILIZE;
          this.state = init(backend, document);
          break;

        case STABLE:
          this.s = AWAIT_EVENT;
          this.loop = false;
          this.sink.event(t as number, configuration);
          break;

        case AWAIT_EVENT:
          this.s = HANDLE_EVENT;
          this.microstepEvent = undefined;
          this.state = handleEvent(backend, document, state, microstepEvent);
          break;

        case HANDLE_EVENT:
          this.s = SYNCHRONIZE;
          break;

        case SYNCHRONIZE:
          this.s = STABILIZE;
          this.state = synchronize(backend, document, state);
          break;

        case STABILIZE:
          this.s = state.isStable ? STABLE : SYNCHRONIZE;
          break;
      }
    }
    this.microstepTime = undefined;
    this.microstepEvent = undefined;
  }
}
