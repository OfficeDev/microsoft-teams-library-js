import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { appEntity } from '../../src/private/appEntity';
import { FrameContexts } from '../../src/public';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform } from '../../src/public/constants';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

describe('appEntity', () => {
  // Use to send a mock message from the app.
  const utils = new Utils();

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      app._uninitialize();
    }
  });

  describe('isSupported', () => {
    it('should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();
      expect(() => appEntity.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });
  });

  describe('selectAppEntity', () => {
    const allowedContexts = [FrameContexts.content];

    it('appEntity.selectAppEntity should not allow calls before initialization', () => {
      expect(() => appEntity.selectAppEntity('threadID', [], '', () => {})).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContexts) => allowedContexts === context)) {
        it('appEntity.selectAppEntity should throw not supported on platform error if appEntity capability is not supported', async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(1);
          try {
            appEntity.selectAppEntity('threadID', [], '', () => {});
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });
      } else {
        it(`appEntity.selectAppEntity should not allow calls from ${context} context`, async () => {
          await utils.initializeWithContext(context);
          expect(() => appEntity.selectAppEntity('threadID', [], '', () => {})).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });
});
