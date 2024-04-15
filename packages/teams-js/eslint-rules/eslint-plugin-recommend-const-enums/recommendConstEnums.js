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
            message: `Please consider if you can use a const enum for ${enumName} to minimize bundle size. If not, add "/* eslint-disable-next-line recommend-const-enums/recommend-const-enums */" to the line above to disable this warning, 
            as well as a comment explaining why you can't use a const enum. To learn more about why we typically want to use const enums, see https://github.com/OfficeDev/microsoft-teams-library-js/wiki/Notes-on-Enum-Usage.`,
            severity: 2,
          });
        }
      },
    };
  },
};
