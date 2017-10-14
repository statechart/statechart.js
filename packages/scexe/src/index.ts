export interface Document<Executable> {
  name?: string;
  states: State<Executable>[];
  transitions: Transition<Executable>[];
  datamodel?: string;
  meta?: { [s: string]: string };
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
  type: StateType;
  idx?: number;
  id?: string;
  onInit: Executable[];
  onEnter: Executable[];
  onExit: Executable[];
  invocations: Invocation<Executable>[];
  parent: number;
  children: number[];
  ancestors: number[];
  completion: number[];
  transitions: number[];
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
  type: TransitionType;
  idx: number;
  source: number;
  event?: Executable;
  condition?: Executable;
  onTransition: Executable[];
  targets: number[];
  conflicts: number[];
  exits: number[];
  name?: string;
}

export interface Invocation<Executable> {
  type: Executable;
  src: Executable;
  id: Executable;
  autoforward: boolean;
  content: Executable;
  onExit: Executable[];
}
