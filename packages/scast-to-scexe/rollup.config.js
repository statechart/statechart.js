export default {
  entry: 'src/index.js',
  dest: 'dist/index.js',
  format: 'cjs',
  external: Object.keys(require('./package.json').dependencies),
};
