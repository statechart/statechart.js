import jsx from 'babel-plugin-syntax-jsx';
import vfile from 'vfile';
import engine from './engine';
import scexeToBabel from './scast-to-babel-scexe';

const transformOnType = (transforms, fallback) => (node, opts) => {
  const transformer = transforms[node.type]
  if (transformer) {
    return transformer(node, opts);
  }
  if (!fallback) throw new Error(`${node.type} could not be transformed`);
  return fallback(node, opts);
}

function extractLoc(node) {
  if (!node) return null;
  const { loc = {} } = node;
  const {start, end, indent} = loc;
  return {
    start: extractPos(start),
    end: extractPos(end),
    indent
  };
}

function extractPos(pos) {
  if (!pos) return null;
  const { line, column } = pos;
  return { line, column };
}

export default ({ types: t }) => {
  const JSXIdentifier = node => node.name;

  // TODO allow setting the namespace
  const JSXNamespacedName = node => node.namespace.name === 'scxml' ?
    node.name.name :
    `${node.namespace.name}:${node.name.name}`;

  const JSXElementName = transformOnType({ JSXIdentifier, JSXNamespacedName });

  const JSXEmptyExpression = (node, opts) => ({
    type: 'comment',
    value: node.innerComments.map(c => c.value).join(''),
    position: extractLoc(node),
  });

  const TemplateLiteral = (node) => {
    if (node.expressions.length) return node;
    return node.quasis.map(q => q.value.raw).join('');
  };

  const BooleanLiteral = (node) => node.value;
  const NullLiteral = (node) => null;
  const NumericLiteral = (node) => node.value;
  const StringLiteral = (node) => node.value;

  const Expression = transformOnType({
    JSXEmptyExpression,
    BooleanLiteral,
    TemplateLiteral,
    NullLiteral,
    NumericLiteral,
    StringLiteral,
  }, ((node, opts) => (opts.transformExpression ? opts.transformExpression(node) : {
    type: 'expr',
    value: node,
    position: extractLoc(node),
  })));

  const JSXExpressionContainer = (node, opts) => Expression(node.expression, opts);

  const JSXAttributeName = transformOnType({ JSXIdentifier, JSXNamespacedName });

  const JSXAttributeValue = transformOnType({
    StringLiteral,
    JSXExpressionContainer
  });

  const JSXAttributes = (nodes, opts) => {
    const properties = {};
    const locations = {};

    nodes.forEach(node => {
      switch (node.type) {
        case 'JSXAttribute': {
          const prop = JSXAttributeName(node.name, opts);
          properties[prop] = JSXAttributeValue(node.value, opts);

          const { start } = extractLoc(node.name);
          const { end } = extractLoc(node.value);
          locations[prop] = { start, end };

          break;
        }
        default:
        throw new Error(`${node.type} cannot be used as a JSX attribute`)
      }
    })

    return { properties, locations };
  };

  const JSXText = (node) => {
    const value = node.value.trim();
    if (!value) return null;
    return {
      type: 'text',
      value: value,
      position: extractLoc(node),
    };
  };

  const JSXElement = (node, opts) => {
    const tagName = JSXElementName(node.openingElement.name, opts);

    const { properties, locations } = JSXAttributes(node.openingElement.attributes, opts);
    return {
      type: 'element',
      tagName,
      properties,
      children: node.closingElement ? JSXChildren(node.children, opts) : [],
      position: extractLoc(node),
      data: {
        position: {
          opening: extractLoc(node.openingElement),
          closing: extractLoc(node.closingElement),
          properties: locations,
        }
      }
    }
  };

  const JSXChild = transformOnType({ JSXText, JSXElement, JSXExpressionContainer })

  const JSXChildren = (nodes, state) => nodes.map(n => JSXChild(n, state)).filter(Boolean);

  function rootElement(node, state) {
    const { scexeProp = 'scexe', generate = true, strict = true, transformExpression } = state.opts;
    const opts = { scexeProp, generate, strict, transformExpression };

    const hast = JSXElement(node, opts);
    const file = vfile(); // TODO pass opts
    const scexe = engine.runSync({
      type: 'root',
      children: [
        hast,
      ],
      data: {},
    }, file);

    if (generate) {
      const fatal = file.messages.filter(msg => strict || msg.fatal);
      if (fatal.length) {
        console.log(fatal);
        const { message, line, column } = fatal[0];

        const error = new SyntaxError(message);
        error.loc = { line, column };
        throw error;
      }

      return scexeToBabel(scexe, t);
    }

    node[scexeProp] = { scexe, file };
    return node;
  }

  return {
    inherits: jsx,
    visitor: {
      JSXElement(path, state) {
        const { name } = path.node.openingElement;
        const tagName = JSXElementName(name);
        if (tagName === 'scxml') path.replaceWith(rootElement(path.node, state));
      }
    }
  };
};
