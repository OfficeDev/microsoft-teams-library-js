/**
 * try to split this test files and mappings.json file to multiple files for easy updating
 * i.e. a function is removed, renamed, updated
 */
import { testHelper } from '../testHelper';

const testList = [
  /**
   * app namespace
   */
  'app/replace-appInitialization-notifyAppLoaded',
  'app/replace-appInitialization-notifyExpectedFailure',
  'app/replace-appInitialization-notifyFailure',
  'app/replace-appInitialization-notifySuccess',
  'app/replace-initialize',
  'app/replace-getContext',
  'app/replace-registerOnThemeChangeHandler',
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
  'core/replace-shareDeepLink',
  'core/replace-executeDeepLink',
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
