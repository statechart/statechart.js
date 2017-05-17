import establishEntryset from './entryset';
import selectTransitions from './transition';

export function init(backend, doc) {
  return establishEntryset(
    backend,
    doc,
    initialState(),
    new Set(doc.states[0].completion),
    new Set(),
    new Set()
  );
}

export const handleEvent = selectTransitions;
export const synchronize = selectTransitions;

function initialState() {
  return {
    configuration: [],
    history: [],
    initialized: [],
  };
}
