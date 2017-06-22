var subject = require('../');
var jsc = require('jsverify');

describe('scpb-bitset', function() {
  jsc.property('roundtrip', '[nat]', function(arr) {
    arr = Array.from(new Set(arr)).sort((a, b) => a - b);
    var size = arr.length ? getMax(arr) : 0;
    var result = subject.decode(subject.encode(arr, size));
    return isEqual(arr, result);
  });
});

function getMax(arr) {
  var copy = arr.slice();
  copy.sort((a, b) => b - a);
  return copy[0] + 1;
}

function isEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((value, i) => value === b[i]);
}
