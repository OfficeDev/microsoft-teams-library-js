import { replacement } from './replacement';
import * as rules from './mappings.json';

/**
 * interface functionReferenceFragments defines that a fully qualified function reference
 * would be splitted to three fragments, which are used to build the replacement.
 * i.e. there is a fully qualified function reference, 'teamsjs.core.initialize', from
 * the target attribute in one of mapping in mappings.json
 * 'teamsjs' is the package name in this reference, 'initialize' is the method name,
 * and rest of them, 'core', is a namespace/prefix in reference denoting how to call
 * method 'initialize'
 * hence, an interface of functionReferenceFragment should be built/looked like as below
 * {
 *  packageName: 'teamsjs';
 *  prefixTokens: ['core'];
 *  methodName: 'initialize';
 * }
 */
interface functionReferenceFragments {
  packageName: string;
  prefixTokens: Array<string>;
  methodName: string;
}

/**
 * parse fully qualified function reference to a functionReferenceFragements
 * @param methodReference string of a fully qualified function reference, i.e. 'microsoftTeams.initialize'
 * @returns a functionReferenceFragments structure with three fragments
 */
function parseFullyQualifiedFunctionReference(methodReference: string): functionReferenceFragments {
  /**
   * parse the string to an array of tokens by spliting '.'
   */
  const tokens = methodReference.trim().split('.');
  /**
   * return a functionReferenceFragments type structure to help building replacement
   */
  return {
    packageName: tokens[0],
    prefixTokens: tokens.slice(1, tokens.length - 1),
    methodName: tokens[tokens.length - 1],
  };
}

/**
 * buildReplacement function is a private helper function to help build a single
 * replacement based on @param source and @param target
 * string would be splited to three fragments and each fragment would be
 * assigned to the corresponding attribute in replacement interface
 * @param source documented method in Teams Client SDK, i.e. 'microsoftTeams.initialize'
 * @param target documented mapping method from Teams Client SDK to teamsjs App SDK, i.e. 'teamsjs.core.initialize'
 * @returns a replacement with a pre-defined structure
 */
function buildReplacement(source: string, target: string): replacement {
  /**
   * parse two fully qualified function references to some fragments
   */
  const sourceFragments: functionReferenceFragments = parseFullyQualifiedFunctionReference(source);
  const targetFragments: functionReferenceFragments = parseFullyQualifiedFunctionReference(target);
  /**
   * build the replacement with pre-defined structure and
   * assign attribute value in fragments to corresponding attribute in replacement
   */
  return {
    sourcePackage: sourceFragments.packageName,
    targetPackage: targetFragments.packageName,
    sourcePrefixTokens: sourceFragments.prefixTokens,
    targetPrefixTokens: targetFragments.prefixTokens,
    sourceMethod: sourceFragments.methodName,
    targetMethod: targetFragments.methodName,
    /**
     * for convenience, store an array of tokens from source fully qualified function references here
     */
    sourceTokens: source.trim().split('.'),
  };
}

/**
 * export function to let jscodeshift transform function fetch replacements
 * for future replacement
 * @returns an array with replacements
 */
export function build(): Array<replacement> {
  /**
   * build(map) each mapping in json file to replacement
   */
  return rules['mappings'].map(mapping => buildReplacement(mapping['source'], mapping['target']));
}
