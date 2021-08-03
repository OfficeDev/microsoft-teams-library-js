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
  /**
   * authentication/replace-authentication-initialize has to be added in the future and try to solve problem
   * of finding replacement with conflict method name
   */
  'settings/replace-settings-getSettings',
  'settings/replace-settings-setSettings',
  'settings/replace-settings-setValidityState',
  'settings/replace-settings-registerOnSaveHandler',
  'settings/replace-settings-registerOnRemoveHandler',
];

const transformName = 'replaceSDK';
const dirName = __dirname;

/**
 * run tests on an empty transform for testing environment
 */
testHelper(dirName, transformName, testList);
