import { Sink, Scheduler, Time } from '@most/types';
import { Configuration, IDatamodel, IEvent } from '@statechart/types';
import { PromiseQueue } from '../../promise-queue/index';
import { IDatamodelSink } from '../../types/index';

export class DatamodelSink<Data, Executable> implements IDatamodelSink<Data, Executable> {
  public datamodel: IDatamodel<Data, Executable>;
  private sink: Sink<any>;
  private queue: PromiseQueue;
  private scheduler: Scheduler;

  constructor(sink: Sink<any>, datamodel: IDatamodel<Data, Executable>, scheduler: Scheduler) {
    this.sink = sink;
    this.datamodel = datamodel;
    this.scheduler = scheduler;

    this.queue = new PromiseQueue(
      () => {
        this.sink.event(
          scheduler.currentTime(),
          undefined,
        );
      },
      (error: Error) => {
        this.error(scheduler.currentTime(), error);
      },
    );
  }

  event(_T: Time, x?: IEvent<Data>) {
    this.datamodel.setEvent(x);
  }

  error(_T: Time, e: Error) {
    this.datamodel.error(e);
  }

  end(t: Time) {
    const { datamodel, sink } = this;
    datamodel.end();
    sink.end(t);
  }

  configuration(_T: Time, x: Configuration) {
    this.datamodel.setConfiguration(x);
  }

  exec(_T: Time, x: Executable) {
    const { datamodel, queue } = this;
    let value;
    try {
      value = datamodel.exec(x);
    } catch (err) {
      value = Promise.reject(err);
    }
    queue.add(value);
  }

  query(x: Executable): any {
    return this.datamodel.query(x);
  }
}
