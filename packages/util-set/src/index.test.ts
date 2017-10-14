import { test } from 'ava';
import * as set from './';

test('difference', (t) => {
  const diff = set.difference(new Set([1,2,3]), new Set([2,3,4]));
  t.deepEqual(diff, new Set([1,4]));
});

test('intersection', (t) => {
  const int = set.intersection(new Set([1,2,3]), new Set([2,3,4]));
  t.deepEqual(int, new Set([2,3]));
});

test('array intersection', (t) => {
  const int = set.intersection(new Set([1,2,3]), [2,4]);
  t.deepEqual(int, new Set([2]));
});

test('union', (t) => {
  const union = set.union(new Set([1,2,3]), new Set([2,3,4]));
  t.deepEqual(union, new Set([1,2,3,4]));
});

test('toArray', (t) => {
  const arr = set.toArray(new Set([1,2,3,4]));
  t.deepEqual(arr, [1,2,3,4]);
});

test('hasIntersection', (t) => {
  const subject = new Set([1,2,3,4]);
  t.deepEqual(set.hasIntersection(subject, new Set([1,2])), true);
  t.deepEqual(set.hasIntersection(subject, new Set()), false);
  t.deepEqual(set.hasIntersection(subject, new Set([5,6])), false);
});
