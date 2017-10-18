import { Disposable, Time, Scheduler, Sink, Stream } from '@most/types';
import { StreamSink } from '@statechart/util-most';
import { Router } from '../router/index';

export type IOProcessor<Event> = (events: Stream<Event>) => Stream<Event>;

export type IOProcessorMap<Event> = Map<string, IOProcessor<Event>>;

export class IOProcessorRouter<Event> extends Router<Event, Event, IOProcessor<Event>> {
  private instances: Map<IOProcessor<Event>, Sink<Event>>;

  constructor(
    sink: Sink<Event>,
    scheduler: Scheduler,
    processors: IOProcessorMap<Event>,
  ) {
    super(sink, scheduler, processors);
    this.instances = new Map();
  }

  init(
    t: Time,
    x: Event,
    sink: Sink<Event>,
    scheduler: Scheduler,
    processor: IOProcessor<Event>,
  ): Disposable | void {
    const { instances } = this;
    const instance = instances.get(processor);
    if (typeof instance !== 'undefined') {
      instance.event(t, x);
      return;
    }

    const streamSink = new StreamSink();

    const stream = processor(streamSink);
    const disposable = stream.run(
      sink,
      scheduler,
    );

    instances.set(processor, streamSink);

    streamSink.event(t, x);

    return disposable;
  }
}
