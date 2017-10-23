import {
  IOProcessorMap,
  InvokerMap,
  InvocationInstance,
} from '@statechart/platform';
import {
  Scheduler,
  Stream,
} from '@most/types';
import { createSCXMLEventProcessor } from './sink/event-processor/index';
import {
  createSCXMLInterpreter,
  createDatamodel,
} from './sink/interpreter-invoker/index';

export const SCXML = 'http://www.w3.org/TR/scxml/';
export const SCXML_EVENT_PROCESSOR = `${SCXML}#SCXMLEventProcessor`;

export {
  InvocationInstance,
  Scheduler,
  Stream,
};

export function createSCXMLPlatform<Event, Executable, Invocation>(
  createDatamodel: createDatamodel<Event, Executable>,
) {
  return (
    ioprocessors: IOProcessorMap<Event>,
    invokers: InvokerMap<Event, Invocation>,
  ) => {
    const sinks = new Map();
    invokers.set(SCXML, createSCXMLInterpreter(createDatamodel, sinks));
    ioprocessors.set(SCXML_EVENT_PROCESSOR, createSCXMLEventProcessor(sinks));
  };
}
