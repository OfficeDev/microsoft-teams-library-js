import { errorLibraryNotInitialized, permissionsAPIsRequiredVersion } from '../../src/internal/constants';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { ErrorCode, geoLocation, location } from '../../src/public/index';
import { DevicePermission } from '../../src/public/interfaces';
import { _minRuntimeConfigToUninitialize, setUnitializedRuntime } from '../../src/public/runtime';
import { FramelessPostMocks } from '../framelessPostMocks';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

/**
 * Test cases for geolocation APIs
 */
describe('geoLocation', () => {
  const framelessPlatform = new FramelessPostMocks();
  const minVersionForPermissionsAPIs = permissionsAPIsRequiredVersion;
  const defaultLocationProps: location.LocationProps = { allowChooseLocation: false, showMap: false };
  const defaultLocationPropsForChooseLocation: location.LocationProps = {
    allowChooseLocation: true,
    showMap: true,
  };
  const defaultLocation: geoLocation.Location = { latitude: 17, longitude: 17, accuracy: -1, timestamp: 100 };
  const originalDefaultPlatformVersion = '1.6.0';

  beforeEach(() => {
    framelessPlatform.messages = [];

    // Set a mock window for testing
    app._initialize(framelessPlatform.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      framelessPlatform.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      app._uninitialize();
    }
  });

  const allowedContexts = [FrameContexts.content, FrameContexts.task];

  describe('Testing isSupported', () => {
    it('should not be supported before initialization', () => {
      setUnitializedRuntime();
      expect(() => geoLocation.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });
  });

  describe('Testing getCurrentLocation API', () => {
    it('should not allow getCurrentLocation calls before initialization', () => {
      expect(() => geoLocation.getCurrentLocation()).toThrowError(new Error(errorLibraryNotInitialized));
    });

    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it(`should throw error when getCurrentLocation is not supported in runtime config. context: ${context}`, async () => {
          await framelessPlatform.initializeWithContext(context);
          framelessPlatform.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(4);
          try {
            geoLocation.getCurrentLocation();
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`getCurrentLocation should throw error when permissions is not supported in runtime config. context: ${context}`, async () => {
          await framelessPlatform.initializeWithContext(context);
          framelessPlatform.setRuntimeConfig({ apiVersion: 1, supports: { geoLocation: {} } });
          expect.assertions(4);
          try {
            geoLocation.getCurrentLocation();
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`getCurrentLocation calls with successful result. context: ${context}`, async () => {
          await framelessPlatform.initializeWithContext(context);
          framelessPlatform.setRuntimeConfig({ apiVersion: 1, supports: { geoLocation: {}, permissions: {} } });

          const promise = geoLocation.getCurrentLocation();

          const message = framelessPlatform.findMessageByFunc('location.getLocation');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);
          expect(message.args[0]).toEqual(defaultLocationProps);

          const callbackId = message.id;
          framelessPlatform.respondToMessage({
            data: {
              id: callbackId,
              args: [undefined, defaultLocation],
            },
          } as DOMMessageEvent);

          await expect(promise).resolves.toBe(defaultLocation);
        });

        it(`getCurrentLocation calls with error. context: ${context}`, async () => {
          await framelessPlatform.initializeWithContext(context);
          framelessPlatform.setClientSupportedSDKVersion(minVersionForPermissionsAPIs);
          framelessPlatform.setRuntimeConfig({ apiVersion: 1, supports: { geoLocation: {}, permissions: {} } });

          const promise = geoLocation.getCurrentLocation();

          const message = framelessPlatform.findMessageByFunc('location.getLocation');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);
          expect(message.args[0]).toEqual(defaultLocationProps);

          const callbackId = message.id;
          framelessPlatform.respondToMessage({
            data: {
              id: callbackId,
              args: [{ errorCode: ErrorCode.PERMISSION_DENIED }],
            },
          } as DOMMessageEvent);

          await expect(promise).rejects.toEqual({ errorCode: ErrorCode.PERMISSION_DENIED });
        });
      } else {
        it(`should not allow getCurrentLocation calls from the wrong context. context: ${context}`, async () => {
          await framelessPlatform.initializeWithContext(context);
          expect(() => geoLocation.getCurrentLocation()).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('Testing HasPermisison API', () => {
    it('should not allow hasPermission calls before initialization', () => {
      return expect(() => geoLocation.hasPermission()).toThrowError(new Error(errorLibraryNotInitialized));
    });

    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it(`should throw error when geoLocation is not supported in runtime config. context: ${context}`, async () => {
          await framelessPlatform.initializeWithContext(context);
          framelessPlatform.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(4);
          try {
            geoLocation.hasPermission();
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`geoLocation should throw error when permissions is not supported in runtime config. context: ${context}`, async () => {
          await framelessPlatform.initializeWithContext(context);
          framelessPlatform.setRuntimeConfig({ apiVersion: 1, supports: { geoLocation: {} } });
          expect.assertions(4);
          try {
            geoLocation.hasPermission();
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it('hasPermission call in default version of platform support fails', async () => {
          await framelessPlatform.initializeWithContext(context);
          expect.assertions(4);
          framelessPlatform.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
          try {
            geoLocation.hasPermission();
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it('hasPermission call with successful result', async () => {
          await framelessPlatform.initializeWithContext(context);
          framelessPlatform.setClientSupportedSDKVersion(minVersionForPermissionsAPIs);
          framelessPlatform.setRuntimeConfig({ apiVersion: 1, supports: { geoLocation: {}, permissions: {} } });

          const promise = geoLocation.hasPermission();

          const message = framelessPlatform.findMessageByFunc('permissions.has');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);
          expect(message.args[0]).toEqual(DevicePermission.GeoLocation);

          const callbackId = message.id;
          framelessPlatform.respondToMessage({
            data: {
              id: callbackId,
              args: [undefined, true],
            },
          } as DOMMessageEvent);

          await expect(promise).resolves.toBe(true);
        });

        it('HasPermission rejects promise with Error when error received from host', async () => {
          await framelessPlatform.initializeWithContext(context);
          framelessPlatform.setClientSupportedSDKVersion(minVersionForPermissionsAPIs);
          framelessPlatform.setRuntimeConfig({ apiVersion: 1, supports: { geoLocation: {}, permissions: {} } });

          const promise = geoLocation.hasPermission();

          const message = framelessPlatform.findMessageByFunc('permissions.has');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);

          const callbackId = message.id;
          framelessPlatform.respondToMessage({
            data: {
              id: callbackId,
              args: [{ errorCode: ErrorCode.INTERNAL_ERROR }],
            },
          } as DOMMessageEvent);

          await expect(promise).rejects.toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
        });
      } else {
        it(`should not allow hasPermission calls from the wrong context. context: ${context}`, async () => {
          await framelessPlatform.initializeWithContext(context);
          expect(() => geoLocation.hasPermission()).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('Testing RequestPermisison API', () => {
    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it('should not allow requestPermission calls before initialization', () => {
          expect(() => geoLocation.requestPermission()).toThrowError(new Error(errorLibraryNotInitialized));
        });

        it('requestPermission call in default version of platform support fails', async () => {
          await framelessPlatform.initializeWithContext(context);
          framelessPlatform.setClientSupportedSDKVersion('originalDefaultPlatformVersion');
          expect.assertions(4);
          try {
            geoLocation.requestPermission();
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`requestLocation should throw error when permissions is not supported in runtime config. context: ${context}`, async () => {
          await framelessPlatform.initializeWithContext(context);
          framelessPlatform.setRuntimeConfig({ apiVersion: 1, supports: { geoLocation: {} } });
          expect.assertions(4);
          try {
            geoLocation.requestPermission();
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`should throw error when geoLocation is not supported in runtime config. context: ${context}`, async () => {
          await framelessPlatform.initializeWithContext(context);
          framelessPlatform.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(4);
          try {
            geoLocation.hasPermission();
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it('requestPermission call with successful result', async () => {
          await framelessPlatform.initializeWithContext(context);
          framelessPlatform.setClientSupportedSDKVersion(minVersionForPermissionsAPIs);
          framelessPlatform.setRuntimeConfig({ apiVersion: 1, supports: { geoLocation: {}, permissions: {} } });

          const promise = geoLocation.requestPermission();

          const message = framelessPlatform.findMessageByFunc('permissions.request');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);
          expect(message.args[0]).toEqual(DevicePermission.GeoLocation);

          const callbackId = message.id;
          framelessPlatform.respondToMessage({
            data: {
              id: callbackId,
              args: [undefined, true],
            },
          } as DOMMessageEvent);

          await expect(promise).resolves.toBe(true);
        });

        it('requestPermission rejects promise with Error when error received from host', async () => {
          await framelessPlatform.initializeWithContext(context);
          framelessPlatform.setClientSupportedSDKVersion(minVersionForPermissionsAPIs);
          framelessPlatform.setRuntimeConfig({ apiVersion: 1, supports: { geoLocation: {}, permissions: {} } });

          const promise = geoLocation.requestPermission();

          const message = framelessPlatform.findMessageByFunc('permissions.request');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);

          const callbackId = message.id;
          framelessPlatform.respondToMessage({
            data: {
              id: callbackId,
              args: [{ errorCode: ErrorCode.INTERNAL_ERROR }],
            },
          } as DOMMessageEvent);

          await expect(promise).rejects.toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
        });
      } else {
        it(`should not allow requestPermission calls from the wrong context. context: ${context}`, async () => {
          await framelessPlatform.initializeWithContext(context);
          expect(() => geoLocation.requestPermission()).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('Testing geoLocation.map subcapability', () => {
    it('should not be supported before initialization', () => {
      setUnitializedRuntime();
      expect(() => geoLocation.map.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });

    describe('Testing geoLocation.map.showLocation API', () => {
      it('should not allow showLocation calls before initialization', () => {
        expect(() => geoLocation.map.showLocation(defaultLocation)).toThrowError(new Error(errorLibraryNotInitialized));
      });

      Object.values(FrameContexts).forEach((context) => {
        if (allowedContexts.some((allowedContext) => allowedContext === context)) {
          it(`should throw error when geoLocation is not supported in runtime config. context: ${context}`, async () => {
            await framelessPlatform.initializeWithContext(context);
            framelessPlatform.setRuntimeConfig({ apiVersion: 1, supports: {} });
            expect.assertions(4);
            try {
              geoLocation.map.showLocation(defaultLocation);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`should throw error when geoLocation.map is not supported in runtime config. context: ${context}`, async () => {
            await framelessPlatform.initializeWithContext(context);
            framelessPlatform.setRuntimeConfig({ apiVersion: 1, supports: { geoLocation: {}, permissions: {} } });
            expect.assertions(4);

            try {
              geoLocation.map.showLocation(defaultLocation);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`showLocation should throw error when permissions is not supported in runtime config. context: ${context}`, async () => {
            await framelessPlatform.initializeWithContext(context);
            framelessPlatform.setRuntimeConfig({ apiVersion: 1, supports: { geoLocation: { map: {} } } });
            expect.assertions(4);
            try {
              geoLocation.map.showLocation(defaultLocation);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`showLocation call in default version of platform support fails. context: ${context}`, async () => {
            await framelessPlatform.initializeWithContext(FrameContexts.task);
            framelessPlatform.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
            expect.assertions(4);
            try {
              geoLocation.map.showLocation(defaultLocation);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`should not allow showLocation calls without props. context: ${context}`, async () => {
            await framelessPlatform.initializeWithContext(context);
            framelessPlatform.setClientSupportedSDKVersion(minVersionForPermissionsAPIs);

            framelessPlatform.setRuntimeConfig({
              apiVersion: 1,
              supports: { geoLocation: { map: {} }, permissions: {} },
            });
            expect.assertions(4);

            try {
              geoLocation.map.showLocation(undefined);
            } catch (e) {
              expect(e).toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
            }
          });

          it(`showLocation calls with successful result. context: ${context}`, async () => {
            await framelessPlatform.initializeWithContext(context);
            framelessPlatform.setClientSupportedSDKVersion(minVersionForPermissionsAPIs);
            framelessPlatform.setRuntimeConfig({
              apiVersion: 1,
              supports: { geoLocation: { map: {} }, permissions: {} },
            });

            const promise = geoLocation.map.showLocation(defaultLocation);

            const message = framelessPlatform.findMessageByFunc('location.showLocation');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(1);
            expect(message.args[0]).toEqual(defaultLocation);

            const callbackId = message.id;
            framelessPlatform.respondToMessage({
              data: {
                id: callbackId,
                args: [undefined, true],
              },
            } as DOMMessageEvent);

            return expect(promise).resolves;
          });

          it(`showLocation calls with error context: ${context}`, async () => {
            await framelessPlatform.initializeWithContext(context);
            framelessPlatform.setRuntimeConfig({
              apiVersion: 1,
              supports: { geoLocation: { map: {} }, permissions: {} },
            });

            const promise = geoLocation.map.showLocation(defaultLocation);

            const message = framelessPlatform.findMessageByFunc('location.showLocation');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(1);
            expect(message.args[0]).toEqual(defaultLocation);

            const callbackId = message.id;
            framelessPlatform.respondToMessage({
              data: {
                id: callbackId,
                args: [{ errorCode: ErrorCode.PERMISSION_DENIED }],
              },
            } as DOMMessageEvent);

            await expect(promise).rejects.toEqual({ errorCode: ErrorCode.PERMISSION_DENIED });
          });
        } else {
          it(`should not allow showLocation calls from the wrong context. context: ${context}`, async () => {
            await framelessPlatform.initializeWithContext(context);
            expect(() => geoLocation.map.showLocation(defaultLocation)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });
    });
    describe('Testing geoLocation.map.chooseLocation API', () => {
      it('should not allow chooseLocation calls before initialization', () => {
        expect(() => geoLocation.map.chooseLocation()).toThrowError(new Error(errorLibraryNotInitialized));
      });

      Object.values(FrameContexts).forEach((context) => {
        if (allowedContexts.some((allowedContext) => allowedContext === context)) {
          it(`should throw error when geoLocation is not supported in runtime config. context: ${context}`, async () => {
            await framelessPlatform.initializeWithContext(context);
            framelessPlatform.setRuntimeConfig({ apiVersion: 1, supports: {} });
            expect.assertions(4);

            try {
              geoLocation.map.chooseLocation();
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`should throw error when geoLocation.map is not supported in runtime config. context: ${context}`, async () => {
            await framelessPlatform.initializeWithContext(context);
            framelessPlatform.setRuntimeConfig({ apiVersion: 1, supports: { geoLocation: {}, permissions: {} } });
            expect.assertions(4);

            try {
              geoLocation.map.chooseLocation();
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`map.chooseLocation should throw error when permissions is not supported in runtime config. context: ${context}`, async () => {
            await framelessPlatform.initializeWithContext(context);
            framelessPlatform.setRuntimeConfig({ apiVersion: 1, supports: { geoLocation: { map: {} } } });
            expect.assertions(4);
            try {
              geoLocation.map.chooseLocation();
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`chooseLocation call in default version of platform support fails. context: ${context}`, async () => {
            await framelessPlatform.initializeWithContext(FrameContexts.task);
            expect.assertions(4);

            try {
              geoLocation.map.showLocation(defaultLocation);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`chooseLocation calls with successful result. context: ${context}`, async () => {
            await framelessPlatform.initializeWithContext(FrameContexts.content);
            framelessPlatform.setClientSupportedSDKVersion(minVersionForPermissionsAPIs);
            framelessPlatform.setRuntimeConfig({
              apiVersion: 1,
              supports: { geoLocation: { map: {} }, permissions: {} },
            });

            const promise = geoLocation.map.chooseLocation();

            const message = framelessPlatform.findMessageByFunc('location.getLocation');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(1);
            expect(message.args[0]).toEqual(defaultLocationPropsForChooseLocation);

            const callbackId = message.id;
            framelessPlatform.respondToMessage({
              data: {
                id: callbackId,
                args: [undefined, defaultLocation],
              },
            } as DOMMessageEvent);

            await expect(promise).resolves.toBe(defaultLocation);
          });

          it(`chooseLocation calls with error context: ${context}`, async () => {
            await framelessPlatform.initializeWithContext(FrameContexts.content);
            framelessPlatform.setClientSupportedSDKVersion(minVersionForPermissionsAPIs);
            framelessPlatform.setRuntimeConfig({
              apiVersion: 1,
              supports: { geoLocation: { map: {} }, permissions: {} },
            });

            const promise = geoLocation.map.chooseLocation();

            const message = framelessPlatform.findMessageByFunc('location.getLocation');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(1);
            expect(message.args[0]).toEqual(defaultLocationPropsForChooseLocation);

            const callbackId = message.id;
            framelessPlatform.respondToMessage({
              data: {
                id: callbackId,
                args: [{ errorCode: ErrorCode.PERMISSION_DENIED }],
              },
            } as DOMMessageEvent);

            await expect(promise).rejects.toEqual({ errorCode: ErrorCode.PERMISSION_DENIED });
          });
        } else {
          it(`should not allow chooseLocation calls from the wrong context. context: ${context}`, async () => {
            await framelessPlatform.initializeWithContext(context);
            expect(() => geoLocation.map.chooseLocation()).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });
    });
  });
});
