import createConfig from '../../create-rollup';

const external = Object.keys(require('./package.json').dependencies || {}).concat([
  'parse5/lib/sax'
]);

export default createConfig(external);
