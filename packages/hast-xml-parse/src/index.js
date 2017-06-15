import { SAXParser } from 'sax';

function getParent(stack) {
  return stack[stack.length - 1];
}

function getSiblings(stack, dom) {
  return stack.length === 0 ? dom : getParent(stack).children;
}

function formatAttrs(attrs) {
  return Object.keys(attrs).reduce(function(acc, name) {
    var attr = attrs[name];
    if (!acc.hasOwnProperty(name)) acc[name] = attr.value;
    return acc;
  }, {});
}

function formatLocation(parser) {
  return {
    line: parser.line,
    column: parser.column,
    offset: parser.position,
  };
}

export default function(options) {
  this.Parser = function XMLParser(doc, file) {
    return parse(String(file), options);
  }
};

function parse(str, options) {
  var dom = [];
  var tagStack = [];
  var parser = new SAXParser(false, Object.assign({
    trim: true,
    normalize: false,
    lowercase: true,
    xmlns: true,
    position: true,
  }, options));

  function onclosetag(name) {
    if (!tagStack.length) return;

    var elem = tagStack.pop();
    elem.position.end = formatLocation(parser);
    if (elem.tagName !== name) onclosetag(name);
  }

  parser.onopentag = function onopentag(node) {
    var elem = {
      type: 'element',
      tagName: node.name,
      properties: formatAttrs(node.attributes),
      children: [],
      position: {
        start: formatLocation(parser),
        end: formatLocation(parser),
      },
    };

    getSiblings(tagStack, dom).push(elem);

    tagStack.push(elem);
  };

  parser.onclosetag = onclosetag;

  parser.oncomment = function(data) {
    if (data.charAt(0) === '?') return;
    getSiblings(tagStack, dom).push({
      type: 'comment',
      value: data,
      position: {
        start: formatLocation(parser),
        end: formatLocation(parser),
      }
    });
  };

  parser.ontext =
  parser.onscript =
  parser.oncdata =
  function(text) {
    getSiblings(tagStack, dom).push({
      type: 'text',
      value: text,
      position: {
        // TODO get the correct starting location
        start: formatLocation(parser),
        end: formatLocation(parser),
      }
    });
  };

  parser.looseCase = 'slice';

  parser.write(str);

  onclosetag('');
  var endLocation = formatLocation(parser);

  parser.end();

  return {
    type: 'root',
    children: dom,
    data: {
      quirksMode: false
    },
    position: {
      start: {
        line: 0,
        column: 0,
        offset: 0,
      },
      end: endLocation,
    },
  };
}
