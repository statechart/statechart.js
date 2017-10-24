import { test } from 'ava';
import { Document, StateType, TransitionType } from '@statechart/scexe';
import { transform } from './';

test('convert', (t) => {
  const doc: Document<string> = {
    name: 'foo',
    states: [
      {
        type: StateType.ATOMIC,
        idx: 0,
        completion: [],
        invocations: [
          {
            type: '(function(){return true;})',
            src: '(function(){return true;})',
            id: '(function(){return true;})',
            autoforward: false,
            content: '(function(){return true;})',
            onExit: [
              '(function(){return true;})',
            ],
          },
        ],
        parent: 0,
        ancestors: [],
        onInit: [
          '(function(){return true;})',
        ],
        onEnter: [
          '(function(){return true;})',
        ],
        onExit: [],
        transitions: [0],
        children: [],
        hasHistory: false,
      },
    ],
    transitions: [
      {
        type: TransitionType.EXTERNAL,
        idx: 0,
        onTransition: [
          '(function(){return true;})',
        ],
        source: 1,
        targets: [2],
        conflicts: [1, 2, 3],
        exits: [1],
        event: '(function(){return true;})',
      },
    ],
  };

  const out = transform(doc, i => (
    eval(i) as Function // tslint:disable-line
  ));

  t.true(out.states[0].onInit[0]());
});
