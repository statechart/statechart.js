import { test } from 'ava';
import { check, gen } from 'ava-check';
import * as subject from './';

test('roundtrip', check(gen.array(gen.posInt), (t, arr) => {
  const sorted = Array.from(new Set(arr)).sort((a, b) => a - b);
  const size = sorted.length !== 0 ? getMax(sorted) : 0;
  const result = subject.decode(subject.encode(sorted, size));
  t.true(isEqual(sorted, result));
}));

function getMax(arr: number[]) {
  const copy = arr.slice();
  copy.sort((a, b) => b - a);
  return copy[0] + 1;
}

function isEqual(a: number[], b: number[]) {
  if (a.length !== b.length) return false;
  return a.every((value, i) => value === b[i]);
}
