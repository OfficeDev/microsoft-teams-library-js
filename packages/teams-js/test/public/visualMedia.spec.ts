import { errorLibraryNotInitialized, permissionsAPIsRequiredVersion } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { visualMedia } from '../../src/public';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { DevicePermission, ErrorCode } from '../../src/public/interfaces';
import { setUnitializedRuntime } from '../../src/public/runtime';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */
/**
 * Test cases for visualMedia APIs
 */
const originalDefaultPlatformVersion = '1.6.0';
const allowedContexts = [FrameContexts.content, FrameContexts.task];
const minVersionForPermissionsAPIs = permissionsAPIsRequiredVersion;
const defaultImageInputs: visualMedia.ImageProperties = {
  visualMediaCount: 10,
  source: visualMedia.Source.Gallery,
};
const defaultImageFiles: visualMedia.VisualMediaFile = {
  content: 'fake-content',
  format: visualMedia.FileFormat.Base64,
  size: 1,
  mimeType: 'jpg',
  preview: 'fake-preview',
};
let utils: Utils = new Utils();
beforeEach(() => {
  utils = new Utils();
  utils.mockWindow.parent = undefined;
  utils.messages = [];
  GlobalVars.isFramelessWindow = false;
});
afterEach(() => {
  app._uninitialize();
  jest.clearAllMocks();
  GlobalVars.isFramelessWindow = false;
});

describe('Testing isSupported', () => {
  it('should not be supported before initialization', () => {
    setUnitializedRuntime();
    expect(() => visualMedia.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
  });
});

describe('Testing HasPermisison API', () => {
  it('should not allow hasPermission calls before initialization', () => {
    return expect(() => visualMedia.hasPermission()).toThrowError(new Error(errorLibraryNotInitialized));
  });

  Object.values(FrameContexts).forEach((context) => {
    if (allowedContexts.some((allowedContext) => allowedContext === context)) {
      it(`should throw error when visualMedia is not supported in runtime config. context: ${context}`, async () => {
        await utils.initializeWithContext(context);
        utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
        expect.assertions(1);
        try {
          visualMedia.hasPermission();
        } catch (e) {
          expect(e).toEqual(errorNotSupportedOnPlatform);
        }
      });

      it(`visualMedia should throw error when permissions is not supported in runtime config. context: ${context}`, async () => {
        await utils.initializeWithContext(context);
        utils.setRuntimeConfig({ apiVersion: 2, supports: { visualMedia: {} } });
        expect.assertions(1);
        try {
          visualMedia.hasPermission();
        } catch (e) {
          expect(e).toEqual(errorNotSupportedOnPlatform);
        }
      });

      it('hasPermission call in default version of platform support fails', async () => {
        await utils.initializeWithContext(context);
        expect.assertions(1);
        utils.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
        try {
          visualMedia.hasPermission();
        } catch (e) {
          expect(e).toEqual(errorNotSupportedOnPlatform);
        }
      });

      it('hasPermission call with successful result', async () => {
        await utils.initializeWithContext(context);
        utils.setClientSupportedSDKVersion(minVersionForPermissionsAPIs);
        utils.setRuntimeConfig({ apiVersion: 1, supports: { visualMedia: {}, permissions: {} } });

        const promise = visualMedia.hasPermission();

        const message = utils.findMessageByFunc('permissions.has');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
        expect(message.args[0]).toEqual(DevicePermission.Media);

        const callbackId = message.id;
        utils.respondToFramelessMessage({
          data: {
            id: callbackId,
            args: [undefined, true],
          },
        } as DOMMessageEvent);

        await expect(promise).resolves.toBe(true);
      });

      it('HasPermission rejects promise with Error when error received from host', async () => {
        await utils.initializeWithContext(context);
        utils.setClientSupportedSDKVersion(minVersionForPermissionsAPIs);
        utils.setRuntimeConfig({ apiVersion: 1, supports: { visualMedia: {}, permissions: {} } });

        const promise = visualMedia.hasPermission();

        const message = utils.findMessageByFunc('permissions.has');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);

        const callbackId = message.id;
        utils.respondToFramelessMessage({
          data: {
            id: callbackId,
            args: [{ errorCode: ErrorCode.INTERNAL_ERROR }],
          },
        } as DOMMessageEvent);

        await expect(promise).rejects.toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
      });
    } else {
      it(`should not allow hasPermission calls from the wrong context. context: ${context}`, async () => {
        await utils.initializeWithContext(context);
        expect(() => visualMedia.hasPermission()).toThrowError(
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
        expect(() => visualMedia.requestPermission()).toThrowError(new Error(errorLibraryNotInitialized));
      });

      it('requestPermission call in default version of platform support fails', async () => {
        await utils.initializeWithContext(context);
        utils.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
        expect.assertions(1);
        try {
          visualMedia.requestPermission();
        } catch (e) {
          expect(e).toEqual(errorNotSupportedOnPlatform);
        }
      });

      it(`requestPermission should throw error when permissions is not supported in runtime config. context: ${context}`, async () => {
        await utils.initializeWithContext(context);
        utils.setRuntimeConfig({ apiVersion: 2, supports: { visualMedia: {} } });
        expect.assertions(1);
        try {
          visualMedia.requestPermission();
        } catch (e) {
          expect(e).toEqual(errorNotSupportedOnPlatform);
        }
      });

      it(`should throw error when visualMedia is not supported in runtime config. context: ${context}`, async () => {
        await utils.initializeWithContext(context);
        utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
        expect.assertions(1);
        try {
          visualMedia.hasPermission();
        } catch (e) {
          expect(e).toEqual(errorNotSupportedOnPlatform);
        }
      });

      it('requestPermission call with successful result', async () => {
        await utils.initializeWithContext(context);
        utils.setClientSupportedSDKVersion(minVersionForPermissionsAPIs);
        utils.setRuntimeConfig({ apiVersion: 2, supports: { visualMedia: {}, permissions: {} } });

        const promise = visualMedia.requestPermission();

        const message = utils.findMessageByFunc('permissions.request');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
        expect(message.args[0]).toEqual(DevicePermission.Media);

        const callbackId = message.id;
        utils.respondToFramelessMessage({
          data: {
            id: callbackId,
            args: [undefined, true],
          },
        } as DOMMessageEvent);

        await expect(promise).resolves.toBe(true);
      });

      it('requestPermission rejects promise with Error when error received from host', async () => {
        await utils.initializeWithContext(context);
        utils.setClientSupportedSDKVersion(minVersionForPermissionsAPIs);
        utils.setRuntimeConfig({ apiVersion: 2, supports: { visualMedia: {}, permissions: {} } });

        const promise = visualMedia.requestPermission();

        const message = utils.findMessageByFunc('permissions.request');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);

        const callbackId = message.id;
        utils.respondToFramelessMessage({
          data: {
            id: callbackId,
            args: [{ errorCode: ErrorCode.INTERNAL_ERROR }],
          },
        } as DOMMessageEvent);

        await expect(promise).rejects.toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
      });
    } else {
      it(`should not allow requestPermission calls from the wrong context. context: ${context}`, async () => {
        await utils.initializeWithContext(context);
        expect(() => visualMedia.requestPermission()).toThrowError(
          `This call is only allowed in following contexts: ${JSON.stringify(
            allowedContexts,
          )}. Current context: "${context}".`,
        );
      });
    }
  });
});

