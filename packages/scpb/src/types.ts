import {
  Document,
  Invocation,
  State,
  StateType,
  Transition,
  TransitionType,
} from '@statechart/types';

export type Document = Document<string>;
export type State = State<string>;
export type Transition = Transition<string>;
export type Invocation = Invocation<string>;

export const state = [
  StateType.COMPOUND,
  StateType.ATOMIC,
  StateType.PARALLEL,
  StateType.HISTORY_SHALLOW,
  StateType.HISTORY_DEEP,
  StateType.INITIAL,
  StateType.FINAL,
];

export const transition = [
  TransitionType.EXTERNAL,
  TransitionType.TARGETLESS,
  TransitionType.INTERNAL,
  TransitionType.SPONTANEOUS,
  TransitionType.HISTORY,
  TransitionType.INITIAL,
];

export const expression = [
  'raise',
  'cond',
  'clause',
  'foreach',
  'log',
  'assign',
  'param',
  'script',
  'send',
  'cancel',
  'expr',
  'literal',
  'location',
  'script_ext',
  'eval',
];
