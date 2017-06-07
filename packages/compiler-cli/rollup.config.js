import createConfig from '../../create-rollup';

const external = Object.keys(require('./package.json').dependencies || {});

export default Object.assign(
  createConfig(external),
  {
    banner: '#!/usr/bin/env node',
  }
);
