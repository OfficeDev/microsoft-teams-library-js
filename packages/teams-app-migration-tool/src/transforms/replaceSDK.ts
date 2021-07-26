import core, {
  identifier,
  importDeclaration,
  importSpecifier,
  literal,
  memberExpression,
  API,
  ASTPath,
  FileInfo,
  Identifier,
  ImportDeclaration,
  ImportSpecifier,
  MemberExpression,
  Transform,
} from 'jscodeshift';
import { Collection } from 'jscodeshift/src/Collection';
import { replacement } from './replacement';
import { build } from './replacementsGenerator';

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
 * @param p AST node path to the import declaration node
 * @returns a boolean value if p.node.source is called / whose value is '@microsoft/teams-js' or not
 */
function isTeamsClientSDKImport(p: ASTPath<ImportDeclaration>): boolean {
  return p.node.source.value === teamsClientSDK;
}

/**
 * check whether this path has a node containing a namespace in the set
 * @param p AST node path to identifier node
 * @param namespacesImported a set of namespaces that are imported from import declaration
 * @returns a boolean value if the node has the namespace in the set
 */
function isMethodInGivenNamespaces(p: ASTPath<Identifier>, namespacesImported: Set<string>): boolean {
  /**
   * The node of namespace, i.e. token 'microsoftTeams' in method call 'microsoftTeams.initialize()',
   * is always an object attribute in AST and has no property attribute
   */
  return (
    namespacesImported.has(p.node.name) && p.parent.node.type === 'MemberExpression' && p.parent.node.object === p.node
  );
}

/**
 * reachCallee function is to reach the callee attribute in AST,
 * which is a node whose property attribute is the source method
 * @param p AST node path with different types
 * @returns a node path with MemberExpression type and callee attribute in AST
 */
function reachCallee(p: any): any {
  if (p.parent.node.type === 'CallExpression') {
    return p;
  }
  return reachCallee(p.parent);
}

/**
 * transform the alias to its real name if it exists in map
 * @param specifierName name of specifier
 * @param aliasToName a map which maps alias to its real name
 * @returns a name
 */
function getSpecifierName(specifierName: string, aliasToName: Map<string, string>): string {
  return aliasToName.has(specifierName) ? (aliasToName.get(specifierName) as string) : specifierName;
}

/**
 * Recursively compare each token in source token array with proper node name to identify
 * whether this replacement is a mapping for current callee branch
 * @param sourceTokenIndex index that we should read from array with source tokens
 * @param sourceTokens an array with source tokens
 * @param aliasToName a map which maps alias to its real name
 * @param p a path
 * @returns boolean value, true if it is the matched replacement
 */
function isCorrespondingReplacement(
  sourceTokenIndex: number,
  sourceTokens: Array<string>,
  aliasToName: Map<string, string>,
  p: any,
): boolean {
  /**
   * Exit condition for recursion if it is the right replacement
   */
  if (sourceTokenIndex === sourceTokens.length && p.node.type === 'CallExpression') {
    return true;
  } else if (
    sourceTokenIndex < sourceTokens.length &&
    sourceTokens[sourceTokenIndex] ===
      getSpecifierName(p.node.type === 'Identifier' ? p.node.name : p.node.property.name, aliasToName)
  ) {
    /**
     * in this situation, we haven't compare each token with the token in AST node,
     * from start to the end in the array with source tokens, so further check is required
     */
    return isCorrespondingReplacement(sourceTokenIndex + 1, sourceTokens, aliasToName, p.parent);
  }
  return false;
}

/**
 * This function is to find replacement for a method reference
 * @param rules an array with all of pre-defined replacement
 * @param aliasToName a map which maps alias to its real name
 * @param p an AST path of identifier node
 * @returns a replacement with right info denoting how to transform the method
 */
