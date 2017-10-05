function escapeLiteral(value, t) {
  if (value === null) return t.nullLiteral();
  switch (typeof value) {
    case 'boolean': return t.booleanLiteral(value);
    case 'number': return t.numericLiteral(value);
    case 'string': return t.stringLiteral(value);
    case 'undefined': return t.nullLiteral();
  }
  console.error('UNHANDLED', value);
  throw new Error(value);
}

function escapeObject(obj, t) {
  return t.objectExpression(
    Object
      .keys(obj)
      .filter(k => !t.isNullLiteral(obj[k]))
      .map(k => t.objectProperty(t.identifier(k), obj[k]))
  );
}

function escapeArray(arr, fn, t) {
  return t.arrayExpression((arr || []).map(e => fn(e, t)));
}

function escapeExpression(expr, t) {
  if (typeof expr !== 'object' || expr === null) return escapeLiteral(expr, t);

  const type = expr.type;

  switch (type) {
    case 'expr': return escapeExpression(expr.value, t);
    case 'assign': return t.nullLiteral(); // TODO
    case 'send': return t.nullLiteral(); // TODO
    case 'raise': return t.nullLiteral(); // TODO
    case 'cond': return t.nullLiteral(); // TODO
  }

  return expr;
}

function escapeInvocation(inv, t) {
  return escapeObject({
    type: escapeExpression(inv.type, t),
    src: escapeExpression(inv.src, t),
    id: escapeExpression(inv.id, t),
    autoforward: escapeLiteral(inv.autoforward, t),
    params: escapeArray(inv.params, escapeExpression, t),
    content: escapeExpression(inv.content, t),
    onExit: escapeArray(inv.onExit, escapeExpression, t),
  }, t);
}

function escapeData(data, t) {
  return escapeObject({
    id: escapeLiteral(data.id, t),
    value: escapeExpression(data.value, t),
    src: escapeExpression(data.src, t),
  }, t);
}

function escapeState(state, t) {
  return escapeObject({
    type: escapeLiteral(state.type, t),
    idx: escapeLiteral(state.idx, t),
    id: escapeLiteral(state.id, t),
    onEnter: escapeArray(state.onEnter, escapeExpression, t),
    onExit: escapeArray(state.onExit, escapeExpression, t),
    invocations: escapeArray(state.invocations, escapeInvocation, t),
    data: escapeArray(state.data, escapeData, t),
    parent: escapeLiteral(state.parent, t),
    children: escapeArray(state.children, escapeLiteral, t),
    ancestors: escapeArray(state.ancestors, escapeLiteral, t),
    completion: escapeArray(state.completion, escapeLiteral, t),
    transitions: escapeArray(state.transitions, escapeLiteral, t),
    hasHistory: escapeLiteral(state.hasHistory || false, t),
    name: escapeLiteral(state.name, t),
  }, t);
}

function escapeTransition(transition, t) {
  return escapeObject({
    type: escapeLiteral(transition.type, t),
    idx: escapeLiteral(transition.idx, t),
    source: escapeLiteral(transition.source, t),
    events: escapeArray(transition.events, escapeLiteral, t),
    condition: escapeExpression(transition.condition, t),
    onTransition: escapeArray(transition.onTransition, escapeExpression, t),
    targets: escapeArray(transition.targets, escapeLiteral, t),
    conflicts: escapeArray(transition.conflicts, escapeLiteral, t),
    exits: escapeArray(transition.exits, escapeLiteral, t),
    name: escapeLiteral(transition.name, t),
  }, t);
}

export default function(doc, t) {
  return escapeObject({
    name: escapeLiteral(doc.name, t),
    states: escapeArray(doc.states, escapeState, t),
    transitions: escapeArray(doc.transitions, escapeTransition, t),
    datamodel: escapeArray(doc.datamodel, escapeData, t),
  }, t);
};
