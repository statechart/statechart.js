var parse = require('../');
var ss = require('snap-shot');

function parseStr(str) {
  var parser = {};
  parse.call(parser);
  ss(parser.Parser({}, str));
}

describe('hast-xml-parse', function() {
  it('should parse a xml file', function() {
    parseStr(`
    <scxml version=1.0>
      <state>
        <script>
          var foo = 1;
          <thingy>
            <test />
          </thingy>
        </script>
      </state>
    </scxml>
    `);
  });

  it('should support self closing', function() {
    parseStr(`
    <scxml datamodel="ecmascript">
      <state id="s1">
        <transition event="foo" target="s2" />
      </state>

      <state id="s2" />
    </scxml>
    `)
  });
});
