const SaxParser = require('parse5/lib/sax');

function getParent(stack) {
  return stack[stack.length - 1];
}

function getSiblings(stack, dom) {
  return stack.length === 0 ? dom : getParent(stack).children;
}

function formatAttrs(attrs) {
  return attrs.reduce(function(acc, attr) {
    var name = attr.name;
    if (!acc.hasOwnProperty(name)) acc[name] = attr.value;
    return acc;
  }, {});
}

function formatLocation(location) {
  return {
    line: location.line,
    column: location.col,
    offset: location.startOffset,
  };
}

function closeLocation(location) {
  var offset = location.endOffset - location.startOffset;
  return {
    line: location.line,
    col: location.col + offset,
    startOffset: location.endOffset,
  };
}

module.exports = function(options) {
  this.Parser = parser;

  function parser(doc, file) {
    return parse(String(file));
  }
};

function parse(str) {
  var dom = [];
  var tagStack = [];
  var parser = new SaxParser({locationInfo: true});

  function endTag(name, location) {
    if (!tagStack.length) return;

    var elem = tagStack.pop();
    if (location) elem.position.end = formatLocation(closeLocation(location));
    if (elem.tagName !== name) endTag(name, location);
  }

  parser.on('endTag', endTag);

  parser.on('startTag', function startTag(name, attrs, selfClosing, location) {
    var elem = {
      type: 'element',
      tagName: name,
      properties: formatAttrs(attrs),
      children: [],
      position: {
        start: formatLocation(location),
        end: formatLocation(closeLocation(location))
      }
    };

    getSiblings(tagStack, dom).push(elem);

    if (!selfClosing) tagStack.push(elem);
  });

  parser.on('comment', function(data, location) {
    if (data.charAt(0) === '?') return;
    getSiblings(tagStack, dom).push({
      type: 'comment',
      value: data,
      position: {
        start: formatLocation(location),
        end: formatLocation(closeLocation(location)),
      }
    });
  });

  parser.on('text', function(text, location) {
    getSiblings(tagStack, dom).push({
      type: 'text',
      value: text,
      position: {
        start: formatLocation(location),
        end: formatLocation(closeLocation(location)),
      }
    });
  });

  parser.end(str);

  endTag('');

  return {
    type: 'root',
    children: dom,
    data: {
      quirksMode: false
    }
    // TODO add position information
  };
}
