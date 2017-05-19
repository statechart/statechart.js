export default function() {
  return {
    types: ['invoke'],
    enter: function(node) {
      var namelist = node.namelist;
      if (namelist && namelist.length) {
        namelist.forEach(function(name) {
          node.children.push({
            type: 'param',
            data: {},
            position: node.position, // TODO get the actual position
            name: name,
            _code: {
              expr: {
                type: 'expression',
                value: name,
              },
            },
          })
        });
      }
      delete node.namelist;
      return node;
    }
  };
};
