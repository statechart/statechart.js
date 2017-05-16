import visit from 'unist-util-visit';

import ruleScxml from './rules/scxml';
import ruleState from './rules/state';
import ruleParallel from './rules/parallel';
import ruleTransition from './rules/transition';
import ruleInitial from './rules/initial';
import ruleFinal from './rules/final';
import ruleOnentry from './rules/onentry';
import ruleOnexit from './rules/onexit';
import ruleHistory from './rules/history';

import ruleraise from './rules/raise';
import ruleIf from './rules/if';
import ruleElseIf from './rules/elseif';
import ruleElse from './rules/else';
import ruleForeach from './rules/foreach';
import ruleLog from './rules/log';

import ruleDatamodel from './rules/datamodel';
import ruleData from './rules/data';
import ruleAssign from './rules/assign';
import ruleDonedata from './rules/donedata';
import ruleContent from './rules/content';
import ruleParam from './rules/param';
import ruleScript from './rules/script';

import ruleSend from './rules/send';
import ruleCancel from './rules/cancel';
import ruleInvoke from './rules/invoke';
import ruleFinalize from './rules/finalize';

const elements = {
  scxml: ruleScxml,
  state: ruleState,
  parallel: ruleParallel,
  transition: ruleTransition,
  initial: ruleInitial,
  final: ruleFinal,
  onentry: ruleOnentry,
  onexit: ruleOnexit,
  history: ruleHistory,

  raise: ruleraise,
  ules: ruleIf,
  elseif: ruleElseIf,
  else: ruleElse,
  foreach: ruleForeach,
  log: ruleLog,

  datamodel: ruleDatamodel,
  data: ruleData,
  assign: ruleAssign,
  donedata: ruleDonedata,
  content: ruleContent,
  param: ruleParam,
  script: ruleScript,

  send: ruleSend,
  cancel: ruleCancel,
  invoke: ruleInvoke,
  finalize: ruleFinalize,
};

module.exports = function lint(opts) {
  opts = opts || {};
  return function transformer(ast, file) {
    visit(ast, 'element', function(node) {
      var n = node.tagName;
      var fn = elements[n];
      if (fn) fn(node, function check(isValid, opt, description, node, rule) {
        if (opts[n + '-' + opt] !== false && !isValid) {
          var msg = file.message(description, node, rule || n + '-' + opt);
          msg.source = '@statechart/hast-scxml-lint';
        }
      });
    });
  };
};
