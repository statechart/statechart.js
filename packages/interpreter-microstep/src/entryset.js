import { union, toArray, hasIntersection, intersection, difference } from '@statechart/util-set';

export default function establishEntryset(backend, doc, interpreter, entrySet, transSet, exitSet) {
  var configuration = new Set(interpreter.configuration);
  addEntryAncestors(doc, entrySet);
  addEntryDescendants(doc, configuration, entrySet, transSet, exitSet);

  exitStates(backend, doc, exitSet);
  takeTransitions(backend, doc, transSet);
  return enterStates(backend, doc, interpreter, configuration, entrySet);
}

function addEntryAncestors(doc, entrySet) {
  entrySet.forEach((idx) => {
    union(entrySet, doc.states[idx].ancestors);
  });
}

function addEntryDescendants(doc, configuration, entrySet, transSet, exitSet) {
  entrySet.forEach((idx) => {
    var state = doc.states[idx];
    switch (state.type) {
    case 'parallel':
      union(entrySet, state.completion);
      break;
    case 'history_shallow':
    case 'history_deep':
      addEntryDescendantsHistory(doc, entrySet, transSet, state);
      break;
    case 'initial':
      addEntryDescendantsInitial(doc, entrySet, transSet, state);
      break;
    case 'compound':
      addEntryDescendantsCompound(doc, configuration, entrySet, transSet, exitSet, state);
      break;
    }
  });
}

function addEntryDescendantsHistory() {
  // TODO
}

function addEntryDescendantsInitial(doc, entrySet, transSet, state) {
  state.transitions.forEach((idx) => {
    var transition = doc.transitions[idx];
    var targets = transition.targets;
    union(entrySet, targets);
    entrySet.delete(state.idx);
    transSet.add(idx);
    targets.forEach((idx) => {
      union(entrySet, doc.states[idx].ancestors);
    })
  });
}

function addEntryDescendantsCompound(doc, configuration, entrySet, transSet, exitSet, state) {
  if (!shouldAddCompoundState(configuration, entrySet, exitSet, state)) return;
  var completion = state.completion;
  union(entrySet, completion);

  if (hasIntersection(new Set(completion), state.children)) return;

  var first = completion[0];
  if (typeof first === 'undefined') return;

  union(entrySet, doc.states[first].ancestors);
}

function shouldAddCompoundState(configuration, entrySet, exitSet, state) {
  const { children } = state;

  let shouldAdd = true;
  children.forEach((id) => {
    shouldAdd = shouldAdd && !entrySet.has(id);
    if (configuration.has(id) && !exitSet.has(id)) {
      entrySet.add(id);
      shouldAdd = false;
    }
  });

  return shouldAdd;
}

function exitStates(backend, doc, exitSet) {
  exitSet.forEach((idx) => {
    var state = doc.states[idx];
    state.onExit.forEach((execution) => {
      backend.exec(execution);
    });
  });
}

function takeTransitions(backend, doc, transSet) {
  transSet.forEach((idx) => {
    doc.transitions[idx].onTransition.forEach((execution) => {
      backend.exec(execution);
    });
  });
}

function enterStates(backend, doc, interpreter, configuration, entrySet) {
  var initialized = new Set(interpreter.initialized);

  entrySet.forEach((idx) => {
    var state = doc.states[idx];
    if (configuration.has(idx)) return;

    if (!initialized.has(idx)) {
      state.data.forEach((data) => {
        backend.exec(data);
      });
      initialized.add(idx);
    }

    state.onEnter.forEach((execution) => {
      backend.exec(execution);
    });
  });

  return Object.assign(
    {},
    interpreter,
    {
      configuration: toArray(entrySet),
      initialized: toArray(initialized),
      isStable: false,
    }
  );
}
