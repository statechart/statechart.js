import createConfig from '../../create-rollup';

const external = Object.keys(require('./package.json').dependencies || {}).concat([
  'uuid/v4'
]);

export default createConfig(external);
