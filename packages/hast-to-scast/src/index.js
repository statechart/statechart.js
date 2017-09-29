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

function parsePropAlias(props, name, type, locations) {
  return (
    code(props, name, 'literal', locations) ||
    code(props, name + type, type, locations)
  );
}

function parseBool(value) {
  return (value || '').trim().toLowerCase() === 'true';
}

function code(props, name, type, locations) {
  locations = locations || {};
  var value = props[name];
  return typeof value !== 'undefined' ? {
    type: type || 'expr',
    value: value,
    location: locations[name],
  } : undefined;
}

function h(type, node, props) {
  return Object.assign({
    type: type,
    data: node.data || {},
    position: node.position,
    children: node.children,
  }, props || {});
}

const properties = 'properties';

var tags = {
  scxml: function(node) {
    var props = node[properties];
    return h('scxml', node, {
      initial: parseStringList(props.initial),
      datamodel: props.datamodel,
      binding: props.binding || 'early',
      name: props.name,
    });
  },
  state: function(node) {
    var props = node[properties];
    return h('state', node, {
      id: props.id,
      initial: parseStringList(props.initial),
      name: props.name,
    });
  },
  parallel: function(node) {
    var props = node[properties];
    return h('parallel', node, {
      id: props.id,
      name: props.name,
    });
  },
  transition: function(node) {
    var props = node[properties];
    return h('transition', node, {
      event: parseStringList(props.event),
      target: parseStringList(props.target),
      t: props.type || 'external',
      cond: code(props, 'cond', 'expr'),
      name: props.name,
    });
  },
  initial: function(node) {
    return h('initial', node, {
      name: props.name,
    });
  },
  final: function(node) {
    var props = node[properties];
    return h('final', node, {
      id: props.id,
      name: props.name,
    });
  },
  onentry: function(node) {
    return h('onentry', node);
  },
  onexit: function(node) {
    return h('onexit', node);
  },
  onevent: function(node) {
    var props = node[properties];
    const event = parseStringList(props.event);
    if (!event.length) event.push('*');
    return h('transition', node, {
      event: event,
      cond: code(props, 'cond', 'expr'),
      name: props.name,
      target: false,
    });
  },
  history: function(node) {
    var props = node[properties];
    return h('history', node, {
      id: props.id,
      t: props.type || 'shallow',
      name: props.name,
    });
  },
  raise: function(node) {
    var props = node[properties];
    return {
      type: 'raise',
      data: node.data || {},
      position: node.position,
      event: props.event,
    };
  },
  'if': function(node) {
    var props = node[properties];
    return h('if', node, {
      cond: code(props, 'cond', 'expr'),
    });
  },
  elseif: function(node) {
    var props = node[properties];
    return {
      type: 'elseif',
      data: node.data || {},
      position: node.position,
      cond: code(props, 'cond', 'expr'),
    };
  },
  'else': function(node) {
    var props = node[properties];
    return {
      type: 'else',
      data: node.data || {},
      position: node.position,
    };
  },
  foreach: function(node) {
    var props = node[properties];
    return h('foreach', node, {
      item: props.item,
      index: props.index,
      array: code(props, 'array', 'location'),
    });
  },
  log: function(node) {
    var props = node[properties];
    return {
      type: 'log',
      data: node.data || {},
      position: node.position,
      label: props.label,
      expr: code(props, 'expr', 'expr'),
    };
  },
  datamodel: function(node) {
    return h('datamodel', node);
  },
  data: function(node) {
    var props = node[properties];
    return h('data', node, {
      id: props.id,
      src: props.src,
      expr: code(props, 'expr', 'expr'),
    });
  },
  assign: function(node) {
    var props = node[properties];
    return h('assign', node, {
      location: code(props, 'location', 'location'),
      expr: code(props, 'expr', 'expr'),
    });
  },
  donedata: function(node) {
    return h('donedata', node);
  },
  content: function(node) {
    var props = node[properties];
    return h('content', node, {
      expr: code(props, 'expr', 'expr'),
    });
  },
  param: function(node) {
    var props = node[properties];
    return {
      type: 'param',
      data: node.data || {},
      position: node.position,
      name: props.name,
      location: code(props, 'location', 'location'),
      expr: code(props, 'expr', 'expr'),
    };
  },
  script: function(node) {
    var props = node[properties];
    return h('script', node, {
      src: props.src,
    });
  },
  send: function(node) {
    var props = node[properties];
    return h('send', node, {
      namelist: parseStringList(props.namelist),
      event: parsePropAlias(props, 'event', 'expr'),
      target: parsePropAlias(props, 'target', 'expr'),
      t: parsePropAlias(props, 'type', 'expr'),
      id: parsePropAlias(props, 'id', 'location'),
      delay: parsePropAlias(props, 'delay', 'expr'),
    });
  },
  cancel: function(node) {
    return {
      type: 'cancel',
      data: node.data || {},
      position: node.position,
      sendid: parsePropAlias(node[properties], 'sendid', 'expr'),
    };
  },
  invoke: function(node) {
    var props = node[properties];
    return h('invoke', node, {
      namelist: parseStringList(props.namelist),
      autoforward: parseBool(props.autoforward),
      t: parsePropAlias(props, 'type', 'expr'),
      src: parsePropAlias(props, 'src', 'expr'),
      id: parsePropAlias(props, 'id', 'location'),
    });
  },
  finalize: function(node) {
    return h('finalize', node);
  }
};
