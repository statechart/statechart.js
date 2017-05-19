export default function() {
  return {
    types: [
      'assign',
      'data',
      'content'
    ],
    enter: function(node, index, parent) {
      var children = node.children;
      if (children && children.length) {
        if (children.length !== 1) return; // TODO raise an error
        node.data.expr = children[0];
      }
      delete node.children;
      return node;
    }
  };
};
