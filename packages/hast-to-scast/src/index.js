import map from 'unist-util-map';

export default function() {
  return function(ast) {
    return map(ast, function(node) {
      return node.type === 'element' ?
        transformElement(node) :
        node;
    });
  }
};

function transformElement(node) {
  var fn = tags[node.tagName];
  return fn ? fn(node) : node;
}

function parseStringList(string) {
  return string ? string.split(/\s+/).filter(function(el) {
    return !!el;
  }) : [];
}

function parsePropAlias(props, name, type, getLoc) {
  return (
    code(props, name, 'literal', getLoc) ||
    code(props, name + type, type, getLoc)
  );
}

function parseBool(value) {
  return (value || '').trim().toLowerCase() === 'true';
}

function code(props, name, type, getLoc) {
  var value = props[name];
  if (value && value.type) return value;
  return typeof value !== 'undefined' ? {
    type: type || 'expr',
    value: value,
    location: getLoc(name),
  } : undefined;
}

function h(type, node, props, propPositions) {
  const data = node.data || {};
  if (propPositions) {
    const position = data.position = data.position || {};
    data.properties = propPositions;
  }
  return Object.assign({
    type: type,
    data: data,
    position: node.position,
    children: node.children,
  }, props || {});
}

function propLocation(name) {
  const position = ((this.data || {}).position || {});
  const openPosition = position.opening || this;
  const propPositions = position.properties || {};
  return propPositions[name] || openPosition;
}

const properties = 'properties';

