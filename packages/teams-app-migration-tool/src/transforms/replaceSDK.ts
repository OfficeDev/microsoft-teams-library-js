import core, {
  Transform,
  FileInfo,
  API,
  ImportDeclaration,
  identifier,
  ASTPath,
  literal,
  importDeclaration,
  ImportSpecifier,
  importSpecifier,
} from 'jscodeshift';
import { Collection } from 'jscodeshift/src/Collection';

/**
 * source sdk : Teams Client SDK
 * target sdk : teamsjs App SDK
 */

const teamsClientSDK = '@microsoft/teams-js';
const mosAppSDK = '@microsoft/teamsjs-app-sdk';

/**
 * Function helps to build a substituted import declaration from Teams Client SDK to teamsjs App SDK and
 * returns an importDeclaration which would be inserted to a line in migrated file by jscodeshift
 * @param namespaces an array containing all of namespaces from teamsjs App SDK to replace those in Teams Client SDK
 * @returns an import declaration, i.e. "import { namespace_1, namespace_2, ... } from '@microsoft/teamsjs-app-sdk'"
 */
function buildteamsjsAppSDKImportDeclaration(namespaces: Array<string>): ImportDeclaration {
  const specifiers: Array<ImportSpecifier> = namespaces.map(namespace => importSpecifier(identifier(namespace)));
  return importDeclaration(specifiers, literal(mosAppSDK));
}

/**
 * This function is to determine whether an import declaration is from Teams Client SDK
 * @param p AST path to the import declaration node
 * @returns a boolean value if p.node.source is called / whose value is '@microsoft/teams-js'
 */
function isTeamsClientSDKImport(p: ASTPath<ImportDeclaration>): boolean {
  return p.node.source.value === teamsClientSDK;
}

/**
 * Function is to add all of namespaces imported from Teams Client SDK into an array
 * so that this array could be used to look for statements calling Teams Client SDK methods in rest of lines
 * @param importPath a collection of import declarations in a file such as alias of SDK, authentication, settings ...
 * @returns a set of namespaces from Teams Client SDK
 */
function getTeamsClientSDKFunctionRefernecePrefixes(importPath: Collection<ImportDeclaration>): Set<string> {
  const namespacesImported: Set<string> = new Set();
  importPath.forEach(path => {
    if (typeof path.node.specifiers !== 'undefined') {
      path.node.specifiers.forEach(specifier => {
        /**
         * Specifier type of import declaration with curly bracket would be ImportSpecifier,
         * i.e. "import { namespace_1 as alias_1, function_1 ... } from ...."
         */
        if (specifier.type === 'ImportSpecifier' && specifier.imported.type === 'Identifier') {
          /**
           * each specifier would definitely have an imported name,
           * which should be checked and kept if it doesn't exist in current namespace array
           * under this situation, the line of code would looks like below,
           * i.e. "import { namespace_1, namespace_2, ...} from '@microsoft/teams-js'"
           */
          namespacesImported.add(specifier.imported.name);
          /**
           * if specifier has an alias, the name of imported node and local node under specifier node
           * would be different and alias has to be checked and kept as well
           * the example would looks like below,
           * i.e. "import { namespace_1 as alias_1, namespace_2 as alias_2 } from '@microsoft/teams-js'"
           * developers might use alias as namespace to call methods from Teams Client SDK
           */
          if (specifier.local !== null && typeof specifier.local !== 'undefined') {
            namespacesImported.add(specifier.local.name);
          }
        } else if (
          /**
           * Specifier type of default import declaration would be ImportDefaultSpecifier,
           * i.e. "import default_namespace from ...", and
           * typically, specifier type of namespace of package would be ImportNamespaceSpecifier
           * i.e. "import * as msft from '@microsoft/teams-js" and msft would be a specifier name
           */
          (specifier.type === 'ImportDefaultSpecifier' || specifier.type === 'ImportNamespaceSpecifier') &&
          specifier.local !== null &&
          typeof specifier.local !== 'undefined' &&
          specifier.local.type === 'Identifier'
        ) {
          namespacesImported.add(specifier.local.name);
        }
      });
    }
  });
  return namespacesImported;
}

/**
 * core function to migrate sdk in a JavaScript file and would be called and executed
 * automatically by jscodeshift
 * @param file command args from jscodeshift
 * @param api jscodeshift API
 * @returns string of an AST edited by jscodeshift
 */
const transform: Transform = (file: FileInfo, api: API): string => {
  /**
   * import jscodeshift and parse file to AST tree
   */
  const j: core.JSCodeshift = api.jscodeshift;
  const root: Collection<any> = j(file.source);
  /**
   * initialize local namespacesImported set for each file to record
   * namespaces imported from Teams Client SDK
   */
  const namespacesImportedFromTeamsClientSDK: Set<string> = new Set();
  /**
   * find all of import declarations related to Teams Client SDK
   * and temporarily save the collection of node
   */
  const teamsClientSDKImportDeclarationPaths: Collection<ImportDeclaration> = root
    .find(ImportDeclaration)
    .filter(isTeamsClientSDKImport);

  /**
   * if there is no Teams JavaScript SDK imported, nothing should be replaced
   */
  if (teamsClientSDKImportDeclarationPaths.length > 0) {
    getTeamsClientSDKFunctionRefernecePrefixes(teamsClientSDKImportDeclarationPaths).forEach(specifierName =>
      namespacesImportedFromTeamsClientSDK.add(specifierName),
    );
    console.log(namespacesImportedFromTeamsClientSDK);
  }

  return root.toSource({ quote: 'single' });
};
export default transform;
