import {
  INITIAL,
} from '../identifiers';

export function getTransitionSource(states, transition) {
  var source = states.get(transition.data.source);
  if (source.type === INITIAL) source = states.get(source.data.parent);
  return source;
}
