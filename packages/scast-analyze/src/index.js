import { createTranslator } from './util';
import { SCXML } from './identifiers';
import ifToCond from './if-to-cond';
import stateSort from './state/sort';
import stateIdentify from './state/identify';
import transitionIdentify from './transition/identify';
import stateMap from './state/map';
import stateAncestors from './state/ancestors';
import stateDescendants from './state/descendants';
import stateCompletion from './state/completion';
import stateCompletionParallel from './state/completion-parallel';
import stateCompletionHistory from './state/completion-history';
import stateType from './state/type';
import transitionType from './transition/type';
import transitionExitSet from './transition/exit-set';
import transitionConflicts from './transition/conflicts';

export default [
  createTranslator([
    ifToCond,

    stateSort,

    // identify
    stateIdentify,
    transitionIdentify,

    // accumulate
    stateMap,

    // state heiarchy
    stateAncestors,
    stateDescendants,
    stateCompletion,
    stateCompletionParallel,

    // establish types
    stateType,
    transitionType,
  ]),
  createTranslator([
    stateCompletionHistory,
    transitionExitSet,
  ]),
  createTranslator([
    transitionConflicts
  ]),
  createTranslator([
    function() {
      return {
        types: [SCXML],
        enter: function cleanup(scxml) {
          const data = scxml.data;
          delete data.states;
          delete data.transitions;
          delete data.ids;
        },
      };
    }
  ]),
  function() {
    return function(root) {
      root.data.scastAnalyzed = true;
      return root;
    }
  }
];
