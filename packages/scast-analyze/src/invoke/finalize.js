export default function() {
  return {
    types: ['invoke'],
    enter: function(node) {
      node.children = node.children.filter(function(child) {
        if (!child.type === 'finalize') return true;
        node.onExit = child.children;
        return false;
      });
      return node;
    }
  };
};
