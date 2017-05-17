import json from 'rollup-plugin-json';

export default {
  entry: 'src/index.js',
  dest: 'dist/index.js',
  format: 'cjs',
  banner: '#!/usr/bin/env node',
  external: Object.keys(require('./package.json').dependencies),
  plugins: [
    json()
  ]
};
