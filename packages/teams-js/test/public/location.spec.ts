import { locationAPIsRequiredVersion } from '../../src/internal/constants';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { ErrorCode, location } from '../../src/public/index';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { FramelessPostMocks } from '../framelessPostMocks';
import { Utils } from '../utils';

/**
 * Test cases for location APIs
 */
describe('location', () => {
  const framelessPlatform = new FramelessPostMocks();
  const framedPlatform = new Utils();
  const minVersionForLocationAPIs = locationAPIsRequiredVersion;
  const defaultLocationProps: location.LocationProps = { allowChooseLocation: false, showMap: false };
  const defaultLocationPropsForChooseLocation: location.LocationProps = {
    allowChooseLocation: true,
    showMap: true,
  };
  const defaultLocation: location.Location = { latitude: 17, longitude: 17, accuracy: -1, timestamp: 100 };
  const originalDefaultPlatformVersion = '1.6.0';

  beforeEach(() => {
    framelessPlatform.messages = [];

    // Set a mock window for testing
    app._initialize(framelessPlatform.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      framedPlatform.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      app._uninitialize();
    }
  });
  const allowedContexts = [FrameContexts.content, FrameContexts.task];

  describe('Testing getCurrentLocation API', () => {
    it('should not allow getCurrentLocation calls before initialization', () => {
      expect(() => location.getCurrentLocation()).toThrowError('The library has not yet been initialized');
    });

    Object.values(FrameContexts).forEach(context => {
      if (allowedContexts.some(allowedContext => allowedContext === context)) {
        it(`should throw error when getCurrentLocation is not supported in runtime config. context: ${context}`, async () => {
          await framelessPlatform.initializeWithContext(context);
          framelessPlatform.setRuntimeConfig({ apiVersion: 1, supports: {} });
          try {
            location.getCurrentLocation();
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });
        it(`getCurrentLocation calls with successful result. context: ${context}`, async () => {
          await framelessPlatform.initializeWithContext(context);
          framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
          framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
          const promise = location.getCurrentLocation();

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
          framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
          framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
          const promise = location.getCurrentLocation();

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
          expect(() => location.getCurrentLocation()).toThrowError(
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
      return expect(() => location.hasPermission()).toThrowError('The library has not yet been initialized');
    });

    Object.values(FrameContexts).forEach(context => {
      if (allowedContexts.some(allowedContext => allowedContext === context)) {
        it(`should throw error when location is not supported in runtime config. context: ${context}`, async () => {
          await framelessPlatform.initializeWithContext(context);
          framelessPlatform.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(4);
          try {
            location.hasPermission();
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it('hasPermission call in default version of platform support fails', async () => {
          await framelessPlatform.initializeWithContext(context);
          framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
          expect(() => location.hasPermission()).rejects.toEqual(errorNotSupportedOnPlatform);
        });

        it('hasPermission call with successful result', async () => {
          await framelessPlatform.initializeWithContext(context);
          framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
          const promise = location.hasPermission();

          const message = framelessPlatform.findMessageByFunc('permissions.has');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);

          const callbackId = message.id;
          framelessPlatform.respondToMessage({
            data: {
              id: callbackId,
              args: [undefined, true],
            },
          } as DOMMessageEvent);

          await expect(promise).resolves.toBe(true);
        });

        it('HasPermission call with error', async () => {
          await framelessPlatform.initializeWithContext(context);
          framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
          const promise = location.hasPermission();

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
          expect(() => location.hasPermission()).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('Testing RequestPermisison API', () => {
    Object.values(FrameContexts).forEach(context => {
      if (allowedContexts.some(allowedContext => allowedContext === context)) {
        it('should not allow requestPermission calls before initialization', () => {
          expect(() => location.requestPermission()).toThrowError('The library has not yet been initialized');
        });

        it('requestPermission call in default version of platform support fails', async () => {
          await framelessPlatform.initializeWithContext(context);
          framelessPlatform.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
          expect(() => location.requestPermission()).rejects.toEqual(errorNotSupportedOnPlatform);
        });

        it(`should throw error when location is not supported in runtime config. context: ${context}`, async () => {
          await framelessPlatform.initializeWithContext(context);
          framelessPlatform.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(4);
          try {
            location.hasPermission();
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it('requestPermission call with successful result', async () => {
          await framelessPlatform.initializeWithContext(context);
          framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
          const promise = location.requestPermission();

          const message = framelessPlatform.findMessageByFunc('permissions.request');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);

          const callbackId = message.id;
          framelessPlatform.respondToMessage({
            data: {
              id: callbackId,
              args: [undefined, true],
            },
          } as DOMMessageEvent);

          await expect(promise).resolves.toBe(true);
        });

        it('requestPermission call with error', async () => {
          await framelessPlatform.initializeWithContext(context);
          framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
          const promise = location.requestPermission();

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
          expect(() => location.requestPermission()).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('Testing location.map subcapability', () => {
    describe('Testing location.map.showLocation API', () => {
      it('should not allow showLocation calls before initialization', () => {
        expect(() => location.map.showLocation(defaultLocation)).toThrowError(
          'The library has not yet been initialized',
        );
      });

      Object.values(FrameContexts).forEach(context => {
        if (allowedContexts.some(allowedContext => allowedContext === context)) {
          it(`should throw error when showLocation is not supported in runtime config. context: ${context}`, async () => {
            await framelessPlatform.initializeWithContext(context);
            framelessPlatform.setRuntimeConfig({ apiVersion: 1, supports: {} });
            try {
              location.map.showLocation(defaultLocation);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });
          it(`showLocation call in default version of platform support fails. context: ${context}`, async () => {
            await framelessPlatform.initializeWithContext(FrameContexts.task);
            framelessPlatform.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
            expect(location.map.showLocation(defaultLocation)).rejects.toEqual(errorNotSupportedOnPlatform);
          });
          it(`should not allow showLocation calls without props. context: ${context}`, async () => {
            await framedPlatform.initializeWithContext(context);
            framedPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
            try {
              location.map.showLocation(undefined);
            } catch (e) {
              expect(e).toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
            }
          });
          it(`showLocation calls with successful result. context: ${context}`, async () => {
            await framelessPlatform.initializeWithContext(context);
            framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
            framelessPlatform.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
            const promise = location.map.showLocation(defaultLocation);

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
            framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
            framelessPlatform.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
            const promise = location.map.showLocation(defaultLocation);

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
            expect(() => location.map.showLocation(defaultLocation)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });
    });
    describe('Testing location.map.chooseLocation API', () => {
      it('should not allow chooseLocation calls before initialization', () => {
        expect(() => location.map.chooseLocation()).toThrowError('The library has not yet been initialized');
      });

      Object.values(FrameContexts).forEach(context => {
        if (allowedContexts.some(allowedContext => allowedContext === context)) {
          it(`should throw error when chooseLocation is not supported in runtime config. context: ${context}`, async () => {
            await framelessPlatform.initializeWithContext(context);
            framelessPlatform.setRuntimeConfig({ apiVersion: 1, supports: {} });
            try {
              location.map.chooseLocation();
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });
          it(`chooseLocation call in default version of platform support fails. context: ${context}`, async () => {
            await framelessPlatform.initializeWithContext(FrameContexts.task);
            framelessPlatform.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
            expect(location.map.chooseLocation()).rejects.toEqual(errorNotSupportedOnPlatform);
          });

          it(`chooseLocation calls with successful result. context: ${context}`, async () => {
            await framelessPlatform.initializeWithContext(FrameContexts.content);
            framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
            framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
            const promise = location.map.chooseLocation();

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
            framelessPlatform.setClientSupportedSDKVersion(minVersionForLocationAPIs);
            framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: { location: {} } });
            const promise = location.map.chooseLocation();

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
            expect(() => location.map.chooseLocation()).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });
    });
  });

  // it('Frameless - getLocation should throw error when not supported in the runtime config', async () => {
  //   await framelessPlatform.initializeWithContext(FrameContexts.task);
  //   framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: {} });
  //   const promise = location.map.chooseLocation(defaultLocationProps);
  //   await expect(promise).rejects.toEqual(errorNotSupportedOnPlatform);
  // });
  // it('Frameless - showLocation should throw error when location is not supported', async () => {
  //   await framelessPlatform.initializeWithContext(FrameContexts.task);
  //   framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: {} });
  //   const promise = location.map.showLocation(defaultLocation);
  //   await expect(promise).rejects.toEqual(errorNotSupportedOnPlatform);
  // });

  // it('Framed - getLocation should throw error when location is not supported in the runtime config', async () => {
  //   await framedPlatform.initializeWithContext(FrameContexts.task);
  //   framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: {} });
  //   const promise = location.getLocation(defaultLocationProps);
  //   await expect(promise).rejects.toEqual(errorNotSupportedOnPlatform);
  // });

  // it('Framed - showLocation should throw error when location is not supported', async () => {
  //   await framedPlatform.initializeWithContext(FrameContexts.task);
  //   framedPlatform.setRuntimeConfig({ apiVersion: 1, supports: {} });
  //   const promise = location.map.showLocation(defaultLocation);
  //   await expect(promise).rejects.toEqual(errorNotSupportedOnPlatform);
  // });
});
