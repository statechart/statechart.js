module.exports = Document;

class Document {
  constructor(doc, datamodels) {
    this.states = doc.states;
    this.transitions = doc.transitions;
  }

  init() {
    // create a datamodel instance
    return {

    };
  }
}
