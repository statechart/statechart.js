import { Sink } from '@most/types';

export const enum EventType {
  INTERNAL = '_internal',
  EXTERNAL = 'external',
  PLATFORM = 'platform',
}

export interface IEvent<Data> {
  name: string;
  type?: string; // type of target: URL
  target?: string; // target URL (instance location)
  data?: Data;
  origin?: string; // type of origin: URL
  origintype?: string; // origin URL (instance location)
  sendid?: string; // the internal event id
  delay?: number;
  invokeid?: string; // id set if sent by an child invocation
}

export interface IDatamodel<Configuration, Event, Executable> {
  internalEvents: Sink<Event>;
  externalEvents: Sink<Event>;
  exec(executable: Executable): Promise<any>;
  error(error: Error): void;
  query(executable: Executable): any;
  end(): void;
  setEvent(event?: Event): void;
  setConfiguration(configuration: Configuration): void;
}
