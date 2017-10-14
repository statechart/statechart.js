import { test } from 'ava';
import { StateType, TransitionType } from '@statechart/scexe';
import { transform } from './';

test('convert', (t) => {
  const doc = {
    name: 'foo',
    states: [
      {
        type: StateType.ATOMIC,
        idx: 0,
        completion: [],
        invocations: [],
        parent: 0,
        ancestors: [],
        descendants: [],
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
        events: '(function(){return true;})',
        condition: '(function(){return true;})',
      },
    ],
  };

  const out = transform(doc, i => (
    eval(i) as Function // tslint:disable-line
  ));

  t.true(out.states[0].onInit[0]());
});
