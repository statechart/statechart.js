import { union, intersection, difference } from '@statechart/util-set';
import {
  Backend,
  Document,
  InterpreterState,
  IdxSet,
  IEvent,
  Transition,
  TransitionType,
  StateType,
} from '@statechart/types';
import { establishEntryset } from './entryset';

export function selectTransitions<Data, Executable>(
  backend: Backend<Data, Executable>,
  doc: Document<Executable>,
  interpreter: InterpreterState,
  event?: IEvent<Data>,
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

  if (transSet.size === 0) return Object.assign({}, interpreter, { isStable: true });

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

function isTransitionApplicable<Data, Executable>(
  { events }: Transition<Executable>,
  event: IEvent<Data> | undefined,
  backend: Backend<Data, Executable>,
) {
  const hasEvents = typeof events !== 'undefined';
  const hasEvent = typeof event !== 'undefined';
  if (!hasEvents && !hasEvent) return true;
  if (hasEvents && hasEvent) return backend.match(events, event as IEvent<Data>);
  return false;
}

function isTransitionEnabled<Data, Executable>(
  { condition }: Transition<Executable>,
  backend: Backend<Data, Executable>,
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

  return Object.assign(
    {},
    interpreter,
    { history },
  );
}
