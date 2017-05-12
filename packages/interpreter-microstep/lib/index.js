import { EVENT, SYNCHRONIZE } from './actions';
import establishEntryset from './entryset';
import selectTransitions from './transition';

export function init(backend, doc) {
  return establishEntryset(
    backend,
    doc,
    {
      configuration: [],
      history: [],
      initialized: [],
    },
    doc.states[0].completion,
    new Set(),
    new Set()
  );
}

export const handleEvent = selectTransitions;
export const synchronize = selectTransitions;
