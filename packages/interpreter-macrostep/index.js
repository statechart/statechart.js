class Interpreter {
  constructor(doc, datamodels, ioprocessors, invokers) {
    var datamodel = this.datamodel = new (datamodels[doc.datamodel])(doc);
    var document = this.document = datamodel.document;
    this.ioprocessors = ioprocessors;
    this.invokers = invokers;

    this.executions = [];
    this.invocations = [];
    this.pendingInvocations = [];

    this.on('event', () => {

    });

    this.state = start(document, this);
  }

  send(payload) {
    // TODO evaluate the payload in the datamodel
    // TODO only emit the event if it's internal
    this.emit('event', payload);
  }

  subscribe(fn) {
    this.on('change', fn);
    return () => (
      this.removeListener('change', fn);
    );
  }

  serialize() {
    var state = this.state;
    return {
      configuration: state.configuration,
      history: state.history,
      datamodel: this.datamodel.serialize(),
    };
  }

  // backend api
  exec(execution) {
    this.executions.push(execution);
  }

  query(execution) {
    return this.datamodel.exec(execution);
  }

  invoke(invocation) {
    this.pendingInvocations.push(invocation);
  }

  uninvoke(invocation) {
    this.pendingInvocations = this.pendingInvocations.filter(function(pending) {
      return pending !== invocation;
    });
  }
}
