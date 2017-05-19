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
    var dm = this.datamodel = datamodels[doc.datamodel];
    if (!dm) throw new Error('Unsupported datamodel: ' + doc.datamodel);
  }

  init(api, ioprocessors) {
    return this.datamodel.init(api, ioprocessors);
  }
}

function createMatcher(matches) {
  if (matches[0] === '*') return function() { return true; }
  matches = new Set(matches);
  return function(event) {
    return matches.has(event.name);
  };
}