describe('Testing visualMedia.Image.captureImages subcapability', () => {
  it('should not be supported before initialization', () => {
    setUnitializedRuntime();
    expect(() => visualMedia.image.captureImages(defaultImageInputs)).toThrowError(
      new Error(errorLibraryNotInitialized),
    );
  });

  describe('Testing visualMedia.image.captureImages API', () => {
    it('should not allow captureImages calls before initialization', () => {
      expect(() => visualMedia.image.captureImages(defaultImageInputs)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it(`should throw error when captureImages is not supported in runtime config. context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(1);
          try {
            visualMedia.image.captureImages(defaultImageInputs);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`should throw error when visualMedia.image is not supported in runtime config. context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, supports: { visualMedia: {}, permissions: {} } });
          expect.assertions(1);
          try {
            visualMedia.image.captureImages(defaultImageInputs);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`captureImages should throw error when permissions is not supported in runtime config. context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, supports: { visualMedia: { Image: {} } } });
          expect.assertions(1);
          try {
            visualMedia.image.captureImages(defaultImageInputs);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`captureImages call in default version of platform support fails. context: ${context}`, async () => {
          await utils.initializeWithContext(FrameContexts.task);
          utils.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
          expect.assertions(1);
          try {
            visualMedia.image.captureImages(defaultImageInputs);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it('should not allow captureImages calls with invalid input.', async () => {
          await utils.initializeWithContext(FrameContexts.task);
          utils.setClientSupportedSDKVersion(minVersionForPermissionsAPIs);
          utils.setRuntimeConfig({
            apiVersion: 1,
            supports: { visualMedia: { image: {} }, permissions: {} },
          });
          const imageInputs: visualMedia.ImageProperties = {
            visualMediaCount: 11,
            source: visualMedia.Source.Camera,
          };
          try {
            visualMedia.image.captureImages(imageInputs);
          } catch (e) {
            expect(e).toEqual(Error('Must supply the valid image(s)'));
          }
        });

        it(`captureImages calls with successful result. context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setClientSupportedSDKVersion(minVersionForPermissionsAPIs);
          utils.setRuntimeConfig({
            apiVersion: 1,
            supports: { visualMedia: { image: {} }, permissions: {} },
          });

          const promise = visualMedia.image.captureImages(defaultImageInputs);

          const message = utils.findMessageByFunc('visualMedia.image.captureImages');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);
          expect(message.args[0]).toEqual(defaultImageInputs);

          const callbackId = message.id;
          utils.respondToFramelessMessage({
            data: {
              id: callbackId,
              args: [undefined, [defaultImageFiles]],
            },
          } as DOMMessageEvent);

          return expect(promise).resolves;
        });

        it(`captureImages calls with error context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({
            apiVersion: 1,
            supports: { visualMedia: { image: {} }, permissions: {} },
          });

          const promise = visualMedia.image.captureImages(defaultImageInputs);

          const message = utils.findMessageByFunc('visualMedia.image.captureImages');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);
          expect(message.args[0]).toEqual(defaultImageInputs);

          const callbackId = message.id;
          utils.respondToFramelessMessage({
            data: {
              id: callbackId,
              args: [{ errorCode: ErrorCode.PERMISSION_DENIED }],
            },
          } as DOMMessageEvent);

          await expect(promise).rejects.toEqual({ errorCode: ErrorCode.PERMISSION_DENIED });
        });
      } else {
        it(`should not allow captureImages calls from the wrong context. context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          expect(() => visualMedia.image.captureImages(defaultImageInputs)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });
});

describe('Testing visualMedia.Image.uploadImages subcapability', () => {
  it('should not be supported before initialization', () => {
    setUnitializedRuntime();
    expect(() => visualMedia.image.uploadImages(defaultImageInputs)).toThrowError(
      new Error(errorLibraryNotInitialized),
    );
  });

  describe('Testing visualMedia.image.uploadImages API', () => {
    it('should not allow captureImages calls before initialization', () => {
      expect(() => visualMedia.image.uploadImages(defaultImageInputs)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it(`should throw error when uploadImages is not supported in runtime config. context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(1);
          try {
            visualMedia.image.uploadImages(defaultImageInputs);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`should throw error when visualMedia.image is not supported in runtime config. context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, supports: { visualMedia: {}, permissions: {} } });
          expect.assertions(1);
          try {
            visualMedia.image.uploadImages(defaultImageInputs);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`uploadImages should throw error when permissions is not supported in runtime config. context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, supports: { visualMedia: { image: {} } } });
          expect.assertions(1);
          try {
            visualMedia.image.uploadImages(defaultImageInputs);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`uploadImages call in default version of platform support fails. context: ${context}`, async () => {
          await utils.initializeWithContext(FrameContexts.task);
          utils.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
          expect.assertions(1);
          try {
            visualMedia.image.uploadImages(defaultImageInputs);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it('should not allow uploadImages calls with invalid image counts.', async () => {
          await utils.initializeWithContext(FrameContexts.task);
          utils.setClientSupportedSDKVersion(minVersionForPermissionsAPIs);
          utils.setRuntimeConfig({
            apiVersion: 1,
            supports: { visualMedia: { image: {} }, permissions: {} },
          });
          const imageInputs: visualMedia.ImageProperties = {
            visualMediaCount: 11,
            source: visualMedia.Source.Gallery,
          };
          try {
            visualMedia.image.uploadImages(imageInputs);
          } catch (e) {
            expect(e).toEqual(Error('Must supply the valid image(s)'));
          }
        });

        it('should not allow uploadImages calls with invalid image source.', async () => {
          await utils.initializeWithContext(FrameContexts.task);
          utils.setClientSupportedSDKVersion(minVersionForPermissionsAPIs);
          utils.setRuntimeConfig({
            apiVersion: 1,
            supports: { visualMedia: { image: {} }, permissions: {} },
          });
          const imageInputs: visualMedia.ImageProperties = {
            visualMediaCount: 1,
            source: visualMedia.Source.Camera,
          };
          try {
            visualMedia.image.uploadImages(imageInputs);
          } catch (e) {
            expect(e).toEqual(Error('Must supply the valid image(s)'));
          }
        });

        it(`uploadImages calls with successful result. context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setClientSupportedSDKVersion(minVersionForPermissionsAPIs);
          utils.setRuntimeConfig({
            apiVersion: 1,
            supports: { visualMedia: { image: {} }, permissions: {} },
          });

          const promise = visualMedia.image.uploadImages(defaultImageInputs);

          const message = utils.findMessageByFunc('visualMedia.image.uploadImages');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);
          expect(message.args[0]).toEqual(defaultImageInputs);

          const callbackId = message.id;
          utils.respondToFramelessMessage({
            data: {
              id: callbackId,
              args: [undefined, [defaultImageFiles]],
            },
          } as DOMMessageEvent);

          return expect(promise).resolves;
        });

        it(`uploadImages calls with error context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({
            apiVersion: 1,
            supports: { visualMedia: { image: {} }, permissions: {} },
          });

          const promise = visualMedia.image.uploadImages(defaultImageInputs);

          const message = utils.findMessageByFunc('visualMedia.image.uploadImages');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);
          expect(message.args[0]).toEqual(defaultImageInputs);

          const callbackId = message.id;
          utils.respondToFramelessMessage({
            data: {
              id: callbackId,
              args: [{ errorCode: ErrorCode.PERMISSION_DENIED }],
            },
          } as DOMMessageEvent);

          await expect(promise).rejects.toEqual({ errorCode: ErrorCode.PERMISSION_DENIED });
        });
      } else {
        it(`should not allow uploadImages calls from the wrong context. context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          expect(() => visualMedia.image.uploadImages(defaultImageInputs)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });
});
