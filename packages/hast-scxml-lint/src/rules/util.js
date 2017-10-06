export function props(node, check, validProps) {
  const position = ((node.data || {}).position || {});
  const openPosition = position.opening || node;
  const propPositions = position.properties || {};

  const props = node.properties;
  const aliases = {};

  Object.keys(validProps).forEach(function(n) {
    const validator = validProps[n];
    const value = props[n];
    const pos = propPositions[n] || openPosition;

    if (validator === true) return check(
      value,
      'prop-' + n,
      'Attribute ' + JSON.stringify(n) + ' is required to be set',
      pos
    );

    if (typeof validator === 'string') return check(
      value === validator,
      'prop-' + n,
      'Attribute ' + JSON.stringify(n) + ' is required to be set to ' + JSON.stringify(validator),
      pos
    );

    if (Array.isArray(validator)) return check(
      !value || ~validator.indexOf(value),
      'prop-' + n,
      'Attribute ' + JSON.stringify(n) +
      ' is required to be one of ' +
      validator.map(function(v) { return JSON.stringify(v); }).join(', '),
      pos
    );

    if (typeof validator !== 'object') return;

    if (validator.type === 'alias') {
      const alias = (validator.prefix || '') + n + (validator.suffix || '');
      aliases[alias] = true;

      check(
        validator.required ? (value || props[alias]) : true,
        'prop-' + n,
        'Attribute ' + JSON.stringify(n) + ' or ' +
        JSON.stringify(alias) + ' is required to be set',
        pos
      );

      return check(
        !(value && props[alias]),
        'prop-' + n,
        'Attribute ' + JSON.stringify(n) +
        ' cannot be set with ' + JSON.stringify(alias),
        pos
      );
    }
  });

  Object.keys(props).forEach(function(n) {
    const pos = propPositions[n] || openPosition;
    if (!validProps.hasOwnProperty(n) && !aliases[n]) check(
      n === 'xmlns' || /^xmlns\:/.test(n),
      'invalid-prop',
      'Invalid prop ' + JSON.stringify(n),
      pos
    );
  });
};

export function childTypes(node, check, types, fn) {
  const childCounts = {};
  node.children.forEach(function(child) {
    if (child.type !== 'element') return;
    const n = child.tagName;
    childCounts[n] = (childCounts[n] || 0) + 1;

    check(
      types.hasOwnProperty(n),
      'child-type',
      'Invalid child <' + n + '>',
      child
    );

    if (fn && types[n]) fn(n, child.properties, child);
  });

  Object.keys(types).forEach(function(n) {
    const validator = types[n];
    const count = childCounts[n] | 0;

    if (typeof validator === 'number') check(
      count === validator,
      'child-' + n + '-count',
      '<' + n + '> should occur ' + validator + ' time' + (validator != 1 ? 's' : ''),
      node
    );

    if (Array.isArray(validator)) check(
      validator[0] <= count && count <= validator[1],
      'child-' + n + '-count',
      '<' + n + '> should occur ' + validator[0] + ' to ' + validator[1] + ' times',
      node
    );
  });

  return childCounts;
};
