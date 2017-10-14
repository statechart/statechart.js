import { establishEntryset } from './entryset';
import { selectTransitions } from './transition';
import {
  Backend,
  InterpreterState,
} from '@statechart/types';
import {
  Document,
} from '@statechart/scexe';

export { InterpreterState };

export function init<Data, Executable>(
  backend: Backend<Data, Executable>,
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
