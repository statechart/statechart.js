import unified from 'unified';
import xmlParse from '@statechart/hast-xml-parse';
import minify from 'rehype-minify-whitespace';
import lint from '@statechart/hast-scxml-lint';
import scast from '@statechart/hast-to-scast';
import analyze from '@statechart/scast-analyze';
// import datamodel from '@statechart/scast-datamodel';
import scexe from '@statechart/scast-to-scexe';
import scpb from '@statechart/scexe-to-scpb';

export default unified()
  .use(xmlParse)
  .use(minify)
  .use(lint)
  .use(scast)
  .use(analyze)
  .use(scexe)
  .use(scpb);
