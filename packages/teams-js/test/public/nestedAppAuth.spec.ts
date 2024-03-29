import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { app, FrameContexts, nestedAppAuth } from '../../src/public';
import { _minRuntimeConfigToUninitialize, Runtime } from '../../src/public/runtime';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

/**
 * Test cases for nested app auth APIs
 */
describe('nestedAppAuth', () => {
  const utils = new Utils();

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;
  });

  afterEach(() => {
    if (app._uninitialize) {
      utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      app._uninitialize();
    }
  });

  it('should throw if called before initialization', () => {
    utils.uninitializeRuntimeConfig();
    expect(() => nestedAppAuth.isChannelRecommended()).toThrowError(new Error(errorLibraryNotInitialized));
  });

  it('should return true if isNAAChannelRecommended set to true in runtime object', async () => {
    await utils.initializeWithContext(FrameContexts.content);
    const runtimeConfig: Runtime = {
      apiVersion: 4,
      supports: {},
      isNAAChannelRecommended: true,
    };
    utils.setRuntimeConfig(runtimeConfig);
    expect(nestedAppAuth.isChannelRecommended()).toBeTruthy();
  });

  it('should return false if isNAAChannelRecommended set to false in runtime object ', async () => {
    await utils.initializeWithContext(FrameContexts.content);
    const runtimeConfig: Runtime = {
      apiVersion: 4,
      supports: {},
      isNAAChannelRecommended: false,
    };
    utils.setRuntimeConfig(runtimeConfig);
    expect(nestedAppAuth.isChannelRecommended()).toBeFalsy();
  });

  it('should return false if isNAAChannelRecommended not present in runtime object ', async () => {
    await utils.initializeWithContext(FrameContexts.content);
    const runtimeConfig: Runtime = {
      apiVersion: 4,
      supports: {},
    };
    utils.setRuntimeConfig(runtimeConfig);
    expect(nestedAppAuth.isChannelRecommended()).toBeFalsy();
  });
});
