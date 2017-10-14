export interface SetLike<E> {
  forEach(fn: (element: E) => void): void;
}

export function difference<E>(subject: Set<E>, set: SetLike<E>) {
  set.forEach((element: E) => {
    if (subject.has(element)) subject.delete(element);
    else subject.add(element);
  });
  return subject;
}

export function intersection<E>(subject: Set<E>, set: Set<E> | E[]) {
  const converted = (
    Array.isArray(set) ?
      new Set(set) :
      set
  );

  converted.forEach((element) => {
    if (!subject.has(element)) subject.delete(element);
  });
  subject.forEach((element) => {
    if (!converted.has(element)) subject.delete(element);
  });
  return subject;
}

export function union<E>(subject: Set<E>, set: SetLike<E>) {
  set.forEach((element) => {
    subject.add(element);
  });
  return subject;
}

export function toArray<E>(subject: Set<E>) {
  const arr: E[] = [];
  subject.forEach((element) => {
    arr.push(element);
  });
  return arr.sort();
}

export function hasIntersection<E>(subject: Set<E>, set: SetLike<E>) {
  let interects = false;
  set.forEach((element) => {
    if (subject.has(element)) interects = true;
  });
  return interects;
}