function findReplacement(
  rules: Array<replacement>,
  aliasToName: Map<string, string>,
  p: ASTPath<Identifier>,
): replacement | void {
  for (const rule of rules) {
    /**
     * determine the starting index since the first prefix token may various,
     * i.e. 'microsoftTeams' and 'location' would start from different places
     * in sourceTokenArray
     */
    const startSourceTokenIndex = rule.sourceTokens.indexOf(getSpecifierName(p.node.name, aliasToName));
    if (
      startSourceTokenIndex >= 0 &&
      isCorrespondingReplacement(startSourceTokenIndex, rule.sourceTokens, aliasToName, p)
    ) {
      return rule;
    }
  }
}

/**
 * buildMethodASTNode is to build an AST node of callee attribute for
 * each CallExpression node related to Teams Client SDK methods. This node
 * would replace the current node from callee attribute.
 * @param tokens tokens for fully qualified function reference in teamsjs App SDK
 * @returns an AST node
 */
function buildMethodASTNode(tokens: Array<string>): any {
  let node: MemberExpression | Identifier | null = null;
  if (tokens.length == 1) {
    node = identifier(String(tokens.pop()));
  } else if (tokens.length > 1) {
    const property: string | undefined = tokens.pop();
    node = memberExpression(buildMethodASTNode(tokens), identifier(String(property)));
  }
  return node;
}

/**
 * Function is to add all of namespaces imported from Teams Client SDK into a set
 * so that this set could be used to look for statements calling Teams Client SDK methods in rest of lines
 * @param importPath a collection of import declarations in a file such as alias of SDK, authentication, settings ...
 * @returns a set of namespaces from Teams Client SDK
 */
function getTeamsClientSDKFunctionRefernecePrefixes(
  importPath: Collection<ImportDeclaration>,
): [Set<string>, Map<string, string>] {
  const namespacesImported: Set<string> = new Set();
  const aliasToName: Map<string, string> = new Map();
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
            /**
             * if alias for namespace doesn't exsit in current map,
             * set a mapping for a namespace imported from alias to name
             */
            if (!aliasToName.has(specifier.local.name)) {
              aliasToName.set(specifier.local.name, specifier.imported.name);
            }
          }
        } else if (
          /**
           * Specifier type of default import declaration would be ImportDefaultSpecifier,
           * i.e. "import default_namespace from ..."
           */
          specifier.type === 'ImportDefaultSpecifier' &&
          typeof specifier.local !== 'undefined' &&
          specifier.local !== null &&
          specifier.local.type === 'Identifier'
        ) {
          namespacesImported.add(specifier.local.name);
        } else if (
          /**
           * typically, specifier type of namespace of package would be ImportNamespaceSpecifier
           * i.e. "import * as msft from '@microsoft/teams-js" and msft would be a specifier name
           */
          specifier.type === 'ImportNamespaceSpecifier' &&
          typeof specifier.local !== 'undefined' &&
          specifier.local !== null &&
          specifier.local.type === 'Identifier'
        ) {
          namespacesImported.add(specifier.local.name);
          /**
           * if alias for package doesn't exsit in current map,
           * set a mapping from alias to name
           */
          if (!aliasToName.has(specifier.local.name)) {
            aliasToName.set(specifier.local.name, 'microsoftTeams');
          }
        }
      });
    }
  });
  return [namespacesImported, aliasToName];
}

/**
 * core function to migrate sdk in a JavaScript file and would be called and executed
 * automatically by jscodeshift
 * @param file command args from jscodeshift
 * @param api jscodeshift API
 * @returns string of the file content edited by jscodeshift
 */
