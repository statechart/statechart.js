import unified from 'unified';
import xmlParse from '@statechart/hast-xml-parse';
import minify from 'rehype-minify-whitespace';
import lint from '@statechart/hast-scxml-lint';
import scast from '@statechart/hast-to-scast';
import analyze from '@statechart/scast-analyze';
import datamodel from '@statechart/scast-datamodel';
import scexe from '@statechart/scast-to-scexe';

export default unified()
  .use(xmlParse)
  .use(minify)
  .use(lint)
  .use(scast)
  .use(analyze)
  .use(datamodel, {
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
  .use(scexe);
