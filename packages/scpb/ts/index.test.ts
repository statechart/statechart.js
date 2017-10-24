import { test } from 'ava';
import { Document, StateType, TransitionType } from '@statechart/scexe';
import { encode, decode } from './';

const documents: Document<Buffer>[] = [
  {
    name: '',
    datamodel: 'ecmascript',
    states: [],
    transitions: [],
    meta: {
      foo: 'bar',
    },
  },
  {
    meta: {},
    states: [
      {
        id: 'foo',
        type: StateType.COMPOUND,
        idx: 0,
        completion: [1],
        invocations: [
          {
            type: new Buffer([1]),
            src: new Buffer([2]),
            id: new Buffer([3]),
            autoforward: false,
            content: new Buffer([4]),
            onExit: [
              new Buffer([5]),
            ],
          },
          {
            type: new Buffer([1]),
            src: new Buffer([2]),
            id: new Buffer([3]),
            autoforward: false,
            content: new Buffer([4]),
            onExit: [],
          },
        ],
        parent: 0,
        ancestors: [],
        onInit: [],
        onEnter: [],
        onExit: [],
        transitions: [],
        children: [1, 2],
        hasHistory: false,
      },
      {
        type: StateType.ATOMIC,
        idx: 1,
        completion: [],
        invocations: [],
        parent: 0,
        ancestors: [0],
        onInit: [],
        onEnter: [],
        onExit: [],
        transitions: [0],
        children: [],
        hasHistory: false,
      },
      {
        type: StateType.ATOMIC,
        idx: 2,
        completion: [],
        invocations: [],
        parent: 0,
        ancestors: [0],
        onInit: [
          new Buffer([1]),
        ],
        onEnter: [
          new Buffer([1]),
        ],
        onExit: [
          new Buffer([1]),
        ],
        transitions: [1],
        children: [1, 3],
        hasHistory: false,
        name: 'bar',
      },
    ],
    transitions: [
      {
        type: TransitionType.EXTERNAL,
        idx: 0,
        source: 1,
        targets: [2],
        conflicts: [1],
        exits: [1],
        onTransition: [
          new Buffer([1]),
        ],
      },
      {
        type: TransitionType.EXTERNAL,
        idx: 1,
        source: 2,
        targets: [1],
        conflicts: [0],
        exits: [2],
        onTransition: [],
        event: new Buffer([1,2,3]),
        condition: new Buffer([6]),
        name: 'foo',
      },
      {
        type: TransitionType.EXTERNAL,
        idx: 1,
        source: 2,
        targets: [],
        conflicts: [],
        exits: [],
        onTransition: [],
      },
    ],
  },
];


documents.forEach((document, i) => {
  test(`document ${i}`, (t) => {
    t.deepEqual(decode(encode(document).finish()), document);
  });
});

test('optional meta', (t) => {
  const document = {
    states: [],
    transitions: [],
  };
  t.deepEqual(decode(encode(document).finish()), Object.assign({ meta: {} }, document));
});
