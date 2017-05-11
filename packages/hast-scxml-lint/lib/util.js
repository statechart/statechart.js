exports.props = function(node, check, validProps) {
  var props = node.properties;
  var aliases = {};
  Object.keys(validProps).forEach(function(n) {
    var validator = validProps[n];
    var value = props[n];

    if (validator === true) return check(
      value,
      'prop-' + n,
      'Attribute ' + JSON.stringify(n) + ' is required to be set',
      node
    );

    if (typeof validator === 'string') return check(
      value === validator,
      'prop-' + n,
      'Attribute ' + JSON.stringify(n) + ' is required to be set to ' + JSON.stringify(validator),
      node
    );

    if (Array.isArray(validator)) return check(
      !value || ~validator.indexOf(value),
      'prop-' + n,
      'Attribute ' + JSON.stringify(n) +
      ' is required to be one of ' +
      validator.map(function(v) { return JSON.stringify(v); }).join(', '),
      node
    );

    if (typeof validator !== 'object') return;

    if (validator.type === 'alias') {
      var alias = (validator.prefix || '') + n + (validator.suffix || '');
      aliases[alias] = true;

      check(
        validator.required ? (value || props[alias]) : true,
        'prop-' + n,
        'Attribute ' + JSON.stringify(n) + ' or ' +
        JSON.stringify(alias) + ' is required to be set',
        node
      );

      return check(
        !(value && props[alias]),
        'prop-' + n,
        'Attribute ' + JSON.stringify(n) +
        ' cannot be set with ' + JSON.stringify(alias),
        node
      );
    }
  });

  Object.keys(props).forEach(function(n) {
    if (!validProps.hasOwnProperty(n) && !aliases[n]) check(
      n === 'xmlns' || /^xmlns\:/.test(n),
      'invalid-prop',
      'Invalid prop ' + JSON.stringify(n),
      node
    );
  });
};

exports.childTypes = function(node, check, types, fn) {
  var childCounts = {};
  node.children.forEach(function(child) {
    if (child.type !== 'element') return;
    var n = child.tagName;
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
    var validator = types[n];
    var count = childCounts[n] | 0;

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
