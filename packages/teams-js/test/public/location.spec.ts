import { errorLibraryNotInitialized, locationAPIsRequiredVersion } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { ErrorCode, location, SdkError } from '../../src/public/index';
import { setUnitializedRuntime } from '../../src/public/runtime';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

/**
 * Test cases for location APIs
 */
describe('location', () => {
  const minVersionForLocationAPIs = locationAPIsRequiredVersion;

  const defaultLocation: location.Location = { latitude: 17, longitude: 17, accuracy: -1, timestamp: 100 };
  const originalDefaultPlatformVersion = '1.6.0';
  const defaultLocationProps: location.LocationProps = { allowChooseLocation: false, showMap: false };
  const emptyCallback = (): void => {
    return;
  };
  const utils: Utils = new Utils();

  describe('frameless', () => {
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

    describe('isSupported API', () => {
      it('location.isSupported should return false if the runtime says location is not supported', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
        expect(location.isSupported()).not.toBeTruthy();
      });

      it('location.isSupported should return true if the runtime says location is supported', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
        expect(location.isSupported()).toBeTruthy();
      });

      it('should not be supported before initialization', () => {
        setUnitializedRuntime();
        expect(() => location.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
      });
    });

    describe('getLocation API', () => {
      it('getLocation call in default version of platform support fails', () => {
        utils.initializeWithContext(FrameContexts.task).then(() => {
          utils.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
          expect.assertions(1);

          try {
            location.getLocation(defaultLocationProps, emptyCallback);
          } catch (e) {
            expect(e.errorCode).toBe(ErrorCode.OLD_PLATFORM);
          }
        });
      });

      it('should not allow getLocation calls for authentication frame context', async () => {
        await utils.initializeWithContext(FrameContexts.authentication);
        utils.setClientSupportedSDKVersion(minVersionForLocationAPIs);
        expect(() => location.getLocation(defaultLocationProps, emptyCallback)).toThrowError(
          'This call is only allowed in following contexts: ["content","task"]. Current context: "authentication".',
        );
      });

      it('should not allow getLocation calls for remove frame context', async () => {
        await utils.initializeWithContext(FrameContexts.remove);
        utils.setClientSupportedSDKVersion(minVersionForLocationAPIs);
        expect(() => location.getLocation(defaultLocationProps, emptyCallback)).toThrowError(
          'This call is only allowed in following contexts: ["content","task"]. Current context: "remove".',
        );
      });

      it('should not allow getLocation calls for settings frame context', async () => {
        await utils.initializeWithContext(FrameContexts.settings);
        utils.setClientSupportedSDKVersion(minVersionForLocationAPIs);
        expect(() => location.getLocation(defaultLocationProps, emptyCallback)).toThrowError(
          'This call is only allowed in following contexts: ["content","task"]. Current context: "settings".',
        );
      });

      it('getLocation call in task frameContext works', async () => {
        await utils.initializeWithContext(FrameContexts.task);
        utils.setClientSupportedSDKVersion(minVersionForLocationAPIs);
        utils.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
        location.getLocation(defaultLocationProps, emptyCallback);
        const message = utils.findMessageByFunc('location.getLocation');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
        expect(message.args[0]).toEqual(defaultLocationProps);
      });

      it('getLocation call in content frameContext works', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setClientSupportedSDKVersion(minVersionForLocationAPIs);
        utils.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
        location.getLocation(defaultLocationProps, emptyCallback);
        const message = utils.findMessageByFunc('location.getLocation');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
        expect(message.args[0]).toEqual(defaultLocationProps);
      });

      it('getLocation calls with successful result', (done) => {
        utils.initializeWithContext(FrameContexts.content).then(() => {
          utils.setClientSupportedSDKVersion(minVersionForLocationAPIs);
          utils.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });

          location.getLocation(defaultLocationProps, (error: SdkError, loc: location.Location) => {
            expect(error).toBeFalsy();
            expect(loc).not.toBeNull();
            expect(loc.latitude).toBe(defaultLocation.latitude);
            expect(loc.longitude).toBe(defaultLocation.longitude);
            expect(loc.accuracy).toBe(defaultLocation.accuracy);
            expect(loc.timestamp).toBe(defaultLocation.timestamp);
            done();
          });

          const message = utils.findMessageByFunc('location.getLocation');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);
          expect(message.args[0]).toEqual(defaultLocationProps);

          const callbackId = message.id;
          utils.respondToFramelessMessage({
            data: {
              id: callbackId,
              args: [undefined, defaultLocation],
            },
          } as DOMMessageEvent);
        });
      });

      it('getLocation calls with error', (done) => {
        utils.initializeWithContext(FrameContexts.content).then(() => {
          utils.setClientSupportedSDKVersion(minVersionForLocationAPIs);
          utils.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });

          location.getLocation(defaultLocationProps, (error: SdkError, loc: location.Location) => {
            expect(loc).toBeFalsy();
            expect(error.errorCode).toBe(ErrorCode.PERMISSION_DENIED);
            done();
          });

          const message = utils.findMessageByFunc('location.getLocation');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);
          expect(message.args[0]).toEqual(defaultLocationProps);

          const callbackId = message.id;
          utils.respondToFramelessMessage({
            data: {
              id: callbackId,
              args: [{ errorCode: ErrorCode.PERMISSION_DENIED }],
            },
          } as DOMMessageEvent);
        });
      });
    });
    describe('Testing showLocation API', () => {
      it('should not allow showLocation calls before initialization', () => {
        expect(() => location.showLocation(defaultLocation, emptyCallback)).toThrowError(
          new Error(errorLibraryNotInitialized),
        );
      });

      it('showLocation call in default version of platform support fails', () => {
        utils.initializeWithContext(FrameContexts.task).then(() => {
          utils.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
          expect.assertions(1);

          try {
            location.showLocation(defaultLocation, emptyCallback);
          } catch (e) {
            expect(e.errorCode).toBe(ErrorCode.OLD_PLATFORM);
          }
        });
      });

      it('should not allow showLocation calls for authentication frame context', async () => {
        await utils.initializeWithContext(FrameContexts.authentication);
        utils.setClientSupportedSDKVersion(minVersionForLocationAPIs);
        expect(() => location.showLocation(defaultLocation, emptyCallback)).toThrowError(
          'This call is only allowed in following contexts: ["content","task"]. Current context: "authentication".',
        );
      });

      it('should not allow showLocation calls for remove frame context', async () => {
        await utils.initializeWithContext(FrameContexts.remove);
        utils.setClientSupportedSDKVersion(minVersionForLocationAPIs);
        expect(() => location.showLocation(defaultLocation, emptyCallback)).toThrowError(
          'This call is only allowed in following contexts: ["content","task"]. Current context: "remove".',
        );
      });

      it('should not allow showLocation calls for settings frame context', async () => {
        await utils.initializeWithContext(FrameContexts.settings);
        utils.setClientSupportedSDKVersion(minVersionForLocationAPIs);
        expect(() => location.showLocation(defaultLocation, emptyCallback)).toThrowError(
          'This call is only allowed in following contexts: ["content","task"]. Current context: "settings".',
        );
      });

      it('showLocation call in task frameContext works', async () => {
        await utils.initializeWithContext(FrameContexts.task);
        utils.setClientSupportedSDKVersion(minVersionForLocationAPIs);
        utils.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
        location.showLocation(defaultLocation, emptyCallback);
        const message = utils.findMessageByFunc('location.showLocation');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
        expect(message.args[0]).toEqual(defaultLocation);
      });

      it('showLocation call in content frameContext works', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setClientSupportedSDKVersion(minVersionForLocationAPIs);
        utils.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
        location.showLocation(defaultLocation, emptyCallback);
        const message = utils.findMessageByFunc('location.showLocation');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
        expect(message.args[0]).toEqual(defaultLocation);
      });

      it('showLocation calls with successful result', (done) => {
        utils.initializeWithContext(FrameContexts.content).then(() => {
          utils.setClientSupportedSDKVersion(minVersionForLocationAPIs);
          utils.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });

          location.showLocation(defaultLocation, (error: SdkError, value: boolean) => {
            expect(error).toBeFalsy();
            expect(value).toBe(true);
            done();
          });

          const message = utils.findMessageByFunc('location.showLocation');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);
          expect(message.args[0]).toEqual(defaultLocation);

          const callbackId = message.id;
          utils.respondToFramelessMessage({
            data: {
              id: callbackId,
              args: [undefined, true],
            },
          } as DOMMessageEvent);
        });
      });

      it('showLocation calls with error', (done) => {
        utils.initializeWithContext(FrameContexts.content).then(() => {
          utils.setClientSupportedSDKVersion(minVersionForLocationAPIs);
          utils.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });

          location.showLocation(defaultLocation, (error: SdkError, value: boolean) => {
            expect(value).toBeFalsy();
            expect(error.errorCode).toBe(ErrorCode.PERMISSION_DENIED);
            done();
          });

          const message = utils.findMessageByFunc('location.showLocation');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);
          expect(message.args[0]).toEqual(defaultLocation);

          const callbackId = message.id;
          utils.respondToFramelessMessage({
            data: {
              id: callbackId,
              args: [{ errorCode: ErrorCode.PERMISSION_DENIED }],
            },
          } as DOMMessageEvent);
        });
      });
    });

    it('Frameless - getLocation should throw error when not supported in the runtime config', () => {
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
      utils.initializeWithContext(FrameContexts.task).then(() => {
        expect.assertions(1);

        try {
          location.getLocation(defaultLocationProps, emptyCallback);
        } catch (e) {
          expect(e).toEqual(errorNotSupportedOnPlatform);
        }
      });
    });

    it('Frameless - showLocation should throw error when location is not supported', () => {
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
      utils.initializeWithContext(FrameContexts.task).then(() => {
        expect.assertions(1);

        try {
          location.showLocation(defaultLocation, emptyCallback);
        } catch (e) {
          expect(e).toEqual(errorNotSupportedOnPlatform);
        }
      });
    });
  });
  describe('framed', () => {
    let utils: Utils = new Utils();
    beforeEach(() => {
      utils = new Utils();
      utils.messages = [];
    });
    afterEach(() => {
      app._uninitialize();
    });

    describe('getLocation API', () => {
      it('should not allow getLocation calls before initialization', () => {
        expect(() => location.getLocation(defaultLocationProps, emptyCallback)).toThrowError(
          new Error(errorLibraryNotInitialized),
        );
      });

      it('should not allow getLocation calls without props', () => {
        utils.initializeWithContext(FrameContexts.content).then(() => {
          utils.setClientSupportedSDKVersion(minVersionForLocationAPIs);
          utils.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
          expect.assertions(1);

          try {
            location.getLocation(undefined, emptyCallback);
          } catch (e) {
            expect(e.errorCode).toBe(ErrorCode.INVALID_ARGUMENTS);
          }
        });
      });

      it('should allow getLocation calls in desktop', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setClientSupportedSDKVersion(minVersionForLocationAPIs);
        utils.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
        location.getLocation(defaultLocationProps, emptyCallback);
        const message = utils.findMessageByFunc('location.getLocation');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
        expect(message.args[0]).toEqual(defaultLocationProps);
      });
    });
    describe('Testing showLocation API', () => {
      it('should not allow showLocation calls before initialization', () => {
        expect(() => location.showLocation(defaultLocation, emptyCallback)).toThrowError(
          new Error(errorLibraryNotInitialized),
        );
      });

      it('should not allow showLocation calls without props', () => {
        utils.initializeWithContext(FrameContexts.content).then(() => {
          utils.setClientSupportedSDKVersion(minVersionForLocationAPIs);
          utils.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
          expect.assertions(1);

          try {
            location.showLocation(undefined, emptyCallback);
          } catch (e) {
            expect(e.errorCode).toBe(ErrorCode.INVALID_ARGUMENTS);
          }
        });
      });

      it('should allow showLocation calls in desktop', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setClientSupportedSDKVersion(minVersionForLocationAPIs);
        utils.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
        location.showLocation(defaultLocation, emptyCallback);
        const message = utils.findMessageByFunc('location.showLocation');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
        expect(message.args[0]).toEqual(defaultLocation);
      });
    });

    it('getLocation should throw error when not supported in the runtime config', () => {
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
      utils.initializeWithContext(FrameContexts.task).then(() => {
        expect.assertions(1);

        try {
          location.getLocation(defaultLocationProps, emptyCallback);
        } catch (e) {
          expect(e).toEqual(errorNotSupportedOnPlatform);
        }
      });
    });

    it('showLocation should throw error when location is not supported', () => {
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
      utils.initializeWithContext(FrameContexts.task).then(() => {
        expect.assertions(1);

        try {
          location.showLocation(defaultLocation, emptyCallback);
        } catch (e) {
          expect(e).toEqual(errorNotSupportedOnPlatform);
        }
      });
    });
  });
});
