module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend using const enums if possible to minimize bundle size',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
  },

  create: function (context) {
    return {
      TSEnumDeclaration: function (node) {
        const enumName = node.id.name;
        const enumType = node.const ? 'const' : 'regular';

        if (enumType === 'regular') {
          context.report({
            node: node,
            message: `Please consider if you can use a const enum for ${enumName} to minimize bundle size. If not, add "/* eslint-disable-next-line recommend-const-enums/recommend-const-enums */" to the line above to disable this warning.`,
            severity: 2,
          });
        }
      },
    };
  },
};
