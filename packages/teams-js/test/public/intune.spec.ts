import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { FrameContexts } from '../../src/public';
import { intune } from '../../src/public';
import * as app from '../../src/public/app/app';
import { errorNotSupportedOnPlatform } from '../../src/public/constants';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { Utils } from '../utils';

/* cSpell:disable */

const allowedContexts = [FrameContexts.content, FrameContexts.task];

describe('intune', () => {
  const utils = new Utils();

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;
    GlobalVars.frameContext = undefined;
    app._initialize(utils.mockWindow);
  });

  afterEach(() => {
    if (app._uninitialize) {
      utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      app._uninitialize();
    }
  });

  describe('isSupported', () => {
    it('should return false if the runtime says intune is not supported', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 4, supports: {} });
      expect(intune.isSupported()).not.toBeTruthy();
    });

    it('should return true if the runtime says intune is supported', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 4, supports: { intune: {} } });
      expect(intune.isSupported()).toBeTruthy();
    });

    it('should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();
      expect(() => intune.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });
  });

  describe('isSaveToLocationAllowed', () => {
    it('should not allow calls before initialization', async () => {
      expect.assertions(1);
      try {
        await intune.isSaveToLocationAllowed(intune.SaveLocation.LOCAL);
      } catch (e) {
        expect(e).toEqual(new Error(errorLibraryNotInitialized));
      }
    });

    Object.keys(FrameContexts)
      .map((k) => FrameContexts[k])
      .forEach((frameContext) => {
        if (allowedContexts.includes(frameContext)) {
          it(`should allow calls from ${frameContext} context`, async () => {
            await utils.initializeWithContext(frameContext);
            utils.setRuntimeConfig({ apiVersion: 4, supports: { intune: {} } });

            const promise = intune.isSaveToLocationAllowed(intune.SaveLocation.LOCAL);
            const message = utils.findMessageByFunc('intune.isSaveToLocationAllowed');
            expect(message).not.toBeNull();

            await utils.respondToMessage(message!, null, true);
            await expect(promise).resolves.toBe(true);
          });
        } else {
          it(`should not allow calls from ${frameContext} context`, async () => {
            expect.assertions(1);
            await utils.initializeWithContext(frameContext);
            utils.setRuntimeConfig({ apiVersion: 4, supports: { intune: {} } });
            try {
              await intune.isSaveToLocationAllowed(intune.SaveLocation.LOCAL);
            } catch (e) {
              expect(e).toMatchObject(
                new Error(
                  `This call is only allowed in following contexts: ${JSON.stringify(allowedContexts)}. Current context: "${frameContext}".`,
                ),
              );
            }
          });
        }
      });

    it('should not allow calls if runtime does not support intune', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 4, supports: {} });
      try {
        await intune.isSaveToLocationAllowed(intune.SaveLocation.LOCAL);
      } catch (e) {
        expect(e).toEqual(errorNotSupportedOnPlatform);
      }
    });

    it('should send the correct message with the save location', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 4, supports: { intune: {} } });

      const promise = intune.isSaveToLocationAllowed(intune.SaveLocation.ONEDRIVE_FOR_BUSINESS);
      const message = utils.findMessageByFunc('intune.isSaveToLocationAllowed');

      expect(message).not.toBeNull();
      expect(message!.args!.length).toEqual(1);
      expect(message!.args![0]).toBe(intune.SaveLocation.ONEDRIVE_FOR_BUSINESS);

      await utils.respondToMessage(message!, null, true);
      await expect(promise).resolves.toBe(true);
    });

    it('should return false when the policy disallows saving', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 4, supports: { intune: {} } });

      const promise = intune.isSaveToLocationAllowed(intune.SaveLocation.BOX);
      const message = utils.findMessageByFunc('intune.isSaveToLocationAllowed');

      await utils.respondToMessage(message!, null, false);
      await expect(promise).resolves.toBe(false);
    });

    it('should throw when the host returns an error', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 4, supports: { intune: {} } });

      const promise = intune.isSaveToLocationAllowed(intune.SaveLocation.LOCAL);
      const message = utils.findMessageByFunc('intune.isSaveToLocationAllowed');

      await utils.respondToMessage(message!, { errorCode: 500, message: 'Internal error' });
      await promise.catch((e) => expect(e).toMatchObject({ errorCode: 500, message: 'Internal error' }));
    });
  });

  describe('isOpenFromLocationAllowed', () => {
    it('should not allow calls before initialization', async () => {
      expect.assertions(1);
      try {
        await intune.isOpenFromLocationAllowed(intune.OpenLocation.LOCAL);
      } catch (e) {
        expect(e).toEqual(new Error(errorLibraryNotInitialized));
      }
    });

    Object.keys(FrameContexts)
      .map((k) => FrameContexts[k])
      .forEach((frameContext) => {
        if (allowedContexts.includes(frameContext)) {
          it(`should allow calls from ${frameContext} context`, async () => {
            await utils.initializeWithContext(frameContext);
            utils.setRuntimeConfig({ apiVersion: 4, supports: { intune: {} } });

            const promise = intune.isOpenFromLocationAllowed(intune.OpenLocation.LOCAL);
            const message = utils.findMessageByFunc('intune.isOpenFromLocationAllowed');
            expect(message).not.toBeNull();

            await utils.respondToMessage(message!, null, true);
            await expect(promise).resolves.toBe(true);
          });
        } else {
          it(`should not allow calls from ${frameContext} context`, async () => {
            expect.assertions(1);
            await utils.initializeWithContext(frameContext);
            utils.setRuntimeConfig({ apiVersion: 4, supports: { intune: {} } });
            try {
              await intune.isOpenFromLocationAllowed(intune.OpenLocation.LOCAL);
            } catch (e) {
              expect(e).toMatchObject(
                new Error(
                  `This call is only allowed in following contexts: ${JSON.stringify(allowedContexts)}. Current context: "${frameContext}".`,
                ),
              );
            }
          });
        }
      });

    it('should not allow calls if runtime does not support intune', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 4, supports: {} });
      try {
        await intune.isOpenFromLocationAllowed(intune.OpenLocation.LOCAL);
      } catch (e) {
        expect(e).toEqual(errorNotSupportedOnPlatform);
      }
    });

    it('should send the correct message with the open location', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 4, supports: { intune: {} } });

      const promise = intune.isOpenFromLocationAllowed(intune.OpenLocation.SHAREPOINT);
      const message = utils.findMessageByFunc('intune.isOpenFromLocationAllowed');

      expect(message).not.toBeNull();
      expect(message!.args!.length).toEqual(1);
      expect(message!.args![0]).toBe(intune.OpenLocation.SHAREPOINT);

      await utils.respondToMessage(message!, null, true);
      await expect(promise).resolves.toBe(true);
    });

    it('should return false when the policy disallows opening', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 4, supports: { intune: {} } });

      const promise = intune.isOpenFromLocationAllowed(intune.OpenLocation.CAMERA);
      const message = utils.findMessageByFunc('intune.isOpenFromLocationAllowed');

      await utils.respondToMessage(message!, null, false);
      await expect(promise).resolves.toBe(false);
    });

    it('should throw when the host returns an error', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 4, supports: { intune: {} } });

      const promise = intune.isOpenFromLocationAllowed(intune.OpenLocation.LOCAL);
      const message = utils.findMessageByFunc('intune.isOpenFromLocationAllowed');

      await utils.respondToMessage(message!, { errorCode: 500, message: 'Internal error' });
      await promise.catch((e) => expect(e).toMatchObject({ errorCode: 500, message: 'Internal error' }));
    });
  });
});
