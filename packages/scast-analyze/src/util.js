import {
  SCXML,
  STATE,
  PARALLEL,
  INITIAL,
  FINAL,
  HISTORY,
} from './identifiers';
import transform from 'unist-util-transform';
import createGroup from 'unist-util-transform-group';
import createStacker from 'unist-util-transform-stack';

export const stateTypes = new Set([
  SCXML,
  STATE,
  PARALLEL,
  INITIAL,
  FINAL,
  HISTORY,
]);

export function isState(node) {
  return !!(node && stateTypes.has(node.type));
};

export function createTranslator(passes) {
  return function translator(opts) {
    return function mapper(ast, file) {
      function init() {
        return createGroup(passes.map(function(fn) {
          return fn(opts, file);
        }));
      }

      var stacker = createStacker(SCXML, init, {
        enter: function(node, index, parent, group) {
          return group ?
            group.enter(node, index, parent) :
            node;
        },
        exit: function(node, index, parent, group) {
          return group ?
            group.exit(node, index, parent) :
            node;
        }
      });

      return transform(ast, stacker);
    };
  }
};

export function getPropLoc(node, name) {
  return (((node.data || {}).position || {}).properties || {})[name];
}
