var { init, handleEvent } = require('../');
var engine = require('@statechart/compiler-engine');
var Document = require('@statechart/interpreter-document');

function compile(str) {
  var node = engine.parse(str);
  return engine.runSync(node);
}

class Backend {}

function testTransition(str, event, expected) {
  var backend = {
    query: function(value) {
      return value;
    }
  };
  var doc = new Document(compile(str), {
    ecmascript: {
      load: function(node) {
        if (node.type === 'literal') return node.value;
        return JSON.parse(node.value);
      },
    }
  });
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
      <scxml version="1.0" datamodel='ecmascript'>
        <parallel id="p">
          <state id="top">
            <state id="top-1">
              <transition event="top" target="top-2" />
            </state>

            <state id="top-2">
              <transition event="top" target="top-1" />
            </state>
          </state>

          <state id="bottom">
            <state id="bottom-1">
              <transition event="bottom" target="bottom-2" />
            </state>

            <state id="bottom-2">
              <transition event="bottom" target="bottom-1" />
            </state>
          </state>
        </parallel>
      </scxml>
      `, { name: 'top' }, [0, 1, 2, 4, 5, 6]);
    });

    it('should skip false conditions', function() {
      testTransition(`
      <scxml datamodel="ecmascript">
        <state id="s1">
          <transition event="bar" cond="false" target="s2" />
          <transition event="bar" target="s3" />
        </state>

        <state id="s2" />
        <state id="s3" />
      </scxml>
      `, { name: 'bar' }, [0, 3]);
    });

    it('should work with targetless transitions', function() {
      testTransition(`
      <scxml datamodel="ecmascript">
        <state id="s1">
          <transition event="bar" />
        </state>
      </scxml>
      `, { name: 'bar' }, [0, 1]);
    });
  });
});
