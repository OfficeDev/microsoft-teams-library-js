import { testHelper } from '../testHelper';

const testList = [
  'core/replace-initialize',
  'core/replace-getContext',
  'core/replace-shareDeepLink',
  'core/replace-executeDeepLink',
  'core/replace-registerOnThemeChangeHandler',
  'authentication/replace-authentication-authenticate',
  'authentication/replace-authentication-getAuthToken',
  'authentication/replace-authentication-notifyFailure',
  'authentication/replace-authentication-notifySuccess',
  'authentication/replace-authentication-registerAuthenticationHandlers',
];

const transformName = 'replaceSDK';
const dirName = __dirname;

/**
 * run tests on an empty transform for testing environment
 */
testHelper(dirName, transformName, testList);
