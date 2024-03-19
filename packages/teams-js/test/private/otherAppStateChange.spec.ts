import { GlobalVars } from '../../src/internal/globalVars';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { MessageRequestWithRequiredProperties } from '../../src/internal/messageObjects';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../../src/internal/telemetry';
import { otherAppStateChange } from '../../src/private/otherAppStateChange';
import { app, ErrorCode, FrameContexts } from '../../src/public';
import { Utils } from '../utils';

describe('otherAppStateChange', () => {
  describe('Framed', () => {
    let utils = new Utils();
    beforeEach(() => {
      utils = new Utils();
      utils.messages = [];
    });
    afterEach(() => {
      app._uninitialize();
    });
    describe('isSupported', () => {
      it('should not allow calls before initialization', () => {
        expect.assertions(1);
        expect(() => otherAppStateChange.unregisterAppInstallationHandler()).toThrowError();
      });

      Object.values(FrameContexts).forEach((frameContext) => {
        it(`should return false if called from ${frameContext} frame context but capability is not supported`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });

          expect(otherAppStateChange.isSupported()).toBe(false);
        });
        it(`should return true if called from ${frameContext} frame context and capability is supported`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 1, supports: { otherAppStateChange: {} } });

          expect(otherAppStateChange.isSupported()).toBe(true);
        });
      });
    });
    describe('unregisterAppInstallationHandler', () => {
      it('should not allow calls before initialization', () => {
        expect.assertions(1);
        expect(() => otherAppStateChange.unregisterAppInstallationHandler()).toThrowError();
      });

      Object.values(FrameContexts).forEach((frameContext) => {
        it(`should throw correct error if called from ${frameContext} frame context but capability is not supported`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });

          expect(() => otherAppStateChange.unregisterAppInstallationHandler()).toThrowError(
            ErrorCode.NOT_SUPPORTED_ON_PLATFORM.toString(),
          );
        });
        it(`should succeed if called from ${frameContext} frame context and capability is supported`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 1, supports: { otherAppStateChange: {} } });

          expect(() => otherAppStateChange.unregisterAppInstallationHandler()).not.toThrowError();
        });
      });

      it('should pass a message with the correct func value to the host', async () => {
        expect.assertions(1);
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: 1, supports: { otherAppStateChange: {} } });

        otherAppStateChange.unregisterAppInstallationHandler();
        const message = utils.findMessageByFunc(ApiName.OtherAppStateChange_UnregisterInstall);
        expect(message).not.toBeNull();
      });

      it('should pass empty args array to the host', async () => {
        expect.assertions(2);
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: 1, supports: { otherAppStateChange: {} } });

        otherAppStateChange.unregisterAppInstallationHandler();
        const message = utils.findMessageByFunc(ApiName.OtherAppStateChange_UnregisterInstall);
        expect(message?.args).not.toBeUndefined();
        expect(message?.args?.length).toBe(0);
      });

      it('should pass correct telemetry id to host', async () => {
        expect.assertions(1);
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: 1, supports: { otherAppStateChange: {} } });

        otherAppStateChange.unregisterAppInstallationHandler();
        const message = <MessageRequestWithRequiredProperties>(
          utils.findMessageByFunc(ApiName.OtherAppStateChange_UnregisterInstall)
        );
        expect(message?.apiVersionTag).toEqual(
          getApiVersionTag(ApiVersionNumber.V_2, ApiName.OtherAppStateChange_UnregisterInstall),
        );
      });
    });
    describe('registerAppInstallationHandler', () => {
      it('should not allow calls before initialization', () => {
        expect.assertions(1);
        expect(() => otherAppStateChange.registerAppInstallationHandler((event) => {})).toThrowError();
      });

      Object.values(FrameContexts).forEach((frameContext) => {
        it(`should throw correct error if called from ${frameContext} frame context but capability is not supported`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });

          expect(() => otherAppStateChange.registerAppInstallationHandler((event) => {})).toThrowError(
            ErrorCode.NOT_SUPPORTED_ON_PLATFORM.toString(),
          );
        });
        it(`should succeed if called from ${frameContext} frame context and capability is supported`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 1, supports: { otherAppStateChange: {} } });

          expect(() => otherAppStateChange.registerAppInstallationHandler((event) => {})).not.toThrowError();
        });
      });

      it('should pass a message with the correct func value to the host', async () => {
        expect.assertions(1);
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: 1, supports: { otherAppStateChange: {} } });

        otherAppStateChange.registerAppInstallationHandler((event) => {});
        const message = utils.findMessageByFunc(ApiName.RegisterHandler);
        expect(message).not.toBeNull();
      });

      it('should pass the name of the event a handler is being registered for to the host', async () => {
        expect.assertions(3);
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: 1, supports: { otherAppStateChange: {} } });

        otherAppStateChange.registerAppInstallationHandler((event) => {});
        const message = utils.findMessageByFunc(ApiName.RegisterHandler);
        expect(message?.args).not.toBeUndefined();
        expect(message?.args?.length).toBe(1);
        expect(message?.args![0]).toBe(ApiName.OtherAppStateChange_Install);
      });

      it('should pass correct telemetry id to host', async () => {
        expect.assertions(1);
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: 1, supports: { otherAppStateChange: {} } });

        otherAppStateChange.registerAppInstallationHandler((event) => {});
        const message = <MessageRequestWithRequiredProperties>utils.findMessageByFunc(ApiName.RegisterHandler);
        expect(message?.apiVersionTag).toEqual(
          getApiVersionTag(ApiVersionNumber.V_2, ApiName.OtherAppStateChange_Install),
        );
      });

      it('handler should get called when event received from host', async () => {
        expect.assertions(1);
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: 1, supports: { otherAppStateChange: {} } });

        otherAppStateChange.registerAppInstallationHandler((event) => {
          expect(event.appIds).toEqual(['123', '456']);
        });

        utils.sendMessage(ApiName.OtherAppStateChange_Install, { appIds: ['123', '456'] });
      });
    });
  });
  describe('frameless communication', () => {
    let utils: Utils = new Utils();
    beforeEach(() => {
      utils = new Utils();
      utils.mockWindow.parent = undefined;
      utils.messages = [];
      GlobalVars.isFramelessWindow = false;
    });
    afterEach(() => {
      app._uninitialize();
      GlobalVars.isFramelessWindow = false;
    });
    describe('isSupported', () => {
      it('should not allow calls before initialization', () => {
        expect.assertions(1);
        expect(() => otherAppStateChange.unregisterAppInstallationHandler()).toThrowError();
      });

      Object.values(FrameContexts).forEach((frameContext) => {
        it(`should return false if called from ${frameContext} frame context but capability is not supported`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });

          expect(otherAppStateChange.isSupported()).toBe(false);
        });
        it(`should return true if called from ${frameContext} frame context and capability is supported`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 1, supports: { otherAppStateChange: {} } });

          expect(otherAppStateChange.isSupported()).toBe(true);
        });
      });
    });
    describe('unregisterAppInstallationHandler', () => {
      it('should not allow calls before initialization', () => {
        expect.assertions(1);
        expect(() => otherAppStateChange.unregisterAppInstallationHandler()).toThrowError();
      });

      Object.values(FrameContexts).forEach((frameContext) => {
        it(`should throw correct error if called from ${frameContext} frame context but capability is not supported`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });

          expect(() => otherAppStateChange.unregisterAppInstallationHandler()).toThrowError(
            ErrorCode.NOT_SUPPORTED_ON_PLATFORM.toString(),
          );
        });
        it(`should succeed if called from ${frameContext} frame context and capability is supported`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 1, supports: { otherAppStateChange: {} } });

          expect(() => otherAppStateChange.unregisterAppInstallationHandler()).not.toThrowError();
        });
      });

      it('should pass a message with the correct func value to the host', async () => {
        expect.assertions(1);
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: 1, supports: { otherAppStateChange: {} } });

        otherAppStateChange.registerAppInstallationHandler((event) => {});
        const message = utils.findMessageByFunc(ApiName.RegisterHandler);
        expect(message).not.toBeNull();
      });

      it('should pass the name of the event a handler is being registered for to the host', async () => {
        expect.assertions(3);
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: 1, supports: { otherAppStateChange: {} } });

        otherAppStateChange.registerAppInstallationHandler((event) => {});
        const message = utils.findMessageByFunc(ApiName.RegisterHandler);
        expect(message?.args).not.toBeUndefined();
        expect(message?.args?.length).toBe(1);
        expect(message?.args![0]).toBe(ApiName.OtherAppStateChange_Install);
      });

      it('should pass correct telemetry id to host', async () => {
        expect.assertions(1);
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: 1, supports: { otherAppStateChange: {} } });

        otherAppStateChange.registerAppInstallationHandler((event) => {});
        const message = <MessageRequestWithRequiredProperties>utils.findMessageByFunc(ApiName.RegisterHandler);
        expect(message?.apiVersionTag).toEqual(
          getApiVersionTag(ApiVersionNumber.V_2, ApiName.OtherAppStateChange_Install),
        );
      });

      it('handler should get called when event received from host', async () => {
        expect.assertions(1);
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: 1, supports: { otherAppStateChange: {} } });

        otherAppStateChange.registerAppInstallationHandler((event) => {
          expect(event.appIds).toEqual(['123', '456']);
        });

        utils.respondToFramelessMessage({
          data: {
            func: ApiName.OtherAppStateChange_Install,
            args: [{ appIds: ['123', '456'] }],
          },
        } as DOMMessageEvent);
      });
    });
  });
});
