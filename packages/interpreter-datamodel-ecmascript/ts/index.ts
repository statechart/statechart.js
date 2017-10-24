import { Scheduler, Sink } from '@most/types';
import { IDatamodel } from '@statechart/types';
import { Configuration } from '@statechart/interpreter';

export interface EcmascriptEvent {
  name: string;
}

export interface EcmascriptContext {
  _raise(name: string): any;
  _send(event: EcmascriptEvent): any;
  In(idx: string | number): boolean;
}

export interface EcmascriptDatamodel {
  _event: EcmascriptEvent | null;
  _sessionid: string;
}

export type Executable<Datamodel, Context> =
  (d: Datamodel & EcmascriptDatamodel, context: Context & EcmascriptContext) => any;

export class Datamodel<Datamodel, Context>
    implements IDatamodel<Configuration, EcmascriptEvent, Executable<Datamodel, Context>> {
  public internalEvents: Sink<EcmascriptEvent>;
  public externalEvents: Sink<EcmascriptEvent>;

  private d: Datamodel & EcmascriptDatamodel;
  private context: Context & EcmascriptContext;
  private configuration: Configuration;
  private scheduler: Scheduler;

  constructor(id: string, datamodel: Datamodel, context: Context, scheduler: Scheduler) {
    this.scheduler = scheduler;
    this.d = Object.assign(
      {},
      datamodel,
      {
        _sessionid: id,
        _event: null,
        _ioprocessors: {
          // TODO
        },
      },
    );

    const ecmascript: EcmascriptContext = {
      _raise: (name: string) => {
        const event: EcmascriptEvent = { name };
        this.internalEvents.event(this.scheduler.currentTime(), event);
      },
      _send: (event: EcmascriptEvent) => {
        this.externalEvents.event(this.scheduler.currentTime(), event);
      },
      In: (idx: number) => this.configuration.has(idx),
    };

    this.context = Object.assign(
      {},
      context,
      ecmascript,
    );
  }

  get() {
    return this.d;
  }

  exec(executable: Executable<Datamodel, Context>) {
    return executable(this.d, this.context);
  }

  error() {
    // TODO add an error event in the internal events
  }

  query(executable: Executable<Datamodel, Context>) {
    return executable(this.d, this.context);
  }

  end() {
    // TODO is there any cleanup here?
  }

  setEvent(event: EcmascriptEvent) {
    this.d._event = event;
  }

  setConfiguration(configuration: Configuration) {
    this.configuration = configuration;
  }
}
