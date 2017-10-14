import { Time, Sink } from '@most/types';
import {
  Configuration,
  IEvent,
} from '@statechart/types';

export interface IDatamodelSink<Data, Executable> extends Sink<IEvent<Data> | undefined> {
  configuration(t: Time, x: Configuration): any;
  exec(t: Time, x: Executable): any;
  query(x: Executable): any;
}

export interface Invocation<Content> {
  idx: number;
  type: string;
  src: string;
  id: string;
  autoforward: boolean;
  content: Content;
  source: number;
  depth: number;
}

export const enum InvocationCommandType {
  OPEN = 0,
  CLOSE = 1,
}

export interface InvocationCommand<Content> {
  type: InvocationCommandType;
  invocation: Invocation<Content>;
}
