export default class Document {
  constructor(doc, datamodels) {
    this.states = doc.states;
    this.transitions = doc.transitions.map(function(transition) {
      return Object.assign(
        {},
        transition,
        {
          events: transition.events && createMatcher(transition.events)
        }
      )
    });
  }

  init() {
    // create a datamodel instance
    return {

    };
  }
}

function createMatcher(matches) {
  if (matches[0] === '*') return function() { return true; }
  matches = new Set(matches);
  return function(event) {
    return matches.has(event.name);
  };
}
