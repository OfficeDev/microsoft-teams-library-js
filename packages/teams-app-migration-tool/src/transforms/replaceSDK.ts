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
import { replaceMethodLogger } from '../loggers';
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
 * This function is to traverse each node of prefix for Teams Client SDK method call and finally
 * concatenate all the names from nodes to make a fully qualified references
 * @param p AST node with different types
 * @returns a string of fully qualified function reference from Teams Client SDK
 */
function getOriginalMethodReference(p: any): string {
  /**
   * if parent of current AST node has type CallExpression, it means that we reach to the node representing
   * method name, where we should stop traversing / concatenating the string
   * i.e. in 'microsoftTeams.initialize()', node whose property name is 'initialize' represents
   * the end of traverse since we start from node with name 'microsoftTeams'
   */
  if (p.parent.node.type === 'CallExpression') {
    return p.node.property.name;
  }
  /**
   * the first node would always be like a node having name 'microsoftTeams', which
   * is a namespace. It's a special identifier node that doesn't have property
   * rest of nodes should have property attribute
   */
  if (typeof p.node.property !== 'undefined') {
    return p.node.property.name + '.' + getOriginalMethodReference(p.parent);
  } else {
    return p.node.name + '.' + getOriginalMethodReference(p.parent);
  }
}

/**
 * findReplacement function is trying to find a replacement having mapping from current function reference
 * in Teams Client SDK to the function reference in teamsjs App SDK
 * @param rules an array of replacements
 * @param p AST node path to node with callee attribute under CallExpression node
 * @returns if a replacement is found, then a replament is returned, otherwise, null would be returned
 */
function findReplacement(rules: Array<replacement>, p: ASTPath<MemberExpression>): replacement | void {
  for (const rule of rules) {
    if (p.node.property.type === 'Identifier' && rule.sourceTokens.includes(p.node.property.name)) {
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
 * @returns string of the file content edited by jscodeshift
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
    getTeamsClientSDKFunctionRefernecePrefixes(teamsClientSDKImportDeclarationPaths).forEach(specifierName =>
      namespacesImportedFromTeamsClientSDK.add(specifierName),
    );
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
       * to replace the method call is actually to replace the callee node in AST
       * so we have to reach callee node and then keep the node
       */
      const callee: ASTPath<MemberExpression> = reachCallee(path);
      /**
       * find right replacement and build string of original method reference for log
       */
      const rule: replacement | void = findReplacement(replacements, callee);
      const originalMethodReference: string = getOriginalMethodReference(path);
      /**
       * if there is an one-on-one mapping, (somehow there might not be one, i.e. forget to add rules)
       * replace function reference from Teams Client SDK to teamsjs App SDK
       */
      if (typeof rule !== 'undefined') {
        /**
         * prepare an array of tokens, which are function references in teamsjs App SDK,
         * i.e. ['core', 'initialize']
         * to create new AST node and then replace the original AST node
         */
        const replacedMosAppSDKFunctionReference: Array<string> = Object.assign([], rule.targetPrefixTokens);
        replacedMosAppSDKFunctionReference.push(rule.targetMethod);
        /**
         * replace AST node using jscodeshift inner replacing function
         */
        callee.replace(buildMethodASTNode(replacedMosAppSDKFunctionReference));
        /**
         * prompt log for developers to show where the tool makes replacement
         */
        const replacedMethodReference = rule.targetPrefixTokens.join('.').concat('.' + rule.targetMethod);
        if (typeof path.node.loc !== 'undefined' && path.node.loc !== null) {
          replaceMethodLogger(originalMethodReference, replacedMethodReference, path.node.loc.start.line);
        } else {
          replaceMethodLogger(originalMethodReference, replacedMethodReference);
        }
      }
    });
  }

  return root.toSource({ quote: 'single' });
};
export default transform;
