var engine = require('../');
var scpb = require('@statechart/scpb');
var ss = require('snap-shot');

function compile(str) {
  return engine.process(str).then(function(file) {
    return {
      contents: scpb.decode(file.contents),
      messages: file.messages,
    };
  });
}

describe('compiler-engine', function() {
  it('should properly encode expressions', function() {
    return ss(compile(`
    <scxml version="1.0">
      <!-- comment 1 -->
      <state>
        <onentry>
          <!-- comment 2 -->
          <raise event="bar" />
          <log expr="'foo'" />
          <if cond="foo">
            <!-- comment 3 -->
            <assign location="baz" expr="foo" />
          <elseif cond="bar" />
            <assign location="bang" expr="bar" />
          <else />
            <assign location="foobar" expr="true" />
            <send event="external" type="testing" />
          </if>
        </onentry>
      </state>
    </scxml>
    `));
  });
});
