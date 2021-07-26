import { testHelper } from '../testHelper';

const testList = [
  /**
   * appInitialization namespace
   */
  'appInitialization/replace-appInitialization-notifyAppLoaded',
  'appInitialization/replace-appInitialization-notifyExpectedFailure',
  'appInitialization/replace-appInitialization-notifyFailure',
  'appInitialization/replace-appInitialization-notifySuccess',
  /**
   * authentication namespace
   */
  'authentication/replace-authentication-authenticate',
  'authentication/replace-authentication-getAuthToken',
  'authentication/replace-authentication-notifyFailure',
  'authentication/replace-authentication-notifySuccess',
  'authentication/replace-authentication-initialize',
  /**
   * authentication/replace-authentication-getUser is a private function hided from docs,
   * which needs to be figure out replacement/mapping in the future
   */
  /**
   * core namespace
   */
  'core/replace-initialize',
  'core/replace-getContext',
  'core/replace-shareDeepLink',
  'core/replace-executeDeepLink',
  'core/replace-registerOnThemeChangeHandler',
  /**
   * dialog namespace
   */
  'dialog/replace-tasks-startTask',
  'dialog/replace-tasks-submitTask',
  'dialog/replace-tasks-updateTask',
  /**
   * location namespace
   */
  'location/replace-location-getLocation',
  'location/replace-location-showLocation',
  /**
   * pages.config namespace
   */
  'pages.config/replace-settings-getSettings',
  'pages.config/replace-settings-setSettings',
  'pages.config/replace-settings-setValidityState',
  'pages.config/replace-settings-registerOnSaveHandler',
  'pages.config/replace-settings-registerOnRemoveHandler',
  'pages.config/replace-settings-initialize',
];

const transformName = 'replaceSDK';
const dirName = __dirname;

/**
 * run tests on an empty transform for testing environment
 */
testHelper(dirName, transformName, testList);
