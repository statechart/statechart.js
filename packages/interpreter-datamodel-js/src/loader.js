const loader = {
  assign: function(node) {
    return loader.location(node.location) + '=' + node.expr.value;
  },
  bool: function(node) {
    return '!!' + loader.expr(node);
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
}

export default loader;
