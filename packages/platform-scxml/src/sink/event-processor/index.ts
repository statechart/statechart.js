import { Disposable, Scheduler, Sink, Stream } from '@most/types';
import { IOProcessor } from '@statechart/platform';
import { EventRouterSink } from '../event-router';

export type MapSink<Event> = Map<string, Sink<Event>>;

class SCXMLEventProcessor<Event> implements Stream<Event> {
  private source: Stream<Event>;
  private router: Sink<Event>;

  constructor(source: Stream<Event>, router: Sink<Event>) {
    this.source = source;
    this.router = router;
  }

  run(_E: Sink<Event>, scheduler: Scheduler): Disposable {
    const { source, router } = this;
    return source.run(router, scheduler);
  }
}

export function createSCXMLEventProcessor<Event>(sinks: MapSink<Event>): IOProcessor<Event> {
  const eventRouter = new EventRouterSink(sinks);
  return (incomingEvents: Stream<Event>) =>
    new SCXMLEventProcessor(incomingEvents, eventRouter);
}
