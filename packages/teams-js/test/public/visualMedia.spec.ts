import { errorLibraryNotInitialized, permissionsAPIsRequiredVersion } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { visualMedia } from '../../src/public';
import * as app from '../../src/public/app/app';
import { errorInvalidCount, errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { DevicePermission, ErrorCode } from '../../src/public/interfaces';
import { setUnitializedRuntime } from '../../src/public/runtime';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */
/**
 * Test cases for visualMedia APIs
 */
describe('visualMedia', () => {
  const originalDefaultPlatformVersion = '1.6.0';
  const allowedContexts = [FrameContexts.content, FrameContexts.task];
  const minVersionForPermissionsAPIs = permissionsAPIsRequiredVersion;
  const mockCameraProps: visualMedia.CameraProps = {
    source: visualMedia.Source.Camera,
  };
  const mockGalleryProps: visualMedia.GalleryProps = {
    source: visualMedia.Source.Gallery,
  };
  const mockDefaultCaptureImageInputs: visualMedia.image.CameraImageProperties = {
    maxVisualMediaCount: 1,
    sourceProps: mockCameraProps,
  };
  const mockDefaultUploadImageInputs: visualMedia.image.GalleryImageProperties = {
    maxVisualMediaCount: 1,
    sourceProps: mockGalleryProps,
  };
  const mockDefaultImageFiles: visualMedia.VisualMediaFile = {
    content: 'fake_content',
    sizeInKB: 1,
    name: 'fileName',
    mimeType: 'jpg',
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
          utils.setRuntimeConfig({ apiVersion: 1, supports: { visualMedia: { image: {} }, permissions: {} } });

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
          utils.setRuntimeConfig({ apiVersion: 1, supports: { visualMedia: { image: {} }, permissions: {} } });

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
          utils.setRuntimeConfig({ apiVersion: 2, supports: { visualMedia: { image: {} }, permissions: {} } });

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
          utils.setRuntimeConfig({ apiVersion: 2, supports: { visualMedia: { image: {} }, permissions: {} } });

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

  describe('Testing visualMedia.image subcapability', () => {
    it('should not be supported before initialization', () => {
      setUnitializedRuntime();
      expect(() => visualMedia.image.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });

    describe('Testing visualMedia.image.captureImages API', () => {
      it('should not allow captureImages calls before initialization', () => {
        expect(() => visualMedia.image.captureImages(mockDefaultCaptureImageInputs)).rejects.toThrowError(
          new Error(errorLibraryNotInitialized),
        );
      });
      Object.values(FrameContexts).forEach((context) => {
        if (allowedContexts.some((allowedContext) => allowedContext === context)) {
          it(`should throw error when captureImages is not supported in runtime config. context: ${context}`, async () => {
            try {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
              expect.assertions(1);
              await visualMedia.image.captureImages(mockDefaultCaptureImageInputs);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });
          it(`should throw error when visualMedia.image is not supported in runtime config. context: ${context}`, async () => {
            try {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: { visualMedia: {}, permissions: {} } });
              expect.assertions(1);
              await visualMedia.image.captureImages(mockDefaultCaptureImageInputs);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });
          it(`captureImages should throw error when permissions is not supported in runtime config. context: ${context}`, async () => {
            try {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: { visualMedia: { image: {} } } });
              expect.assertions(1);
              await visualMedia.image.captureImages(mockDefaultCaptureImageInputs);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });
          it(`captureImages call in default version of platform support fails. context: ${context}`, async () => {
            try {
              await utils.initializeWithContext(FrameContexts.task);
              utils.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
              expect.assertions(1);
              await visualMedia.image.captureImages(mockDefaultCaptureImageInputs);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });
          it('should not allow captureImages calls with invalid image count of greater than 10.', async () => {
            try {
              await utils.initializeWithContext(FrameContexts.task);
              utils.setClientSupportedSDKVersion(minVersionForPermissionsAPIs);
              utils.setRuntimeConfig({
                apiVersion: 1,
                supports: { visualMedia: { image: {} }, permissions: {} },
              });
              const imageInputs: visualMedia.image.CameraImageProperties = {
                maxVisualMediaCount: 11,
                sourceProps: mockCameraProps,
              };
              await visualMedia.image.captureImages(imageInputs);
            } catch (e) {
              expect(e).toEqual(errorInvalidCount);
            }
          });
          it('should not allow captureImages calls with invalid image count of less than 1.', async () => {
            try {
              await utils.initializeWithContext(FrameContexts.task);
              utils.setClientSupportedSDKVersion(minVersionForPermissionsAPIs);
              utils.setRuntimeConfig({
                apiVersion: 1,
                supports: { visualMedia: { image: {} }, permissions: {} },
              });
              const imageInputs: visualMedia.image.CameraImageProperties = {
                maxVisualMediaCount: 0,
                sourceProps: mockCameraProps,
              };
              await visualMedia.image.captureImages(imageInputs);
            } catch (e) {
              expect(e).toEqual(errorInvalidCount);
            }
          });
          it(`captureImages calls with successful result. context: ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setClientSupportedSDKVersion(minVersionForPermissionsAPIs);
            utils.setRuntimeConfig({
              apiVersion: 1,
              supports: { visualMedia: { image: {} }, permissions: {} },
            });
            const promise = visualMedia.image.captureImages(mockDefaultCaptureImageInputs);
            const message = utils.findMessageByFunc('visualMedia.image.captureImages');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(1);
            expect(message.args[0]).toEqual(mockDefaultCaptureImageInputs);
            const callbackId = message.id;
            utils.respondToFramelessMessage({
              data: {
                id: callbackId,
                args: [undefined, [mockDefaultImageFiles]],
              },
            } as DOMMessageEvent);
            try {
              const response = await promise;
              expect(response.length).toEqual(1);
            } catch (e) {
              expect(e).toBeNull();
            }
          });
        } else {
          it(`should not allow captureImages calls from the wrong context. context: ${context}`, async () => {
            await utils.initializeWithContext(context);
            expect(() => visualMedia.image.captureImages(mockDefaultCaptureImageInputs)).rejects.toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });
    });

    describe('Testing visualMedia.image.retrieveImages API', () => {
      it('should not allow captureImages calls before initialization', () => {
        expect(() => visualMedia.image.retrieveImages(mockDefaultUploadImageInputs)).rejects.toThrowError(
          new Error(errorLibraryNotInitialized),
        );
      });
      Object.values(FrameContexts).forEach((context) => {
        if (allowedContexts.some((allowedContext) => allowedContext === context)) {
          it(`should throw error when retrieveImages is not supported in runtime config. context: ${context}`, async () => {
            try {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
              expect.assertions(1);
              await visualMedia.image.retrieveImages(mockDefaultUploadImageInputs);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });
          it(`should throw error when visualMedia.image is not supported in runtime config. context: ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: { visualMedia: {}, permissions: {} } });
            expect.assertions(1);
            try {
              await visualMedia.image.retrieveImages(mockDefaultUploadImageInputs);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });
          it(`retrieveImages should throw error when permissions is not supported in runtime config. context: ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: { visualMedia: { image: {} } } });
            expect.assertions(1);
            try {
              await visualMedia.image.retrieveImages(mockDefaultUploadImageInputs);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });
          it(`retrieveImages call in default version of platform support fails. context: ${context}`, async () => {
            await utils.initializeWithContext(FrameContexts.task);
            utils.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
            expect.assertions(1);
            try {
              await visualMedia.image.retrieveImages(mockDefaultUploadImageInputs);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });
          it('should not allow retrieveImages calls with invalid image counts of greater than 10.', async () => {
            await utils.initializeWithContext(FrameContexts.task);
            utils.setClientSupportedSDKVersion(minVersionForPermissionsAPIs);
            utils.setRuntimeConfig({
              apiVersion: 1,
              supports: { visualMedia: { image: {} }, permissions: {} },
            });
            const imageInputs: visualMedia.image.GalleryImageProperties = {
              maxVisualMediaCount: 11,
              sourceProps: mockGalleryProps,
            };
            try {
              await visualMedia.image.retrieveImages(imageInputs);
            } catch (e) {
              expect(e).toEqual(errorInvalidCount);
            }
          });
          it('should not allow retrieveImages calls with invalid image counts of less than 1.', async () => {
            await utils.initializeWithContext(FrameContexts.task);
            utils.setClientSupportedSDKVersion(minVersionForPermissionsAPIs);
            utils.setRuntimeConfig({
              apiVersion: 1,
              supports: { visualMedia: { image: {} }, permissions: {} },
            });
            const imageInputs: visualMedia.image.GalleryImageProperties = {
              maxVisualMediaCount: 0,
              sourceProps: mockGalleryProps,
            };
            try {
              await visualMedia.image.retrieveImages(imageInputs);
            } catch (e) {
              expect(e).toEqual(errorInvalidCount);
            }
          });
          it(`retrieveImages calls with successful result. context: ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setClientSupportedSDKVersion(minVersionForPermissionsAPIs);
            utils.setRuntimeConfig({
              apiVersion: 1,
              supports: { visualMedia: { image: {} }, permissions: {} },
            });
            const promise = visualMedia.image.retrieveImages(mockDefaultUploadImageInputs);
            const message = utils.findMessageByFunc('visualMedia.image.retrieveImages');
            expect(message).not.toBeNull();
            expect(message.args.length).toBe(1);
            expect(message.args[0]).toEqual(mockDefaultUploadImageInputs);
            const callbackId = message.id;
            utils.respondToFramelessMessage({
              data: {
                id: callbackId,
                args: [undefined, [mockDefaultImageFiles]],
              },
            } as DOMMessageEvent);
            try {
              const response = await promise;
              expect(response.length).toEqual(1);
            } catch (e) {
              expect(e).toBeNull();
            }
          });
        } else {
          it(`should not allow retrieveImages calls from the wrong context. context: ${context}`, async () => {
            await utils.initializeWithContext(context);
            expect(() => visualMedia.image.retrieveImages(mockDefaultUploadImageInputs)).rejects.toThrowError(
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
