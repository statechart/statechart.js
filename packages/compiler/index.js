var unified = require('unified');

module.exports = unified()
  .use(require('@statechart/hast-xml-parse'))
  .use(require('rehype-minify-whitespace'))
  .use(require('@statechart/hast-scxml-lint'))
  .use(require('@statechart/hast-to-scast'))
  .use(require('@statechart/scast-fetch-script'))
  .use(require('@statechart/scast-analyze'))
  .use(require('@statechart/scast-datamodel'), {
    datamodels: {
      ecmascript: function(expr) {
        if (expr.type === 'literal') return {
          type: 'expr',
          value: JSON.stringify(expr.value),
          location: expr.location
        };

        return true;
      }
    },
  })
  .use(require('@statechart/scast-to-pb'));
  // .use(function() {
  //   this.Compiler = function(node) {
  //     return require('unist-util-inspect')(node);
  //   }
  // });
