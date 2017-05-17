import visit from 'unist-util-visit';
import createFetch from 'fetch-ponyfill';

const fetch = createFetch().fetch;

export default function(options) {
  options = options || {};
  var resolve = options.resolve || function(src) { return src; };

  return function inlineSrc(tree, file) {
    var promises = [];

    visit(tree, 'script', function visitor(node) {
      var src = node.src;
      if (!src) return;
      promises.push(
        fetch(resolve(src))
          .then(function(res) {
            if (!res.ok) throw new Error(res.statusText);
            return res.text().then(function(text) {
              return [
                node,
                text
              ];
            });
          })
          .catch(function(error) {
            file.fail(error, node);
          })
      );
    });

    return Promise
      .all(promises)
      .then(function(results) {
        results.forEach(function(res) {
          if (!res) return;

          var node = res[0];
          delete node.src;
          node.children = [{
            type: 'text',
            value: res[1]
          }];
        });
        return tree;
      });
  };
};
