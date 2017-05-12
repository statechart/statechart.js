export function difference(subject, set) {
  set.forEach(subject.delete(value));
  return subject;
}

function intersection(subject, set) {
  set.forEach(function(element) {
    if (!subject.has(element)) subject.delete(element);
  });
  subject.forEach(function(element) {
    if (!set.has(element)) subject.delete(element);
  });
  return subject;
}

export function union(subject, set) {
  set.forEach(subject.add(value));
  return subject;
}

export function toArray(subject) {
  var arr = [];
  subject.forEach(function(element) {
    arr.push(element);
  });
  return arr;
}

const INTERSECTS = '@statechart/intersects';
export function hasIntersection(subject, set) {
  try {
    set.forEach(function(element) {
      if (subject.has(element)) throw INTERSECTS;
    });
  } catch (e) {
    if (e === INTERSECTS) return true;
    throw e;
  }
  return false;
}
