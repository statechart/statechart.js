const babel = require('babel-core');
const fs = require('fs');
const path = require('path');
const glob = require('glob').sync;
var ss = require('snap-shot');

const root = __dirname;

const options = {
  plugins: [
    [`${__dirname}/../dist`, { strict: false }],
  ]
};

const fixtures = glob(`${__dirname}/**/*.jsx`);

describe('statechart-jsx', () => {
  fixtures.forEach((file) => {
    const rel = path.relative(root, file);
    it('should support ' + JSON.stringify(rel), (done) => {
      fs.readFile(file, 'utf8', (err, scxml) => {
        const { code } = babel.transform(`var scexe = (${scxml})`, options);
        ss(code);
        eval(code);
        // TODO execute these and make sure they actually work
        done();
      });
    });
  })
});
