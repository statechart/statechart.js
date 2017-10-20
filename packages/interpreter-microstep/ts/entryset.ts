import { union, hasIntersection } from '@statechart/util-set';
import {
  Backend,
  InterpreterState,
  IdxSet,
} from './types';
import {
  Document,
  State,
  StateType,
} from '@statechart/scexe';

export function establishEntryset<Event, Executable>(
  backend: Backend<Event, Executable>,
  doc: Document<Executable>,
  interpreter: InterpreterState,
  entrySet: IdxSet,
  transSet: IdxSet,
  exitSet: IdxSet,
) {
  const { configuration } = interpreter;
  addEntryAncestors(doc, entrySet);
  addEntryDescendants(doc, configuration, entrySet, transSet, exitSet);

  exitStates(backend, doc, exitSet);
  takeTransitions(backend, doc, transSet);
  return enterStates(backend, doc, interpreter, configuration, entrySet);
}

function addEntryAncestors<Executable>(
  doc: Document<Executable>,
  entrySet: IdxSet,
) {
  entrySet.forEach((idx) => {
    union(entrySet, doc.states[idx].ancestors);
  });
}

function addEntryDescendants<Executable>(
  doc: Document<Executable>,
  configuration: IdxSet,
  entrySet: IdxSet,
  transSet: IdxSet,
  exitSet: IdxSet,
) {
  entrySet.forEach((idx) => {
    const state = doc.states[idx];
    switch (state.type) {
      case StateType.PARALLEL:
        union(entrySet, state.completion);
        break;
      case StateType.HISTORY_SHALLOW:
      case StateType.HISTORY_DEEP:
        addEntryDescendantsHistory(doc, entrySet, transSet, state);
        break;
      case StateType.INITIAL:
        addEntryDescendantsInitial(doc, entrySet, transSet, state);
        break;
      case StateType.COMPOUND:
        addEntryDescendantsCompound(doc, configuration, entrySet, transSet, exitSet, state);
        break;
    }
  });
}

function addEntryDescendantsHistory<Executable>(
  _doc: Document<Executable>, // tslint:disable-line
  _entrySet: IdxSet, // tslint:disable-line
  _transSet: IdxSet, // tslint:disable-line
  _state: State<Executable>, // tslint:disable-line
) {
  // TODO
}

function addEntryDescendantsInitial<Executable>(
  doc: Document<Executable>,
  entrySet: IdxSet,
  transSet: IdxSet,
  state: State<Executable>,
) {
  const { transitions, idx } = state;
  for (let i = 0; i < transitions.length; i++) { // tslint:disable-line
    const tidx = transitions[i];
    const { targets } = doc.transitions[tidx];
    union(entrySet, targets);
    entrySet.delete(idx);
    transSet.add(tidx);

    for (let j = 0; j < targets.length; j++) { // tslint:disable-line
      const targetIdx = targets[j];
      union(entrySet, doc.states[targetIdx].ancestors);
    }
  }
}

function addEntryDescendantsCompound<Executable>(
  doc: Document<Executable>,
  configuration: IdxSet,
  entrySet: IdxSet,
  _transSet: IdxSet, // tslint:disable-line
  exitSet: IdxSet,
  state: State<Executable>,
) {
  if (!shouldAddCompoundState(configuration, entrySet, exitSet, state)) return;
  const completion = state.completion;
  union(entrySet, completion);

  if (hasIntersection(new Set(completion), state.children)) return;

  const first = completion[0];
  if (typeof first === 'undefined') return;

  union(entrySet, doc.states[first].ancestors);
}

function shouldAddCompoundState<Executable>(
  configuration: IdxSet,
  entrySet: IdxSet,
  exitSet: IdxSet,
  state: State<Executable>,
) {
  const { children } = state;

  let shouldAdd = true;
  for (let i = 0; i < children.length; i++) { // tslint:disable-line
    const id = children[i];
    shouldAdd = shouldAdd && !entrySet.has(id);
    if (configuration.has(id) && !exitSet.has(id)) {
      entrySet.add(id);
      shouldAdd = false;
    }
  }

  return shouldAdd;
}

function exitStates<Event, Executable>(
  backend: Backend<Event, Executable>,
  doc: Document<Executable>,
  exitSet: IdxSet,
) {
  exitSet.forEach((idx) => {
    const { onExit } = doc.states[idx];
    for (let i = 0; i < onExit.length; i++) { // tslint:disable-line
      backend.exec(onExit[i]);
    }
  });
}

function takeTransitions<Event, Executable>(
  backend: Backend<Event, Executable>,
  doc: Document<Executable>,
  transSet: IdxSet,
) {
  transSet.forEach((idx) => {
    const { onTransition } = doc.transitions[idx];
    for (let i = 0; i < onTransition.length; i++) { // tslint:disable-line
      backend.exec(onTransition[i]);
    }
  });
}

function enterStates<Event, Executable>(
  backend: Backend<Event, Executable>,
  doc: Document<Executable>,
  interpreter: InterpreterState,
  configuration: IdxSet,
  entrySet: IdxSet,
) {
  const initialized = new Set(interpreter.initialized);

  entrySet.forEach((idx) => {
    const state = doc.states[idx];
    if (configuration.has(idx)) return;

    if (!initialized.has(idx)) {
      const { onInit } = state;
      for (let i = 0; i < onInit.length; i++) { // tslint:disable-line
        backend.exec(onInit[i]);
      }
      initialized.add(idx);
    }

    const { onEnter } = state;
    for (let i = 0; i < onEnter.length; i++) { // tslint:disable-line
      backend.exec(onEnter[i]);
    }
  });

  return {
    ...interpreter,
    initialized,
    configuration: entrySet,
    isStable: false,
  };
}
