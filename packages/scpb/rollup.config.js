import createConfig from '../../create-rollup';

const external = Object.keys(require('./package.json').dependencies || {}).concat([
  'protobufjs/minimal'
]);

export default createConfig(external);
