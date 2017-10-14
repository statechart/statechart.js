import { Sink } from '@most/types';

export const enum EventType {
  INTERNAL = '_internal',
  EXTERNAL = 'external',
  PLATFORM = 'platform',
}

export interface IEvent<Data> {
  name: string;
  type?: EventType;
  origin?: string;
  sendid?: string;
  origintype?: string;
  data?: Data;
}

export interface Backend<Data, Executable> {
  query(executable: Executable): any;
  exec(executable: Executable): void;
  match(events: any, event: IEvent<Data>): boolean;
}

export type IdxSet = Set<number>;
export type Configuration = IdxSet;

export interface InterpreterState {
  configuration: IdxSet;
  history: IdxSet;
  initialized: IdxSet;
  isStable: boolean;
}

export interface IDatamodel<Data, Executable> {
  internalEvents: Sink<IEvent<Data>>;
  externalEvents: Sink<IEvent<Data>>;
  exec(executable: Executable): Promise<any>;
  error(error: Error): void;
  query(executable: Executable): any;
  end(): void;
  setEvent(event: any): void;
  setConfiguration(configuration: Configuration): void;
}
