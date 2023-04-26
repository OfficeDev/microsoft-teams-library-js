// This assignment is replaced at build time by a webpack plugin (or Jest during unit tests) which ensures the value matches the version set in the package version
declare const PACKAGE_VERSION = 'ERROR: This value should be replaced by webpack!';
/**
 * @hidden
 *  Package version.
 */
export const version = PACKAGE_VERSION;
