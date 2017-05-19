import transform from 'unist-util-transform';
import createStack from 'unist-util-transform-stack';

export default function(opts) {
  var datamodels = opts.datamodels
  return function(root, file) {
    function init(scxml) {
      var datamodel = datamodels[scxml.datamodel];
      if (!datamodel) {
        // TODO use prop position
        file.fail('Unknown datamodel: ' + scxml.datamodel, scxml);
      }
      return datamodel;
    }

    var stack = createStack('scxml', init, function(node, index, parent, datamodel) {
      // TODO iterate the properties
      // Object.keys(code).forEach(function(key) {
      //   if (!datamodel) file.fail('Uninitialized datamodel', node);
      //   var conf = code[key];
      //   if (conf) node[key] = datamodel(code[key], key, file);
      // });
      return node;
    });

    return transform(root, stack);
  };
};
