var set = require('../');

describe('util-set', function() {
  it('difference', function() {
    var diff = set.difference(new Set([1,2,3]), new Set([2,3,4]));
    expect(diff).toEqual(new Set([1,4]));
  });

  it('intersection', function() {
    var int = set.intersection(new Set([1,2,3]), new Set([2,3,4]));
    expect(int).toEqual(new Set([2,3]));
  });

  it('union', function() {
    var union = set.union(new Set([1,2,3]), new Set([2,3,4]));
    expect(union).toEqual(new Set([1,2,3,4]));
  });

  it('toArray', function() {
    var arr = set.toArray(new Set([1,2,3,4]));
    expect(arr).toEqual([1,2,3,4]);
  });

  it('hasIntersection', function() {
    var subject = new Set([1,2,3,4]);
    expect(set.hasIntersection(subject, new Set([1,2]))).toEqual(true);
    expect(set.hasIntersection(subject, new Set())).toEqual(false);
    expect(set.hasIntersection(subject, new Set([5,6]))).toEqual(false);
  });
});
