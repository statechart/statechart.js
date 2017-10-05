import unified from 'unified';
import minify from 'rehype-minify-whitespace';
import lint from '@statechart/hast-scxml-lint';
import scast from '@statechart/hast-to-scast';
import analyze from '@statechart/scast-analyze';
import scexe from '@statechart/scast-to-scexe';

export default unified()
  .use(minify)
  .use(lint)
  .use(scast)
  .use(analyze)
  .use(scexe);
