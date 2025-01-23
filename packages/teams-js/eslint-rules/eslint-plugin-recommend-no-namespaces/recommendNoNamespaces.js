module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend against the usage of namespaces as they are not treeshakable',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: false,
    schema: [],
  },

  create: function (context) {
    return {
      TSModuleDeclaration: function (node) {
        if (node.id && node.kind === 'namespace') {
          context.report({
            node,
            message:
              'Please do not use namespaces as they cannot be treeshaken. Please use modules to separate code instead. If you have determined it ABSOLUTELY necessary to use a namespace, add "/* eslint-disable-next-line recommend-no-namespaces/recommend-no-namespaces */" to the line above to disable this warning, as well as a comment explaining why a namespace is necessary',
            severity: 2,
            data: node,
          });
        }
      },
    };
  },
};
