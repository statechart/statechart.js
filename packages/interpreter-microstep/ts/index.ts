import { establishEntryset } from './entryset';
import { selectTransitions } from './transition';
import { Document } from '@statechart/scexe';
import { Backend, Configuration, InterpreterState, IdxSet } from './types';

export { Backend, Configuration, InterpreterState };

export function init<Event, Executable>(
  backend: Backend<Event, Executable>,
  doc: Document<Executable>,
): InterpreterState {
  const { states } = doc;
  const s = initialState();

  if (states.length < 1) return { ...s, isStable: true };

  return establishEntryset(
    backend,
    doc,
    s,
    new Set(states[0].completion),
    new Set(),
    new Set(),
  );
}

export const handleEvent = selectTransitions;
export const synchronize = selectTransitions;

function initialState(): InterpreterState {
  return {
    configuration: new Set() as Configuration,
    history: new Set() as IdxSet,
    initialized: new Set() as IdxSet,
    isStable: false,
  };
}
