var util = require('./util');

module.exports = function cancel(node, check) {
  util.props(node, check, {
    'sendid': {
      type: 'alias',
      suffix: 'expr',
      required: true
    }
  });
};
