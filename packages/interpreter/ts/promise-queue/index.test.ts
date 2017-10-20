import { test } from 'ava';
import { PromiseQueue } from './';

test.cb('on empty is called', (t) => {
  let i = 2;
  t.plan(i);

  const queue = new PromiseQueue(
    () => {
      t.true(true);
      if (!--i) t.end(); // tslint:disable-line
    },
    () => {
      t.fail();
      t.end();
    },
  );

  queue.add(2);
  queue.add(new Promise(resolve => resolve(1)));
  queue.add(new Promise(resolve => setTimeout(() => resolve(2), 1)));
});

test.cb('error is called', (t) => {
  t.plan(2);

  const queue = new PromiseQueue(
    () => {
      t.fail();
    },
    () => {
      t.pass();
    },
  );

  queue.add(new Promise((_, reject) => reject(1)));
  queue.add(new Promise((_, reject) => setTimeout(() => reject(2), 1)));
  queue.add(2);

  setTimeout(
    () => { t.end(); },
    10,
  );
});
