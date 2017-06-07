import createConfig from '../../create-rollup';

const external = Object.keys(require('./package.json').dependencies || {}).concat([
  'events'
]);

export default createConfig(external);
