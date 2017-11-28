export default function() {
  return {
    types: [
      'invoke',
      'send'
    ],
    exit: function(node, index, parent) {
      var data = node.data;
      node.children.forEach(function(child) {
        if (child.type === 'content') data.content = child.expr;
        if (child.type === 'param') {
          (data.params = data.params || []).push(child);
        }
      });
      delete node.children;
      return node;
    }
  };
};
