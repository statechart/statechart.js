import { Time, Sink } from '@most/types';

export type Configuration = number[];

export interface IEvent<Data> {
  name: string;
  type?: '_internal' | 'external' | 'platform';
  origin?: string;
  sendid?: string;
  origintype?: string;
  data?: Data;
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

export interface InvocationExecutable<Executable> {
  type: Executable;
  src: Executable;
  id: Executable;
  params: Executable;
  autoforward: boolean;
  content: Executable;
}

export interface State<Executable> {
  idx: number;
  invocations: InvocationExecutable<Executable>[];
  parent: number;
  ancestors: number[];
  completion: number[];
  descendants: number[];
  onEnter: Executable[];
  onExit: Executable[];
  data: Executable[];
}

export interface Transition<Executable> {
  idx: number;
  onTransition: Executable[];
}

export interface Document<Executable> {
  states: State<Executable>[];
  transitions: Transition<Executable>[];
}

export interface InterpreterState {
  configuration: number[];
  history: number[];
  initialized: number[];
  isStable: boolean;
}
