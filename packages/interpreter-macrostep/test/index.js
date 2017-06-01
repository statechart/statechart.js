var createInterpreter = require('../');
var engine = require('@statechart/compiler-engine');
var Document = require('@statechart/interpreter-document');

function compile(str) {
  var node = engine.parse(str);
  return engine.runSync(node);
}

var ecmascript = {
  load: function(node) {
    if (node.type === 'literal') return JSON.stringify(node.value);
    return node.value;
  },
  init: function(api, ioprocessors) {
    return {
      exec: function(ast) {
        return eval(ast);
      },
      push: function() {
        return ecmascript;
      },
      event: function() {
        return this;
      },
      flush: function() {
        return Promise.resolve();
      },
    };
  },
};

function testTransition(str, expected, events) {
  return function() {
    var doc = new Document(compile(str), {
      ecmascript: ecmascript
    });

    var interpreter = createInterpreter(doc, {

    }, {

    });

    return interpreter
      .start()
      .then(function() {
        expect(interpreter.getConfiguration()).toEqual(expected);
        return loop(interpreter, events || []);
      });
  };
}

function loop(interpreter, events) {
  var pair = events.shift();
  if (!pair) return true;
  var event = pair[0];
  var configuration = pair[1];

  return interpreter
    .send(event)
    .then(function() {
      expect(interpreter.getConfiguration()).toEqual(configuration);
      return loop(interpreter, events);
    });
}

describe('interpreter-macrostep', function() {
  describe('handleEvent', function() {
    it('should pick the correct states', testTransition(`
      <scxml datamodel="ecmascript">
        <state id="s1">
          <transition event="foo" target="s2" />
        </state>

        <state id="s2" />
      </scxml>
    `,
      [ 's1' ], [
        [{ name: 'foo' }, [ 's2' ]]
      ]
    ));

    it('should pick nested states', testTransition(`
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
    `,
      [ 's1', 's1-1' ], [
        [{ name: 'bar' }, [ 's2', 's2-1' ]]
      ]
    ));

    it('should pass on unmatched events', testTransition(`
      <scxml datamodel="ecmascript">
        <state id="s1">
          <transition event="bar" target="s2" />
        </state>

        <state id="s2" />
      </scxml>
    `,
      [ 's1' ], [
        [{ name: 'foo' }, [ 's1' ]]
      ]
    ));

    it('should work with parallel', testTransition(`
      <scxml datamodel="ecmascript">
        <parallel id="s1">
          <state id="s1-1" />
          <state id="s1-2">
            <transition event="bar" target="s2" />
          </state>
        </parallel>

        <parallel id="s2">
          <state id="s2-1" />
          <state id="s2-2">
            <transition event="foo" target="s1" />
          </state>
        </parallel>
      </scxml>
    `,
      [ 's1', 's1-1', 's1-2' ], [
        [{ name: 'bar' }, [ 's2', 's2-1', 's2-2' ]],
        [{ name: 'foo' }, [ 's1', 's1-1', 's1-2' ]],
        [{ name: 'bar' }, [ 's2', 's2-1', 's2-2' ]],
      ]
    ));

    it('should invoke', testTransition(`
      <scxml datamodel="ecmascript">
        <state>
          <invoke type="http://www.w3.org/TR/scxml/" id="123">
            <param name="foo" expr="'bar'" />
          </invoke>
        </state>
      </scxml>
    `,
      [ ]
    ));
  });
});
