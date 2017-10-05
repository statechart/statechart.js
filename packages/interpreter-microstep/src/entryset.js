import { union, toArray, hasIntersection, intersection, difference } from '@statechart/util-set';

export default function establishEntryset(backend, doc, interpreter, entrySet, transSet, exitSet) {
  const configuration = new Set(interpreter.configuration);
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
    const state = doc.states[idx];
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
  const { transitions, idx } = state;
  for (let i = 0; i < transitions.length; i++) {
    const tidx = transitions[i];
    const { targets } = doc.transitions[tidx];
    union(entrySet, targets);
    entrySet.delete(idx);
    transSet.add(tidx);

    for (let j = 0; j < targets.length; j++) {
      const targetIdx = targets[j];
      union(entrySet, doc.states[targetIdx].ancestors);
    }
  }
}

function addEntryDescendantsCompound(doc, configuration, entrySet, transSet, exitSet, state) {
  if (!shouldAddCompoundState(configuration, entrySet, exitSet, state)) return;
  const completion = state.completion;
  union(entrySet, completion);

  if (hasIntersection(new Set(completion), state.children)) return;

  const first = completion[0];
  if (typeof first === 'undefined') return;

  union(entrySet, doc.states[first].ancestors);
}

function shouldAddCompoundState(configuration, entrySet, exitSet, state) {
  const { children } = state;

  let shouldAdd = true;
  for (let i = 0; i < children.length; i++) {
    const id = children[i];
    shouldAdd = shouldAdd && !entrySet.has(id);
    if (configuration.has(id) && !exitSet.has(id)) {
      entrySet.add(id);
      shouldAdd = false;
    }
  }

  return shouldAdd;
}

function exitStates(backend, doc, exitSet) {
  exitSet.forEach((idx) => {
    const { onExit } = doc.states[idx];
    for (let i = 0; i < onExit.length; i++) {
      backend.exec(onExit[i]);
    }
  });
}

function takeTransitions(backend, doc, transSet) {
  transSet.forEach((idx) => {
    const { onTransition } = doc.transitions[idx];
    for (let i = 0; i < onTransition.length; i++) {
      backend.exec(onTransition[i]);
    }
  });
}

function enterStates(backend, doc, interpreter, configuration, entrySet) {
  var initialized = new Set(interpreter.initialized);

  entrySet.forEach((idx) => {
    var state = doc.states[idx];
    if (configuration.has(idx)) return;

    if (!initialized.has(idx)) {
      const { data } = state;
      for (let i = 0; i < data.length; i++) {
        backend.exec(data[i]);
      }
      initialized.add(idx);
    }

    const { onEnter } = state;
    for (let i = 0; i < onEnter.length; i++) {
      backend.exec(onEnter[i]);
    }
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
