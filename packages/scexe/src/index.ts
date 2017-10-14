export interface Invocation<Executable> {
  type: Executable;
  src: Executable;
  id: Executable;
  autoforward: boolean;
  content: Executable;
  onExit: Executable[];
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
  id?: string;
  idx: number;
  type: StateType;
  invocations: Invocation<Executable>[];
  parent: number;
  ancestors: number[];
  completion: number[];
  descendants: number[];
  onInit: Executable[];
  onEnter: Executable[];
  onExit: Executable[];
  transitions: number[];
  children: number[];
  hasHistory: boolean;
  name?: string;
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
  name?: string;
  states: State<Executable>[];
  transitions: Transition<Executable>[];
  datamodel?: string;
  meta?: { [s: string]: string };
}