const tags = {
  scxml: function(node) {
    const getLoc = propLocation.bind(node);
    const props = node[properties];
    return h('scxml', node, {
      initial: parseStringList(props.initial),
      datamodel: props.datamodel,
      binding: props.binding || 'early',
      name: props.name,
    }, {
      initial: getLoc('initial'),
      datamodel: getLoc('datamodel'),
      binding: getLoc('binding'),
      name: getLoc('name'),
    });
  },
  state: function(node) {
    const getLoc = propLocation.bind(node);
    const props = node[properties];
    return h('state', node, {
      id: props.id,
      initial: parseStringList(props.initial),
      name: props.name,
    }, {
      id: getLoc('id'),
      initial: getLoc('initial'),
      name: getLoc('name'),
    });
  },
  parallel: function(node) {
    const getLoc = propLocation.bind(node);
    const props = node[properties];
    return h('parallel', node, {
      id: props.id,
      name: props.name,
    }, {
      id: getLoc('id'),
      name: getLoc('name'),
    });
  },
  transition: function(node) {
    const getLoc = propLocation.bind(node);
    const props = node[properties];
    return h('transition', node, {
      event: parseStringList(props.event),
      target: parseStringList(props.target),
      t: props.type || 'external',
      cond: code(props, 'cond', 'expr', propLocation.bind(node)),
      name: props.name,
    });
  },
  initial: function(node) {
    const getLoc = propLocation.bind(node);
    const props = node[properties];
    return h('initial', node, {
      name: props.name,
    }, {
      name: getLoc('name'),
    });
  },
  final: function(node) {
    const getLoc = propLocation.bind(node);
    const props = node[properties];
    return h('final', node, {
      id: props.id,
      name: props.name,
    }, {
      id: getLoc('id'),
      name: getLoc('name'),
    });
  },
  onentry: function(node) {
    return h('onentry', node);
  },
  onexit: function(node) {
    return h('onexit', node);
  },
  onevent: function(node) {
    const getLoc = propLocation.bind(node);
    const props = node[properties];
    const event = parseStringList(props.event);
    if (!event.length) event.push('*');
    return h('transition', node, {
      event: event,
      cond: code(props, 'cond', 'expr', getLoc),
      name: props.name,
      target: false,
    }, {
      event: getLoc('event'),
      cond: getLoc('cond'),
      name: getLoc('name'),
    });
  },
  history: function(node) {
    const getLoc = propLocation.bind(node);
    const props = node[properties];
    return h('history', node, {
      id: props.id,
      t: props.type || 'shallow',
      name: props.name,
    }, {
      id: getLoc('id'),
      t: getLoc('type'),
      name: getLoc('name'),
    });
  },
  raise: function(node) {
    const getLoc = propLocation.bind(node);
    const props = node[properties];
    return h('raise', node, {
      event: props.event,
    }, {
      event: getLoc('event'),
    });
  },
  'if': function(node) {
    const getLoc = propLocation.bind(node);
    const props = node[properties];
    return h('if', node, {
      cond: code(props, 'cond', 'expr', getLoc),
    }, {
      cond: getLoc('cond')
    });
  },
  elseif: function(node) {
    const getLoc = propLocation.bind(node);
    const props = node[properties];
    return h('elseif', node, {
      cond: code(props, 'cond', 'expr', getLoc),
    }, {
      cond: getLoc('cond'),
    });
  },
  'else': function(node) {
    return h('else', node);
  },
  foreach: function(node) {
    const getLoc = propLocation.bind(node);
    const props = node[properties];
    return h('foreach', node, {
      item: props.item,
      index: props.index,
      array: code(props, 'array', 'location', getLoc),
    }, {
      item: getLoc('item'),
      index: getLoc('index'),
      array: getLoc('array'),
    });
  },
  log: function(node) {
    const getLoc = propLocation.bind(node);
    const props = node[properties];
    return h('log', node, {
      label: props.label,
      expr: code(props, 'expr', 'expr', getLoc),
    }, {
      label: getLoc('label'),
      expr: getLoc('expr'),
    });
  },
  datamodel: function(node) {
    return h('datamodel', node);
  },
  data: function(node) {
    const getLoc = propLocation.bind(node);
    const props = node[properties];
    return h('data', node, {
      id: props.id,
      src: props.src,
      expr: code(props, 'expr', 'expr', getLoc),
    });
  },
  assign: function(node) {
    const getLoc = propLocation.bind(node);
    const props = node[properties];
    return h('assign', node, {
      location: code(props, 'location', 'location', getLoc),
      expr: code(props, 'expr', 'expr', getLoc),
    }, {
      location: getLoc('location'),
      expr: getLoc('expr'),
    });
  },
  donedata: function(node) {
    return h('donedata', node);
  },
  content: function(node) {
    const getLoc = propLocation.bind(node);
    const props = node[properties];
    return h('content', node, {
      expr: code(props, 'expr', 'expr', getLoc),
    }, {
      expr: getLoc('expr'),
    });
  },
  param: function(node) {
    const getLoc = propLocation.bind(node);
    const props = node[properties];
    return h('param', node, {
      name: props.name,
      location: code(props, 'location', 'location', getLoc),
      expr: code(props, 'expr', 'expr', getLoc),
    }, {
      name: getLoc('name'),
      location: getLoc('location'),
      expr: getLoc('expr'),
    });
  },
  script: function(node) {
    const getLoc = propLocation.bind(node);
    const props = node[properties];
    return h('script', node, {
      src: props.src,
    }, {
      src: getLoc('src'),
    });
  },
  send: function(node) {
    const getLoc = propLocation.bind(node);
    var props = node[properties];
    return h('send', node, {
      namelist: parseStringList(props.namelist),
      event: parsePropAlias(props, 'event', 'expr', getLoc),
      target: parsePropAlias(props, 'target', 'expr', getLoc),
      t: parsePropAlias(props, 'type', 'expr', getLoc),
      id: parsePropAlias(props, 'id', 'location', getLoc),
      delay: parsePropAlias(props, 'delay', 'expr', getLoc),
    }, {
      namelist: getLoc('namelist'),
      event: getLoc('event', 'expr'),
      target: getLoc('target', 'expr'),
      t: getLoc('type', 'expr'),
      id: getLoc('id', 'location'),
      delay: getLoc('delay', 'expr'),
    });
  },
  cancel: function(node) {
    const getLoc = propLocation.bind(node);
    return h('cancel', node, {
      sendid: parsePropAlias(node[properties], 'sendid', 'expr', getLoc),
    }, {
      sendid: getLoc('sendid', 'expr'),
    })
  },
  invoke: function(node) {
    const getLoc = propLocation.bind(node);
    var props = node[properties];
    return h('invoke', node, {
      namelist: parseStringList(props.namelist),
      autoforward: parseBool(props.autoforward),
      t: parsePropAlias(props, 'type', 'expr', getLoc),
      src: parsePropAlias(props, 'src', 'expr', getLoc),
      id: parsePropAlias(props, 'id', 'location', getLoc),
    }, {
      namelist: getLoc('namelist'),
      autoforward: getLoc('autoforward'),
      t: getLoc('type', 'expr'),
      src: getLoc('src', 'expr'),
      id: getLoc('id', 'location'),
    });
  },
  finalize: function(node) {
    return h('finalize', node);
  }
};
