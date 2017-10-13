import { test, TestContext } from 'ava';
import { InvocationSink } from './';
import { InvocationCommand, InvocationCommandType } from '../../types';

class Datamodel {
  public internalEvents: any;
  public externalEvents: any;

  public $error: Error;
  public $end: boolean;
  public $event: any;
  public $configuration: any;
  public $get: boolean;

  get() {
    return this.$get = true;
  }

  exec(executable: (() => Promise<any>)) {
    return executable();
  }

  error(error: Error) {
    this.$error = error;
  }

  query(executable: (() => any)) {
    return executable();
  }

  end() {
    this.$end = true;
  }

  setEvent(event: any) {
    this.$event = event;
  }

  setConfiguration(configuration: any) {
    this.$configuration = configuration;
  }
}

class Sink {
  private t: TestContext;

  constructor(t: TestContext) {
    this.t = t;
  }

  event(_t: number, _b: any) {
    this.t.fail();
  }

  end(_t: number) {
    this.t.fail();
  }

  error(_t: number, _e: Error) {
    this.t.fail();
  }
}

test('invocations', (t) => {
  t.plan(9);

  const sink = new Sink(t);

  sink.event = (time: number, command: InvocationCommand<any, any>) => {
    if (time === 1) {
      t.true(command.type === InvocationCommandType.OPEN);
      t.true(command.invocation.id === 'id0');
    }
    if (time === 3) {
      t.true(command.type === InvocationCommandType.OPEN);
      t.true(command.invocation.id === 'id1');
    }
    if (time === 4) {
      t.true(command.type === InvocationCommandType.CLOSE);
      t.true(command.invocation.id === 'id0');
    }
    if (time === 7) {
      t.true(command.type === InvocationCommandType.CLOSE);
      t.true(command.invocation.id === 'id1');
    }
  };

  sink.error = (time: number, _error: Error) => {
    t.true(time === 6);
  };

  const throwError = () => { throw new Error() };

  const datamodel = new Datamodel();
  const document = {
    states: [
      {
        idx: 0,
        parent: 0,
        ancestors: [],
        invocations: [
          {
            type: () => 'type0',
            src: () => 'src0',
            id: () => 'id0',
            params: () => 'params0',
            autoforward: false,
            content: () => 'content0',
          }
        ],
        completion: [1],
        descendants: [1, 2],
        onEnter: [],
        onExit: [],
        data: [],
      },
      {
        idx: 1,
        parent: 0,
        ancestors: [0],
        invocations: [
          {
            type: () => 'type1',
            src: () => 'src1',
            id: () => 'id1',
            params: () => 'params1',
            autoforward: false,
            content: () => 'content1',
          }
        ],
        completion: [],
        descendants: [],
        onEnter: [],
        onExit: [],
        data: [],
      },
      {
        idx: 2,
        parent: 1,
        ancestors: [0],
        invocations: [
          {
            type: throwError,
            src: throwError,
            id: throwError,
            params: throwError,
            autoforward: false,
            content: throwError,
          }
        ],
        completion: [],
        descendants: [],
        onEnter: [],
        onExit: [],
        data: [],
      }
    ],
    transitions: []
  };

  const i = new InvocationSink(sink, document, datamodel);

  i.event(0, []);
  i.event(1, [0]);
  i.event(2, [0]);
  i.event(3, [0, 1]);
  i.event(4, [1]);
  i.event(5, [1]);
  i.event(6, [1, 2]);
  i.event(7, []);
});
