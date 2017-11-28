const loaders = {
  assign: function(node) {
    const props = node.props || {};
    return load(props.location) + '=' + load(props.value);
  },
  literal: function(node) {
    return JSON.stringify(node.value);
  },
  location: function(node) {
    const path = node.value.split('.').map((part) => JSON.stringify([part])).join('');
    return `_window${path}`;
  },
  expr: function(node) {
    return `(function() { return ${node.value} }).call(_window)`;
  },
  eval: function(node) {
    return `(${node.value}).call(_window, _window, _window)`;
  },
  script: function(node) {
    return `(function() { ${node.value} }).call(_window)`;
  },
  script_ext: function(node) {
    const props = node.props || {};
    return `_load(${load(props.src)})`;
  },
  foreach: function(node) {
    const props = node.props;
    return `_foreach(${load(props.array)}, function(${
      props.item ? load(props.item) : '_item'
    }, ${
      props.index ? load(props.index) : '_index'
    }) {
      ${node.children.map(load).join(';\n')};
    })`;
  },
  cond: function(node) {
    return node.children.map(function(clause) {
      const props = clause.props || {};
      return `(${
        props.condition ? load(props.condition) : 'true'
      } && (function() {
        ${clause.children.map(load).join(';\n')};
        return true;
      })())`;
    }).join('||');
  },
  log: function(node) {
    const props = formatProps([
      optionLoad(node, 'label'),
      optionLoad(node, 'value'),
    ]);
    return `_log(${props})`;
  },
  param: function(node) {
    const { name, value } = node.props || {};
    return `${load(name)}:${load(value)}`;
  },
  send: function(node) {
    // TODO setup the correct properties
    const children = node.children || [];
    const props = formatProps([
      optionLoad(node, 'event', 'name'),
      optionLoad(node, 'target'),
      optionLoad(node, 'type'),
      optionLoad(node, 'id'),
      optionLoad(node, 'delay'),
      optionLoad(node, 'content', 'data'),
      children.length ?
        `data:{${children.map(load).join(',')}}` :
        '',
    ]);
    return `_send(${props})`;
  },
  data: function(node) {
    const { id, value, src } = node;
    const location = loaders.location({value: id});
    const expr = src ?
      `fetch(${JSON.stringify(src)})` :
      load(value);
    return `${location}=${expr}`;
  },
}

function formatProps(props) {
  const formatted = props.filter(p => p).join(',');
  return `{${formatted}}`;
}

function optionLoad(node, name, propName) {
  propName = propName || name;
  var value = (node.props || {})[name];
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
