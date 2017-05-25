const loaders = {
  assign: function(node) {
    return loaders.location(node.location) + '=' + node.expr.value;
  },
  bool: function(node) {
    return '!!' + loaders.expr(node);
  },
  literal: function(node) {
    return JSON.stringify(node.value);
  },
  location: function(node) {
    return '_window[' + JSON.stringify(node.value) + ']';
  },
  expr: function(node) {
    return '(function() { return ' + node.value + ' })()';
  },
  send: function(node) {
    // TODO setup the correct properties
    const props = [
      optionLoad(node, 'event', 'name'),
      optionLoad(node, 'target'),
      optionLoad(node, 't', 'type'),
      optionLoad(node, 'id'),
      optionLoad(node, 'delay'),
      optionLoad(node, 'params'),
      optionLoad(node, 'content'),
    ].filter(function(p) { return p; }).join(',');
    return `_send({${props}})`;
  },
}

function optionLoad(node, name, propName) {
  propName = propName || name;
  var value = node[name];
  return value ?
    `${propName}:${load(value)}` :
    '';
}

function load(ast) {
  const type = ast.type;
  const loader = loaders[type];
  if (!loader) {
    console.error(ast);
    throw new Error('Invalid expr type: ' + type);
  }
  return loader(ast);
}

export default load;
