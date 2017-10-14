import { Sink, Time } from '@most/types';
import {
  Configuration,
  Document,
  IDatamodel,
  Invocation as InvocationExecutable,
} from '@statechart/types';
import { Pipe } from '../pipe/index';
import {
  Invocation,
  InvocationCommand,
  InvocationCommandType,
} from '../../types/index';

export class InvocationSink<Data, Executable, Param, Content> extends Pipe<Configuration, InvocationCommand<Param, Content>> {
  private document: Document<Executable>;
  private active: Map<InvocationExecutable<Executable>, Invocation<Param, Content>>;
  private datamodel: IDatamodel<Data, Executable>;

  constructor(
    sink: Sink<InvocationCommand<Param, Content>>,
    document: Document<Executable>,
    datamodel: IDatamodel<Data, Executable>
  ) {
    super(sink);
    this.document = document;
    this.active = new Map();
    this.datamodel = datamodel;
  }

  event(t: Time, configuration: Configuration) {
    const acc = new Map();
    const {
      datamodel,
      document: { states },
      active: activeInvocations,
      sink,
    } = this;

    configuration.forEach((idx) => {
      const {
        invocations,
        ancestors
      } = states[idx];

      for (let j = 0; j < invocations.length; j++) {
        const invocation = invocations[j];

        const prev = activeInvocations.get(invocation);
        if (prev) {
          acc.set(invocation, prev);
          continue;
        }

        let inv;

        try {
          inv = {
            idx: j,
            type: datamodel.query(invocation.type),
            src: datamodel.query(invocation.src),
            id: datamodel.query(invocation.id),
            content: datamodel.query(invocation.content),
            params: datamodel.query(invocation.params),
            source: idx,
            depth: ancestors.length,
          } as Invocation<Param, Content>;
        } catch (err) {
          sink.error(t, err);
        }

        if (inv) {
          acc.set(invocation, inv);
          sink.event(t, { type: InvocationCommandType.OPEN, invocation: inv });
        }
      }
    });

    activeInvocations.forEach(function(inv, invocation) {
      if (acc.has(invocation)) return;
      sink.event(t, { type: InvocationCommandType.CLOSE, invocation: inv });
    });

    this.active = acc;
  }
}
