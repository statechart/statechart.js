import establishEntryset from './entryset';
import { union, intersection, difference, toArray } from './set';

export default function selectTransitions(backend, doc, interpreter, event) {
  var configuration = new Set(interpreter.configuration);
  var entrySet = new Set();
  var transSet = new Set();
  var exitSet = new Set();
  var conflicts = new Set();

  doc.transitions.forEach(function(transition) {
    var type = transition.type;
    // never select history or initial transitions automatically
    if (type === 'history' || type === 'initial') return;

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
  });

  if (!transSet.size) return interpreter;

  interpreter = rememberHistory(doc, interpreter, exitSet);
  return establishEntryset(backend, doc, interpreter, entrySet, transSet, exitSet);
}

function isTransitionActive(transition, configuration) {
  return configuration.has(transition.source);
}

function isTransitionConflictFree(transition, conflicts) {
  return !conflicts.has(transition.idx);
}

function isTransitionApplicable(transition, event) {
  var matcher = transition.events;
  if (!matcher && !event) return true;
  if (matcher && event) return matcher(event);
  return false;
}

function isTransitionEnabled(transition, backend) {
  var cond = transition.cond;
  return typeof cond === 'undefined' ?
    true :
    backend.query(cond);
}

function rememberHistory(doc, interpreter, exitSet) {
  var configuration = interpreter.configuration;
  var history = new Set(interpreter.history);

  doc.states.forEach(function(state) {
    var type = state.type;
    if (type !== 'history_deep' && type !== 'history_shallow') return;

    if (exitSet.has(state.parent)) {
      var completion = state.completion;
      var tmpCompletion = new Set(state.completion);
      intersection(tmpCompletion, configuration);
      difference(history, completion);
      union(history, tmpCompletion);
    }
  });

  return Object.assign(
    {},
    interpreter,
    {
      history: toArray(history)
    }
  );
}
