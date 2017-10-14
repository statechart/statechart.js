import { establishEntryset } from './entryset';
import { selectTransitions } from './transition';
import { Document } from '@statechart/scexe';
import { Backend, Configuration, InterpreterState, IdxSet } from './types';

export { Backend, Configuration, InterpreterState };

export function init<Event, Executable>(
  backend: Backend<Event, Executable>,
  doc: Document<Executable>,
): InterpreterState {
  return establishEntryset(
    backend,
    doc,
    initialState(),
    new Set(doc.states[0].completion),
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
