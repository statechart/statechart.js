#!/usr/bin/env node
'use strict';

var start = require('unified-args');
var processor = require('./dist');
var pack = require('./package.json');

var name = pack.name;

start({
  processor: processor,
  name: 'scxml',
  description: pack.description,
  version: pack.version,
  pluginPrefix: 'statechart',
  extensions: ['scxml'],
  packageField: name + 'Config',
  rcName: '.' + name + 'rc',
  ignoreName: '.' + name + 'ignore',
});
