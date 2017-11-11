import { encode } from '@statechart/scpb';

export default function(opts) {
  this.Compiler = function(root, file) {
    return encode(root);
  };
};
