import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { app } from '../../src/public/app';
import { FrameContexts } from '../../src/public/constants';
import { M365ContentAction } from '../../src/public/interfaces';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { search } from '../../src/public/search';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

const dataError = 'Something went wrong...';

/**
 * Type guard to determine if an action item is of M365Content Type
 */
function isM365ContentType(actionItem: unknown): actionItem is M365ContentAction {
  // eslint-disable-next-line no-prototype-builtins
  return actionItem && Object.prototype.hasOwnProperty.call(actionItem, 'secondaryId');
}

describe('Testing search capability', () => {
  const mockErrorMessage = 'Something went wrong...';
  describe('Framed - Testing search capability', () => {
    // Use to send a mock message from the app.
    const utils = new Utils();

    beforeEach(() => {
      utils.processMessage = null;
      utils.messages = [];
      utils.childMessages = [];
      utils.childWindow.closed = false;
      GlobalVars.frameContext = undefined;

      // Set a mock window for testing
      app._initialize(utils.mockWindow);
    });

    afterEach(() => {
       // Reset the object since it's a singleton
      if (app._uninitialize) {
        utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
        app._uninitialize();
      }
    });

    describe('Testing search.closeSearch function', () => {
      it('should not allow calls before initialization', async () => {
        expect.assertions(1);
        await search
          .closeSearch()
          .catch((e) => expect(e).toMatchObject(new Error(errorLibraryNotInitialized)));
      });
  
      Object.keys(FrameContexts)
        .map((k) => FrameContexts[k])
        .forEach((frameContext) => {
          it(`should not allow calls from ${frameContext} context`, async () => {
            if (frameContext === FrameContexts.content) {
              return;
            }
  
            expect.assertions(1);
  
            await utils.initializeWithContext(frameContext);
  
            await search
              .closeSearch()
              .catch((e) =>
                expect(e).toMatchObject(
                  new Error(
                    `This call is only allowed in following contexts: ["content"]. Current context: "${frameContext}".`,
                  ),
                ),
              );
          });
        });
  
      it('should not allow calls if runtime does not support search', async () => {
        expect.assertions(1);
  
        await utils.initializeWithContext('content');
        utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
  
        await expect(search.closeSearch()).rejects.toThrowError('Not supported');
      });
  
      it('should successfully throw if the closeSearch message sends and fails', async () => {
        expect.assertions(1);
  
        await utils.initializeWithContext('content');
        utils.setRuntimeConfig({ apiVersion: 1, supports: { search: {} } });
  
        const closeSearchPromise = search.closeSearch();
  
        const closeSearch = utils.findMessageByFunc('search.closeSearch');
  
        const data = {
          success: false,
          error: dataError,
        };
  
        utils.respondToMessage(closeSearch, data.success, data.error);
        await closeSearchPromise.catch((e) => expect(e).toMatchObject(new Error(dataError)));
      });
  
      it('should successfully send the closeSearch message', async () => {
        await utils.initializeWithContext('content');
        utils.setRuntimeConfig({ apiVersion: 1, supports: { search: {} } });
  
        const promise = search.closeSearch();
  
        const closeSearchMessage = utils.findMessageByFunc('search.closeSearch');
  
        const data = {
          success: true,
        };
  
        utils.respondToMessage(closeSearchMessage, data.success);
        await promise;
  
        expect(closeSearchMessage).not.toBeNull();
        expect(closeSearchMessage.args.length).toEqual(0);
        expect(closeSearchMessage.args[0]).toEqual(undefined);
      });
  
      it('should resolve promise after successfully sending the closeSearch message', async () => {
        await utils.initializeWithContext('content');
        utils.setRuntimeConfig({ apiVersion: 1, supports: { search: {} } });
  
        const promise = search.closeSearch();
  
        const closeSearchMessage = utils.findMessageByFunc('search.closeSearch');
  
        const data = {
          success: true,
        };
  
        utils.respondToMessage(closeSearchMessage, data.success);
        await expect(promise).resolves.not.toThrow();
      });
    });
  });

  describe('Frameless - Testing app capbility', () => {
    let utils: Utils = new Utils();
    beforeEach(() => {
      utils.processMessage = null;
      utils.messages = [];
      utils.childMessages = [];
      utils.childWindow.closed = false;
      GlobalVars.frameContext = undefined;

      // Set a mock window for testing
      app._initialize(utils.mockWindow);
    });
    afterEach(() => {
       // Reset the object since it's a singleton
      if (app._uninitialize) {
        utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
        app._uninitialize();
      }
    });

    describe('Testing search.closeSearch function', () => {
      it('should not allow calls before initialization', async () => {
        expect.assertions(1);
        await search
          .closeSearch()
          .catch((e) => expect(e).toMatchObject(new Error(errorLibraryNotInitialized)));
      });
  
      Object.keys(FrameContexts)
        .map((k) => FrameContexts[k])
        .forEach((frameContext) => {
          it(`should not allow calls from ${frameContext} context`, async () => {
            if (frameContext === FrameContexts.content) {
              return;
            }
  
            expect.assertions(1);
  
            await utils.initializeWithContext(frameContext);
  
            await search
              .closeSearch()
              .catch((e) =>
                expect(e).toMatchObject(
                  new Error(
                    `This call is only allowed in following contexts: ["content"]. Current context: "${frameContext}".`,
                  ),
                ),
              );
          });
        });
  
      it('should not allow calls if runtime does not support search', async () => {
        expect.assertions(1);
  
        await utils.initializeWithContext('content');
        utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
  
        await expect(search.closeSearch()).rejects.toThrowError('Not supported');
      });
  
      it('should successfully throw if the closeSearch message sends and fails', async () => {
        expect.assertions(1);
  
        await utils.initializeWithContext('content');
        utils.setRuntimeConfig({ apiVersion: 1, supports: { search: {} } });
  
        const closeSearchPromise = search.closeSearch();
  
        const closeSearch = utils.findMessageByFunc('search.closeSearch');
  
        const data = {
          success: false,
          error: dataError,
        };
  
        utils.respondToMessage(closeSearch, data.success, data.error);
        await closeSearchPromise.catch((e) => expect(e).toMatchObject(new Error(dataError)));
      });
  
      it('should successfully send the closeSearch message', async () => {
        await utils.initializeWithContext('content');
        utils.setRuntimeConfig({ apiVersion: 1, supports: { search: {} } });
  
        const promise = search.closeSearch();
  
        const closeSearchMessage = utils.findMessageByFunc('search.closeSearch');
  
        const data = {
          success: true,
        };
  
        utils.respondToMessage(closeSearchMessage, data.success);
        await promise;
  
        expect(closeSearchMessage).not.toBeNull();
        expect(closeSearchMessage.args.length).toEqual(0);
        expect(closeSearchMessage.args[0]).toEqual(undefined);
      });
  
      it('should resolve promise after successfully sending the closeSearch message', async () => {
        await utils.initializeWithContext('content');
        utils.setRuntimeConfig({ apiVersion: 1, supports: { search: {} } });
  
        const promise = search.closeSearch();
  
        const closeSearchMessage = utils.findMessageByFunc('search.closeSearch');
  
        const data = {
          success: true,
        };
  
        utils.respondToMessage(closeSearchMessage, data.success);
        await expect(promise).resolves.not.toThrow();
      });
    });
  });
});
