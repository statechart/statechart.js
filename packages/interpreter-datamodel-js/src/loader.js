const loader = {
  literal: function(node) {
    return JSON.stringify(node.value);
  },
  expr: function(node) {
    return '(function() { return ' + node.value + ' })()';
  },
}

export default loader;
