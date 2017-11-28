import { test } from 'ava';
import transform from './'; // tslint:disable-line

test('it works', (t) => {
  const ast = {
    type: 'element',
    tagName: 'scxml',
    properties: {

    },
    children: [
      {
        type: 'element',
        tagName: 'state',
        children: [
          {
            type: 'element',
            tagName: 'onentry',
            children: [
              {
                type: 'element',
                tagName: 'assign',
                properties: {
                  location: 'foo',
                  expr: '123',
                },
              },
            ],
          },
        ],
      },
    ],
  };

  const out = transform()(ast);

  console.log(JSON.stringify(out, null, '  '));

  t.true(true);
});
