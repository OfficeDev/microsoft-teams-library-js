import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { ApiName } from '../../src/internal/telemetry';
import * as contextualSearch from '../../src/private/contextualSearch';
import * as app from '../../src/public/app/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on files with
   large numbers of errors. Over time, these errors can be fixed and eslint re-enabled. */

describe('contextualSearch', () => {
  let utils: Utils;

  const contextualSearchRuntimeConfig = {
    ..._minRuntimeConfigToUninitialize,
    supports: {
      ..._minRuntimeConfigToUninitialize.supports,
      contextualSearch: {},
    },
  };

  beforeEach(() => {
    utils = new Utils();
  });

  afterEach(() => {
    // Reset the object since runtime is a singleton.
    if (app._uninitialize) {
      utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      app._uninitialize();
    }
  });

  describe('isSupported', () => {
    it('should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();

      expect(() => contextualSearch.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('should return true when contextual search is supported', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(contextualSearchRuntimeConfig);

      expect(contextualSearch.isSupported()).toBeTruthy();
    });

    it('should return false when contextual search is not supported', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);

      expect(contextualSearch.isSupported()).toBeFalsy();
    });
  });

  describe('openContextualSearch', () => {
    it('should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();
      expect(() => contextualSearch.openContextualSearch()).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('should throw when contextual search is not supported', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      expect.assertions(1);
      try {
        contextualSearch.openContextualSearch();
      } catch (e) {
        expect(e).toEqual(errorNotSupportedOnPlatform);
      }
    });

    it('should throw when called from the settings context', async () => {
      await utils.initializeWithContext(FrameContexts.settings);
      utils.setRuntimeConfig(contextualSearchRuntimeConfig);
      expect(() => contextualSearch.openContextualSearch()).toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings".',
      );
    });

    it('should send an open request to the host', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(contextualSearchRuntimeConfig);

      void contextualSearch.openContextualSearch();

      const message = utils.findMessageByFunc(ApiName.ContextualSearch_OpenContextualSearch);

      expect(message).not.toBeNull();
    });

    it('should pass triggerSource when provided', async () => {
      expect.assertions(2);

      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(contextualSearchRuntimeConfig);

      void contextualSearch.openContextualSearch({
        triggerSource: 'engageSearchIcon',
      });

      const message = utils.findMessageByFunc(ApiName.ContextualSearch_OpenContextualSearch);

      expect(message).not.toBeNull();
      expect(message?.args?.[0]).toBe('engageSearchIcon');
    });

    it('should not pass triggerSource when it is not provided', async () => {
      expect.assertions(2);

      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(contextualSearchRuntimeConfig);

      void contextualSearch.openContextualSearch();

      const message = utils.findMessageByFunc(ApiName.ContextualSearch_OpenContextualSearch);

      expect(message).not.toBeNull();
      expect(message?.args?.length).toBe(0);
    });
  });

  describe('closeContextualSearch', () => {
    it('should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();
      expect(() => contextualSearch.closeContextualSearch()).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('should throw when contextual search is not supported', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      expect.assertions(1);
      try {
        contextualSearch.closeContextualSearch();
      } catch (e) {
        expect(e).toEqual(errorNotSupportedOnPlatform);
      }
    });

    it('should throw when called from the settings context', async () => {
      await utils.initializeWithContext(FrameContexts.settings);
      utils.setRuntimeConfig(contextualSearchRuntimeConfig);
      expect(() => contextualSearch.closeContextualSearch()).toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings".',
      );
    });

    it('should send a close request to the host', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(contextualSearchRuntimeConfig);

      void contextualSearch.closeContextualSearch();

      const message = utils.findMessageByFunc(ApiName.ContextualSearch_CloseContextualSearch);

      expect(message).not.toBeNull();
    });
  });

  describe('registerOnContextualSearchOpenedHandler', () => {
    it('should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();

      expect(() => contextualSearch.registerOnContextualSearchOpenedHandler(() => {})).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    it('should throw when contextual search is not supported', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      expect.assertions(1);

      try {
        contextualSearch.registerOnContextualSearchOpenedHandler(() => {});
      } catch (e) {
        expect(e).toEqual(errorNotSupportedOnPlatform);
      }
    });

    it('should register and invoke the opened handler', async () => {
      expect.assertions(4);

      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(contextualSearchRuntimeConfig);

      const handler = jest.fn();

      contextualSearch.registerOnContextualSearchOpenedHandler(handler);

      const registerHandlerMessage = utils.findMessageByFunc('registerHandler');

      expect(registerHandlerMessage).not.toBeNull();
      expect(registerHandlerMessage?.args?.length).toBe(1);
      expect(registerHandlerMessage?.args?.[0]).toBe('contextualSearchOpened');

      await utils.sendMessage('contextualSearchOpened');

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('registerOnContextualSearchClosedHandler', () => {
    it('should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();

      expect(() => contextualSearch.registerOnContextualSearchClosedHandler(() => {})).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    it('should throw when contextual search is not supported', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);

      try {
        contextualSearch.registerOnContextualSearchClosedHandler(() => {});
      } catch (e) {
        expect(e).toEqual(errorNotSupportedOnPlatform);
      }
    });

    it('should register and invoke the closed handler', async () => {
      expect.assertions(4);

      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(contextualSearchRuntimeConfig);

      const handler = jest.fn();

      contextualSearch.registerOnContextualSearchClosedHandler(handler);

      const registerHandlerMessage = utils.findMessageByFunc('registerHandler');

      expect(registerHandlerMessage).not.toBeNull();
      expect(registerHandlerMessage?.args?.length).toBe(1);
      expect(registerHandlerMessage?.args?.[0]).toBe('contextualSearchClosed');

      await utils.sendMessage('contextualSearchClosed');

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
});
