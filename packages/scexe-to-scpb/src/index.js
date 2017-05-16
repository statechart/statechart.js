const encode = require('@statechart/scpb/lib/encode');

module.exports = function(opts) {
  this.Compiler = function(root, file) {
    return encode(root).finish();
  };
};