const transform: Transform = (file: FileInfo, api: API): string => {
  /**
   * import jscodeshift and parse file to AST tree
   */
  const j: core.JSCodeshift = api.jscodeshift;
  const root: Collection<any> = j(file.source);
  /**
   * initialize local namespacesImported sets for each file to record
   * namespaces imported from Teams Client SDK and replaced to those under
   * teamsjs App SDK
   */
  const namespacesImportedFromTeamsClientSDK: Set<string> = new Set();
  const namespacesForMosAppSDK: Set<string> = new Set();
  /**
   * build replacements
   */
  const replacements: Array<replacement> = build();
  /**
   * find all of import declarations related to Teams Client SDK
   * and temporarily save the collection of nodes
   */
  const teamsClientSDKImportDeclarationPaths: Collection<ImportDeclaration> = root
    .find(ImportDeclaration)
    .filter(isTeamsClientSDKImport);

  /**
   * if there is no Teams Client SDK imported, nothing should be replaced
   */
  if (teamsClientSDKImportDeclarationPaths.length > 0) {
    /**
     * first step, looking at each specifier, i.e. 'authentication' in "import { authentication } from '@microsoft/teams-js"
     * and collecting names of each specifier with alias
     * namespaces are used to determine whether a method call is from Teams Client SDK, because it would have the format
     * like, "authentication.getAuthToken(AuthTokenRequest)"
     */
    const [specifierNames, aliasToName] = getTeamsClientSDKFunctionRefernecePrefixes(
      teamsClientSDKImportDeclarationPaths,
    );
    specifierNames.forEach(specifierName => namespacesImportedFromTeamsClientSDK.add(specifierName));
    /**
     * second step, find all of method calls related to Teams Client SDK using namespacesImportedFromTeamsClientSDK set
     */
    const teamsClientSDKMethodPaths: Collection<Identifier> = root
      .find(Identifier)
      .filter(p => isMethodInGivenNamespaces(p, namespacesImportedFromTeamsClientSDK));
    /**
     * third step, replace the method call according to corresponding one-on-one mapping,
     * which is the replacement interface
     */
    teamsClientSDKMethodPaths.forEach(path => {
      /**
       * find right replacement for each method related to Teams Client SDK
       */
      const rule: replacement | void = findReplacement(replacements, aliasToName, path);
      /**
       * if there is an one-on-one mapping, (somehow there might not be one, i.e. forget to add rules)
       * replace function reference from Teams Client SDK to teamsjs App SDK
       */
      if (typeof rule !== 'undefined') {
        /**
         * The first prefix token in arry of targetPrefixTokens in replacement provides a namespace that would definitely
         * cover the method replaced to and we don't have to take care of the situation like, a namespace is
         * under another one. The first prefix token provides the namespace under teamsjs App SDK and has no overlap among
         * each other.
         * The namespaces in this set would finally be used to build import declaration(s).
         */
        namespacesForMosAppSDK.add(rule.targetPrefixTokens[0]);
        /**
         * prepare an array of tokens, which are function references in teamsjs App SDK,
         * i.e. ['core', 'initialize']
         * to create new AST node and then replace the original AST node
         */
        const replacedMosAppSDKFunctionReference: Array<string> = Object.assign([], rule.targetPrefixTokens);
        replacedMosAppSDKFunctionReference.push(rule.targetMethod);
        /**
         * to replace the method call is actually to reach the callee node in AST and then
         * replace AST node using jscodeshift inner replacing function
         */
        reachCallee(path).replace(buildMethodASTNode(replacedMosAppSDKFunctionReference));
        /**
         * TODO: log(s) of replacing current method references from Teams Client SDK
         * to one from MOS App SDK
         */
      }
    });

    /**
     * Insert new line(s) of import declaration(s) at the head of the file,
     * thus 'at(0)' is called because multiple import declarations from Teams Client SDK may occur
     * we don't want to insert before each declarations
     * it would be easier to prompt which line we insert the import declaration to as well,
     * i.e. insert at 1st line
     */
    teamsClientSDKImportDeclarationPaths
      .at(0)
      .insertBefore(buildteamsjsAppSDKImportDeclaration(Array.from(namespacesForMosAppSDK)));
    /**
     * TODO: log(s) of adding import declarations from MOS App SDK
     */
  }

  /**
   * remove possible import declarations from Teams Client SDK
   */
  teamsClientSDKImportDeclarationPaths.remove();
  /**
   * TODO: log(s) of removing import declarations from Teams Client SDK
   */

  return root.toSource({ quote: 'single' });
};
export default transform;
