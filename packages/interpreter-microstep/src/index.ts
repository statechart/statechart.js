import { establishEntryset } from './entryset';
import { selectTransitions } from './transition';
import { Document } from '@statechart/scexe';
import { Backend, Configuration, InterpreterState } from './types';

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

function initialState() {
  return {
    configuration: new Set(),
    history: new Set(),
    initialized: new Set(),
    isStable: false,
  };
}
