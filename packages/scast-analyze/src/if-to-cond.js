export default function() {
  return {
    types: ['if'],
    enter: function(node) {
      var clauses = [];
      node.children.reduce(function(acc, child) {
        var type = child.type;
        if (type === 'elseif' || type === 'else') acc = createClause(child, clauses);
        else acc.children.push(child);
        return acc;
      }, createClause(node, clauses));

      return {
        type: 'cond',
        children: clauses,
        position: node.position,
      };
    }
  };
};

function createClause(node, clauses) {
  var clause = Object.assign({}, node, {
    type: 'clause',
    children: [],
  });
  clauses.push(clause);
  return clause;
}
