var util = require('./util');

module.exports = function datamodel(node, check) {
  util.props(node, check, {});
  util.childTypes(node, check, {
    'data': true
  });
};
