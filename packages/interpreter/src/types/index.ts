import { Time, Sink } from '@most/types';
import {
  Configuration,
  IEvent,
} from '@statechart/types';

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

export interface IDatamodelSink<Data, Executable> extends Sink<IEvent<Data> | undefined> {
  configuration(t: Time, x: Configuration): any;
  exec(t: Time, x: Executable): any;
  query(x: Executable): any;
}

export interface Invocation<Param, Content> {
  idx: number;
  type: string;
  src: string;
  id: string;
  params: Map<string, Param>;
  autoforward: boolean;
  content: Content;
  source: number;
  depth: number;
}

export const enum InvocationCommandType {
  OPEN = 0,
  CLOSE = 1,
}

export interface InvocationCommand<Param, Content> {
  type: InvocationCommandType;
  invocation: Invocation<Param, Content>;
}
