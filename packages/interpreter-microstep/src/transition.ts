import { union, intersection, difference } from '@statechart/util-set';
import {
  Backend,
  InterpreterState,
  IdxSet,
} from './types';
import {
  Document,
  Transition,
  TransitionType,
  StateType,
} from '@statechart/scexe';
import { establishEntryset } from './entryset';

export function selectTransitions<Event, Executable>(
  backend: Backend<Event, Executable>,
  doc: Document<Executable>,
  interpreter: InterpreterState,
  event?: Event,
) {
  const configuration = new Set(interpreter.configuration);
  const { transitions } = doc;
  const entrySet = new Set();
  const transSet = new Set();
  const exitSet = new Set();
  const conflictSet = new Set();

  for (let i = 0; i < transitions.length; i++) { // tslint:disable-line
    const transition = transitions[i];
    const {
      type,
      targets,
      exits,
      conflicts,
    } = transition;

    if (
      type !== TransitionType.HISTORY &&
      type !== TransitionType.INITIAL &&
      isTransitionActive(transition, configuration) &&
      isTransitionConflictFree(transition, conflictSet) &&
      isTransitionApplicable(transition, event, backend) &&
      isTransitionEnabled(transition, backend)
    ) {
      union(entrySet, targets);
      transSet.add(i);
      union(exitSet, exits);
      union(conflictSet, conflicts);
    }
  }

  if (transSet.size === 0) return { ...interpreter, isStable: true };

  const newInterpreter = rememberHistory(doc, interpreter, exitSet);
  return establishEntryset(backend, doc, newInterpreter, entrySet, transSet, exitSet);
}

function isTransitionActive<Executable>(
  { source, type, targets }: Transition<Executable>,
  configuration: IdxSet,
) {
  return configuration.has(source) && (
    type !== TransitionType.SPONTANEOUS ||
    targets.some(t => !configuration.has(t))
  );
}

function isTransitionConflictFree<Executable>(
  { idx }: Transition<Executable>,
  conflicts: IdxSet,
) {
  return !conflicts.has(idx);
}

function isTransitionApplicable<Event, Executable>(
  { event: matcher }: Transition<Executable>,
  event: Event | undefined,
  backend: Backend<Event, Executable>,
) {
  const hasEvents = typeof matcher !== 'undefined';
  const hasEvent = typeof event !== 'undefined';
  if (!hasEvents && !hasEvent) return true;
  if (hasEvents && hasEvent) return backend.match(matcher, event as Event);
  return false;
}

function isTransitionEnabled<Event, Executable>(
  { condition }: Transition<Executable>,
  backend: Backend<Event, Executable>,
) {
  return typeof condition === 'undefined' ?
    true :
    backend.query(condition);
}

function rememberHistory<Executable>(
  doc: Document<Executable>,
  interpreter: InterpreterState,
  exitSet: IdxSet,
) {
  const { configuration } = interpreter;
  const history = new Set(interpreter.history);
  const states = doc.states;

  for (let i = 0; i < states.length; i++) { // tslint:disable-line
    const state = states[i];
    const type = state.type;
    if (type !== StateType.HISTORY_DEEP && type !== StateType.HISTORY_SHALLOW) continue;

    if (exitSet.has(state.parent)) {
      const completion = state.completion;
      const tmpCompletion = new Set(completion);
      intersection(tmpCompletion, configuration);
      difference(history, completion);
      union(history, tmpCompletion);
    }
  }

  return {
    ...interpreter,
    history,
  };
}
