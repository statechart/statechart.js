import start from 'unified-args';
import processor from '@statechart/compiler-engine';
import { name, description, version } from '../package.json';

start({
  processor: processor,
  name: 'scxml',
  description: description,
  version: version,
  pluginPrefix: 'statechart',
  extensions: ['scxml'],
  packageField: name + 'Config',
  rcName: '.' + name + 'rc',
  ignoreName: '.' + name + 'ignore',
});
