import { Sink, Time } from '@most/types';
import uuid from 'uuid/v4';
import {
  Configuration,
} from '@statechart/interpreter-microstep';
import {
  IDatamodel,
  IInvocationCommand,
  EInvocationCommandType,
} from '@statechart/types';
import {
  Document,
  Invocation as InvocationExecutable,
} from '@statechart/scexe';
import { Pipe } from '../pipe/index';

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

export class InvocationSink<Event, Executable, Content>
    extends Pipe<Configuration, IInvocationCommand<Invocation<Content>>> {
  private document: Document<Executable>;
  private active: Map<InvocationExecutable<Executable>, Invocation<Content>>;
  private activeIds: Map<InvocationExecutable<Executable>, string>;
  private datamodel: IDatamodel<Configuration, Event, Executable>;

  constructor(
    sink: Sink<IInvocationCommand<Invocation<Content>>>,
    document: Document<Executable>,
    datamodel: IDatamodel<Configuration, Event, Executable>,
  ) {
    super(sink);
    this.document = document;
    this.active = new Map();
    this.activeIds = new Map();
    this.datamodel = datamodel;
  }

  event(t: Time, configuration: Configuration) {
    const acc = new Map();
    const accIds = new Map();
    const {
      datamodel,
      document: { states },
      active: activeInvocations,
      activeIds,
      sink,
    } = this;

    configuration.forEach((idx) => {
      const {
        invocations,
        ancestors,
      } = states[idx];

      for (let j = 0; j < invocations.length; j++) { // tslint:disable-line
        const invocation = invocations[j];

        const prev = activeInvocations.get(invocation);
        if (prev) {
          acc.set(invocation, prev);
          accIds.set(invocation, activeIds.get(invocation));
          continue;
        }

        let inv: Invocation<Content> | undefined;

        try {
          inv = {
            idx: j,
            type: datamodel.query(invocation.type),
            src: datamodel.query(invocation.src),
            id: datamodel.query(invocation.id),
            content: datamodel.query(invocation.content),
            source: idx,
            depth: ancestors.length,
            autoforward: invocation.autoforward,
          };
        } catch (err) {
          sink.error(t, err);
        }

        if (inv) {
          const id = uuid();
          acc.set(invocation, inv);
          accIds.set(invocation, id);
          sink.event(t, { id, type: EInvocationCommandType.OPEN, invocation: inv });
        }
      }
    });

    activeInvocations.forEach((inv, invocation) => {
      if (acc.has(invocation)) return;
      const id = activeIds.get(invocation) as string;
      sink.event(t, { id, type: EInvocationCommandType.CLOSE, invocation: inv });
    });

    this.active = acc;
    this.activeIds = accIds;
  }
}
