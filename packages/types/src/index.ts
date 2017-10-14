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

export interface Invocation<Executable> {
  type: Executable;
  src: Executable;
  id: Executable;
  params: Executable;
  autoforward: boolean;
  content: Executable;
}

export const enum StateType {
  COMPOUND = 'compound',
  ATOMIC = 'atomic',
  PARALLEL = 'parallel',
  HISTORY_SHALLOW = 'history_shallow',
  HISTORY_DEEP = 'history_deep',
  INITIAL = 'initial',
  FINAL = 'final',
}

export interface State<Executable> {
  idx: number;
  type: StateType;
  invocations: Invocation<Executable>[];
  parent: number;
  ancestors: number[];
  completion: number[];
  descendants: number[];
  onEnter: Executable[];
  onExit: Executable[];
  data: Executable[];
  transitions: number[];
  children: number[];
}

export const enum TransitionType {
  EXTERNAL = 'external',
  TARGETLESS = 'targetless',
  INTERNAL = 'internal',
  SPONTANEOUS = 'spontaneous',
  HISTORY = 'history',
  INITIAL = 'initial',
}

export interface Transition<Executable> {
  idx: number;
  type: TransitionType;
  onTransition: Executable[];
  source: number;
  events?: Executable;
  condition?: Executable;
  targets: number[];
  conflicts: number[];
  exits: number[];
  name?: string;
}

export interface Document<Executable> {
  states: State<Executable>[];
  transitions: Transition<Executable>[];
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
