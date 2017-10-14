import {
  Document,
  Invocation,
  State,
  StateType,
  Transition,
  TransitionType,
} from '@statechart/scexe';

export type Document = Document<Uint8Array>;
export type State = State<Uint8Array>;
export type Transition = Transition<Uint8Array>;
export type Invocation = Invocation<Uint8Array>;
export {
  StateType,
  TransitionType,
}

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
