// This assignment is replaced at build time by a webpack plugin which ensures the value matches the version set in the package version
declare const PACKAGE_VERSION = 'ERROR: This value should be replaced by webpack!';
export const version = PACKAGE_VERSION;
