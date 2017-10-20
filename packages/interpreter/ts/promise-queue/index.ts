export class PromiseQueue {
  private outgoing: number;
  private error: (err: Error) => void;
  private done: (value?: any) => void;

  constructor(onEmpty: Function, onError: Function) {
    this.outgoing = 0;

    this.error = (error: Error) => {
      this.outgoing--; // tslint:disable-line
      onError(error);
    };
    this.done = () => {
      if (!--this.outgoing) { // tslint:disable-line
        onEmpty();
      }
    };
  }

  add(value: any) {
    const { done, error } = this;

    if (!this.outgoing++ && !(value && value.then)) { // tslint:disable-line
      return this.done();
    }

    Promise
      .resolve(value)
      .then(done)
      .catch(error);
  }
}
