import { createTranslator } from './util';
import { SCXML } from './identifiers';
import inlineContent from './inline-content';
import ifToCond from './if-to-cond';

import invokeNamelist from './invoke/namelist';
import invokeFinalize from './invoke/finalize';
import invokeChildren from './invoke/children';

import stateSort from './state/sort';
import stateIdentify from './state/identify';
import stateMap from './state/map';
import stateAncestors from './state/ancestors';
import stateDescendants from './state/descendants';
import stateCompletion from './state/completion';
import stateCompletionParallel from './state/completion-parallel';
import stateCompletionHistory from './state/completion-history';
import stateInvocations from './state/invocations';
import stateDatamodel from './state/datamodel';
import stateExecutables from './state/executables';
import stateType from './state/type';

import transitionIdentify from './transition/identify';
import transitionType from './transition/type';
import transitionExitSet from './transition/exit-set';
import transitionConflicts from './transition/conflicts';

export default [
  createTranslator([
    inlineContent,
    ifToCond,

    invokeNamelist,
    invokeFinalize,
    invokeChildren,

    stateSort,

    // identify
    stateIdentify,
    transitionIdentify,

    // accumulate
    stateMap,
    stateInvocations,
    stateDatamodel,
    stateExecutables,

    // state heiarchy
    stateAncestors,
    stateDescendants,
    stateCompletion,
    stateCompletionParallel,
  ]),
  createTranslator([
    // establish types
    stateType,
    transitionType,

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
