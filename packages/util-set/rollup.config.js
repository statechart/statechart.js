import createConfig from '../../create-rollup';

const external = Object.keys(require('./package.json').dependencies || {});

export default createConfig(external);
