export default function() {
  return {
    types: [
      'invoke',
      'send'
    ],
    enter: function(node, index, parent) {
      var data = node.data;
      node.children.forEach(function(child) {
        if (child.type === 'content') data.content = child.expr;
        if (child.type === 'param') {
          if (!data.params) var params = data.params = [];
          params.push(child);
        }
      });
      delete node.children;
      return node;
    }
  };
};
