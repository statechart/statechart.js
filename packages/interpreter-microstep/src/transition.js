import { union, intersection, difference, toArray } from '@statechart/util-set';
import establishEntryset from './entryset';

export default function selectTransitions(backend, doc, interpreter, event) {
  const configuration = new Set(interpreter.configuration);
  const entrySet = new Set();
  const transSet = new Set();
  const exitSet = new Set();
  const conflicts = new Set();
  const transitions = doc.transitions;

  for (let i = 0; i < transitions.length; i++) {
    const transition = transitions[i];
    const type = transition.type;
    // never select history or initial transitions automatically
    if (type === 'history' || type === 'initial') continue;

    if (
      isTransitionActive(transition, configuration) &&
      isTransitionConflictFree(transition, conflicts) &&
      isTransitionApplicable(transition, event) &&
      isTransitionEnabled(transition, backend)
    ) {
      union(entrySet, transition.targets);
      transSet.add(transition.idx);
      union(exitSet, transition.exits);
      union(conflicts, transition.conflicts);
    }
  }

  if (!transSet.size) return Object.assign({}, interpreter, { isStable: true });

  interpreter = rememberHistory(doc, interpreter, exitSet);
  return establishEntryset(backend, doc, interpreter, entrySet, transSet, exitSet);
}

function isTransitionActive({ source, type, targets }, configuration) {
  return configuration.has(source) && (
    type !== 'spontaneous' ||
    targets.some(t => !configuration.has(t))
  );
}

function isTransitionConflictFree(transition, conflicts) {
  return !conflicts.has(transition.idx);
}

function isTransitionApplicable(transition, event) {
  const matcher = transition.events;
  if (!matcher && !event) return true;
  if (matcher && event) return matcher(event);
  return false;
}

function isTransitionEnabled(transition, backend) {
  const cond = transition.condition;
  return typeof cond === 'undefined' ?
    true :
    backend.query(cond);
}

function rememberHistory(doc, interpreter, exitSet) {
  const configuration = interpreter.configuration;
  const history = new Set(interpreter.history);
  const states = doc.states;

  for (let i = 0; i < states.length; i++) {
    const state = states[i];
    const type = state.type;
    if (type !== 'history_deep' && type !== 'history_shallow') continue;

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
    {
      history: toArray(history)
    }
  );
}
