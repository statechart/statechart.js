var { init, handleEvent } = require('../');
var engine = require('@statechart/compiler-engine');
var Document = require('@statechart/interpreter-document');

function compile(str) {
  var node = engine.parse(str);
  return engine.runSync(node);
}

class Backend {}

function testTransition(str, event, expected) {
  var backend = new Backend();
  var doc = new Document(compile(str));
  var interpreter = init(backend, doc);
  var { configuration } = handleEvent(backend, doc, interpreter, event);
  expect(configuration).toEqual(expected);
}

describe('interpreter-microstep', function() {
  describe('handleEvent', function() {
    it('should pick the correct states', function() {
      testTransition(`
      <scxml datamodel="ecmascript">
        <state id="s1">
          <transition event="foo" target="s2" />
        </state>

        <state id="s2" />
      </scxml>
      `, { name: 'foo' }, [0, 2]);
    });

    it('should pick nested states', function() {
      testTransition(`
      <scxml datamodel="ecmascript">
        <state id="s1">
          <state id="s1-1">
            <transition event="bar" target="s2" />
          </state>
        </state>

        <state id="s2">
          <state id="s2-1" />
        </state>
      </scxml>
      `, { name: 'bar' }, [0, 3, 4]);
    });

    it('should pass on unmatched events', function() {
      testTransition(`
      <scxml datamodel="ecmascript">
        <state id="s1">
          <transition event="bar" target="s2" />
        </state>

        <state id="s2" />
      </scxml>
      `, { name: 'foo' }, [0, 1]);
    });

    it('should work with parallel', function() {
      testTransition(`
      <scxml datamodel="ecmascript">
        <parallel id="s1">
          <state />
          <state>
            <transition event="bar" target="s2" />
          </state>
        </parallel>

        <parallel id="s2">
          <state />
          <state />
        </parallel>
      </scxml>
      `, { name: 'bar' }, [0, 4, 5, 6]);
    });
  });
});
