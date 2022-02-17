/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-empty-function */
import { notDeepStrictEqual } from 'assert';

import * as communication from '../../src/internal/communication';
import { captureImageMobileSupportVersion, getMediaCallbackSupportVersion } from '../../src/internal/constants';
import { callHandler } from '../../src/internal/handlers';
import { DOMMessageEvent, MessageRequest } from '../../src/internal/interfaces';
import { app } from '../../src/public/app';
import { FrameContexts, HostClientType } from '../../src/public/constants';
import { ErrorCode, SdkError } from '../../src/public/interfaces';
import { media } from '../../src/public/media';
import { runtime } from '../../src/public/runtime';
import { FramelessPostMocks } from '../framelessPostMocks';
import { Utils } from '../utils';

/**
 * Test cases for media APIs
 */
describe('media', () => {
  const mobilePlatformMock = new FramelessPostMocks();
  const desktopPlatformMock = new Utils();
  const originalDefaultPlatformVersion = '1.6.0';
  const minVersionForCaptureImage = '1.7.0';
  const scanBarCodeAPISupportVersion = '1.9.0';
  const videoAndImageMediaAPISupportVersion = '2.0.2';
  const mediaAPISupportVersion = '1.8.0';
  const nonFullScreenVideoModeAPISupportVersion = '2.0.3';
  const imageOutputFormatsAPISupportVersion = '2.0.4';

  const emptyCallback = () => {};

  beforeEach(() => {
    mobilePlatformMock.messages = [];

    // Set a mock window for testing
    app._initialize(mobilePlatformMock.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      app._uninitialize();
    }
    jest.clearAllMocks();
  });

  describe('isSupported', () => {
    it('returns true if media is supported', () => {
      Object.defineProperty(runtime.supports, 'media', { value: {} });
      expect(media.isSupported()).toBeTruthy();
    });

    it('returns false if media is not supported', () => {
      Object.defineProperty(runtime.supports, 'media', { value: undefined });

      expect(media.isSupported()).toBeFalsy();
    });
  });

  describe('captureImage', () => {
    describe('v1', () => {
      it('should not allow captureImage calls before initialization', () => {
        expect(() => media.captureImage(emptyCallback)).toThrowError('The library has not yet been initialized');
      });

      it('captureImage call in default version of platform support fails', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
        media.captureImage((error: SdkError, f: media.File[]) => {
          expect(error).not.toBeNull();
          expect(error).toEqual({ errorCode: ErrorCode.OLD_PLATFORM });
        });
      });

      it('should not allow captureImage calls for authentication frame context', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.authentication);
        mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
        expect(() => media.captureImage(emptyCallback)).toThrowError(
          'This call is only allowed in following contexts: ["content","task"]. Current context: "authentication".',
        );
      });

      it('should not allow captureImage calls for remove frame context', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.remove);
        mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
        expect(() => media.captureImage(emptyCallback)).toThrowError(
          'This call is only allowed in following contexts: ["content","task"]. Current context: "remove".',
        );
      });

      it('should not allow captureImage calls for settings frame context', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.settings);
        mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
        expect(() => media.captureImage(emptyCallback)).toThrowError(
          'This call is only allowed in following contexts: ["content","task"]. Current context: "settings".',
        );
      });

      it('should not allow captureImage calls in desktop', async () => {
        await desktopPlatformMock.initializeWithContext(FrameContexts.content);
        media.captureImage((error: SdkError, f: media.File[]) => {
          expect(error).not.toBeNull();
          expect(error).toEqual({ errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM });
        });
      });

      it('captureImage call in task frameContext works', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
        media.captureImage(emptyCallback);
        const message = mobilePlatformMock.findMessageByFunc('captureImage');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(0);
      });

      it('captureImage call in content frameContext works', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
        media.captureImage(emptyCallback);
        const message = mobilePlatformMock.findMessageByFunc('captureImage');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(0);
      });

      it('captureImage calls with successful result', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
        media.captureImage((error: SdkError, files: media.File[]) => {
          expect(error).toBeFalsy();
          expect(files.length).toBe(1);
          const file = files[0];
          expect(file).not.toBeNull();
          expect(file.format).toBe(media.FileFormat.Base64);
          expect(file.mimeType).toBe('image/png');
          expect(file.content).not.toBeNull();
          expect(file.size).not.toBeNull();
          expect(typeof file.size === 'number').toBeTruthy();
        });

        const message = mobilePlatformMock.findMessageByFunc('captureImage');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(0);

        const callbackId = message.id;
        const filesArray = [
          {
            content: 'base64encodedImage',
            format: media.FileFormat.Base64,
            mimeType: 'image/png',
            size: 300,
          } as media.File,
        ];
        mobilePlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [undefined, filesArray],
          },
        } as DOMMessageEvent);
      });

      it('captureImage calls with error', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
        media.captureImage((error: SdkError, files: media.File[]) => {
          expect(files).toBeFalsy();
          expect(error).toEqual({ errorCode: ErrorCode.PERMISSION_DENIED });
        });

        const message = mobilePlatformMock.findMessageByFunc('captureImage');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(0);

        const callbackId = message.id;
        mobilePlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [{ errorCode: ErrorCode.PERMISSION_DENIED }],
          },
        } as DOMMessageEvent);
      });
    });

    describe('v2', () => {
      it('should not allow captureImage calls before initialization', () => {
        return expect(() => media.captureImage()).toThrowError('The library has not yet been initialized');
      });

      it('captureImage call in default version of platform support fails', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
        return expect(media.captureImage()).rejects.toEqual({ errorCode: ErrorCode.OLD_PLATFORM });
      });

      it('should not allow captureImage calls for authentication frame context', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.authentication);
        mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
        return expect(() => media.captureImage()).toThrowError(
          'This call is only allowed in following contexts: ["content","task"]. Current context: "authentication".',
        );
      });

      it('should not allow captureImage calls for remove frame context', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.remove);
        mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
        return expect(() => media.captureImage()).toThrowError(
          'This call is only allowed in following contexts: ["content","task"]. Current context: "remove".',
        );
      });

      it('should not allow captureImage calls for settings frame context', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.settings);
        mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
        return expect(() => media.captureImage()).toThrowError(
          'This call is only allowed in following contexts: ["content","task"]. Current context: "settings".',
        );
      });

      it('should not allow captureImage calls in desktop', async () => {
        await desktopPlatformMock.initializeWithContext(FrameContexts.content);
        return expect(media.captureImage()).rejects.toEqual({ errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM });
      });

      it('captureImage call in task frameContext works', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
        media.captureImage();
        const message = mobilePlatformMock.findMessageByFunc('captureImage');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(0);
      });

      it('captureImage call in content frameContext works', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
        media.captureImage();
        const message = mobilePlatformMock.findMessageByFunc('captureImage');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(0);
      });

      it('captureImage calls with successful result', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
        const promise = media.captureImage();

        const message = mobilePlatformMock.findMessageByFunc('captureImage');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(0);

        const callbackId = message.id;
        const filesArray = [
          {
            content: 'base64encodedImage',
            format: media.FileFormat.Base64,
            mimeType: 'image/png',
            size: 300,
          } as media.File,
        ];
        mobilePlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [undefined, filesArray],
          },
        } as DOMMessageEvent);

        const files = await promise;
        expect(files.length).toBe(1);
        const file = files[0];
        expect(file).not.toBeNull();
        expect(file.format).toBe(media.FileFormat.Base64);
        expect(file.mimeType).toBe('image/png');
        expect(file.content).not.toBeNull();
        expect(file.size).not.toBeNull();
        expect(typeof file.size === 'number').toBeTruthy();
      });

      it('captureImage calls with error', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
        const promise = media.captureImage();

        const message = mobilePlatformMock.findMessageByFunc('captureImage');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(0);

        const callbackId = message.id;
        mobilePlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [{ errorCode: ErrorCode.PERMISSION_DENIED }],
          },
        } as DOMMessageEvent);

        return expect(promise).rejects.toEqual({ errorCode: ErrorCode.PERMISSION_DENIED });
      });
    });
  });

  describe('selectMedia', () => {
    describe('v1', () => {
      it('should not allow selectMedia calls with null mediaInputs', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        media.selectMedia(null, (error: SdkError, attachments: media.Media[]) => {
          expect(error).not.toBeNull();
          expect(error).toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
        });
      });

      it('should not allow selectMedia calls with invalid mediaInputs', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const mediaInputs: media.MediaInputs = {
          mediaType: media.MediaType.Image,
          maxMediaCount: 11,
        };
        media.selectMedia(mediaInputs, (error: SdkError, attachments: media.Media[]) => {
          expect(error).not.toBeNull();
          expect(error).toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
        });
      });

      it('selectMedia call in default version of platform support fails', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
        const mediaInputs: media.MediaInputs = {
          mediaType: media.MediaType.Image,
          maxMediaCount: 10,
        };
        media.selectMedia(mediaInputs, (error: SdkError, attachments: media.Media[]) => {
          expect(error).not.toBeNull();
          expect(error).toEqual({ errorCode: ErrorCode.OLD_PLATFORM });
        });
      });

      it('selectMedia call for mediaType = 3 in mediaAPISupportVersion of platform support fails', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task, HostClientType.android);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const mediaInputs: media.MediaInputs = {
          mediaType: media.MediaType.VideoAndImage,
          maxMediaCount: 10,
        };
        media.selectMedia(mediaInputs, (error: SdkError, attachments: media.Media[]) => {
          expect(error).not.toBeNull();
          expect(error).toEqual({ errorCode: ErrorCode.OLD_PLATFORM });
        });
      });

      it('selectMedia call in task frameContext works', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const mediaInputs: media.MediaInputs = {
          mediaType: media.MediaType.Image,
          maxMediaCount: 10,
        };
        media.selectMedia(mediaInputs, emptyCallback);
        const message = mobilePlatformMock.findMessageByFunc('selectMedia');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
      });

      it('selectMedia call in content frameContext works', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const mediaInputs: media.MediaInputs = {
          mediaType: media.MediaType.Image,
          maxMediaCount: 10,
        };
        media.selectMedia(mediaInputs, emptyCallback);
        const message = mobilePlatformMock.findMessageByFunc('selectMedia');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
      });

      it('selectMedia calls with successful result for mediaType = 1', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const mediaInputs: media.MediaInputs = {
          mediaType: media.MediaType.Image,
          maxMediaCount: 10,
        };
        media.selectMedia(mediaInputs, (mediaError: SdkError, mediaAttachments: media.Media[]) => {
          expect(mediaError).toBeFalsy();
          expect(mediaAttachments.length).toBe(1);
          const mediaAttachment = mediaAttachments[0];
          expect(mediaAttachment).not.toBeNull();
          expect(mediaAttachment.format).toBe(media.FileFormat.ID);
          expect(mediaAttachment.mimeType).toBe('image/jpeg');
          expect(mediaAttachment.content).not.toBeNull();
          expect(mediaAttachment.size).not.toBeNull();
          expect(typeof mediaAttachment.size === 'number').toBeTruthy();
          expect(mediaAttachment.getMedia).toBeDefined();
        });
        const message = mobilePlatformMock.findMessageByFunc('selectMedia');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
        const callbackId = message.id;
        const filesArray = [
          {
            content: 'base64encodedImage',
            preview: null,
            format: media.FileFormat.ID,
            mimeType: 'image/jpeg',
            size: 300,
          } as media.Media,
        ];
        mobilePlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [undefined, filesArray],
          },
        } as DOMMessageEvent);
      });

      it('selectMedia calls with successful result for mediaType = 3', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content, HostClientType.ios);
        mobilePlatformMock.setClientSupportedSDKVersion(videoAndImageMediaAPISupportVersion);
        const mediaInputs: media.MediaInputs = {
          mediaType: media.MediaType.VideoAndImage,
          maxMediaCount: 10,
        };
        media.selectMedia(mediaInputs, (mediaError: SdkError, mediaAttachments: media.Media[]) => {
          expect(mediaError).toBeFalsy();
          expect(mediaAttachments.length).toBe(1);
          const mediaAttachment = mediaAttachments[0];
          expect(mediaAttachment).not.toBeNull();
          expect(mediaAttachment.format).toBe(media.FileFormat.ID);
          expect(mediaAttachment.mimeType).toBe('video/mp4');
          expect(mediaAttachment.content).not.toBeNull();
          expect(mediaAttachment.size).not.toBeNull();
          expect(typeof mediaAttachment.size === 'number').toBeTruthy();
          expect(mediaAttachment.getMedia).toBeDefined();
        });
        const message = mobilePlatformMock.findMessageByFunc('selectMedia');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
        const callbackId = message.id;
        const filesArray = [
          {
            content: 'base64encodedImage',
            preview: null,
            format: media.FileFormat.ID,
            mimeType: 'video/mp4',
            size: 300,
          } as media.Media,
        ];
        mobilePlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [undefined, filesArray],
          },
        } as DOMMessageEvent);
      });

      it('selectMedia calls with successful result for mediaType = 1 with imageOutputFormats', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content, HostClientType.android);
        mobilePlatformMock.setClientSupportedSDKVersion(imageOutputFormatsAPISupportVersion);
        const mediaInputs: media.MediaInputs = {
          mediaType: media.MediaType.Image,
          imageProps: { imageOutputFormats: [media.ImageOutputFormats.PDF] },
          maxMediaCount: 6,
        };

        media.selectMedia(mediaInputs, (mediaError: SdkError, mediaAttachments: media.Media[]) => {
          expect(mediaError).toBeFalsy();
          expect(mediaAttachments.length).toBe(1);
          const mediaAttachment = mediaAttachments[0];
          expect(mediaAttachment).not.toBeNull();
          expect(mediaAttachment.format).toBe(media.FileFormat.ID);
          expect(mediaAttachment.mimeType).toBe('application/pdf');
          expect(mediaAttachment.content).not.toBeNull();
          expect(mediaAttachment.size).not.toBeNull();
          expect(typeof mediaAttachment.size === 'number').toBeTruthy();
          expect(mediaAttachment.getMedia).toBeDefined();
        });

        const message = mobilePlatformMock.findMessageByFunc('selectMedia');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
        const callbackId = message.id;
        const filesArray = [
          {
            content: 'base64encodedImage',
            preview: null,
            format: media.FileFormat.ID,
            mimeType: 'application/pdf',
            size: 300,
          } as media.Media,
        ];
        mobilePlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [undefined, filesArray],
          },
        } as DOMMessageEvent);
      });

      it('selectMedia call for mediaType = 1 and imageOutputFormats in mediaAPISupportVersion of platform support fails', async () => {
        expect.assertions(4); // initializeWithContext has 3 assertions + 1 in this test = 4
        await mobilePlatformMock.initializeWithContext(FrameContexts.task, HostClientType.android);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const mediaInputs: media.MediaInputs = {
          mediaType: media.MediaType.Image,
          imageProps: { imageOutputFormats: [media.ImageOutputFormats.PDF] },
          maxMediaCount: 6,
        };
        try {
          await media.selectMedia(mediaInputs, emptyCallback);
        } catch (error) {
          expect(error).toEqual({ errorCode: ErrorCode.OLD_PLATFORM });
        }
      });

      it('selectMedia calls with error', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const mediaInputs: media.MediaInputs = {
          mediaType: media.MediaType.Image,
          maxMediaCount: 10,
        };
        media.selectMedia(mediaInputs, (mediaError: SdkError, mediaAttachments: media.Media[]) => {
          expect(mediaAttachments).toBeFalsy();
          expect(mediaError).toEqual({ errorCode: ErrorCode.SIZE_EXCEEDED });
        });
        const message = mobilePlatformMock.findMessageByFunc('selectMedia');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
        const callbackId = message.id;
        mobilePlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [{ errorCode: ErrorCode.SIZE_EXCEEDED }],
          },
        } as DOMMessageEvent);
      });

      it('should not invoke video callback for MediaControllerEvent when not registered', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content, HostClientType.ios);
        mobilePlatformMock.setClientSupportedSDKVersion(nonFullScreenVideoModeAPISupportVersion);
        let mediaError: SdkError;
        const mediaInputs: media.MediaInputs = {
          mediaType: media.MediaType.Video,
          maxMediaCount: 10,
          videoProps: {},
        };
        const callbackSpy = jest.fn((e: SdkError, attachments: media.Media[]) => {
          mediaError = e;
        });
        media.selectMedia(mediaInputs, callbackSpy);
        const message = mobilePlatformMock.findMessageByFunc('selectMedia');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
        const callbackId = message.id;
        mobilePlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [undefined, undefined, 2],
          },
        } as DOMMessageEvent);
        expect(mediaError).toBeFalsy();
        expect(callbackSpy).not.toHaveBeenCalled();
      });

      it('should invoke video callback for MediaControllerEvent when registered', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content, HostClientType.ios);
        mobilePlatformMock.setClientSupportedSDKVersion(nonFullScreenVideoModeAPISupportVersion);
        let mediaError: SdkError;

        const mediaInputs: media.MediaInputs = {
          mediaType: media.MediaType.Video,
          maxMediaCount: 10,
          videoProps: { videoController: new media.VideoController() },
        };
        const callbackSpy = jest.fn((e: SdkError, attachments: media.Media[]) => {
          mediaError = e;
        });
        media.selectMedia(mediaInputs, callbackSpy);
        const message = mobilePlatformMock.findMessageByFunc('selectMedia');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
        const callbackId = message.id;
        mobilePlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [undefined, undefined, 1],
          },
        } as DOMMessageEvent);
        expect(mediaError).toBeFalsy();
        expect(callbackSpy).not.toHaveBeenCalled();
      });
    });

    describe('v2', () => {
      it('should not allow selectMedia calls with null mediaInputs', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        return expect(media.selectMedia(null)).rejects.toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
      });

      it('should not allow selectMedia calls with invalid mediaInputs', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const mediaInputs: media.MediaInputs = {
          mediaType: media.MediaType.Image,
          maxMediaCount: 11,
        };
        return expect(media.selectMedia(mediaInputs)).rejects.toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
      });

      it('selectMedia call in default version of platform support fails', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
        const mediaInputs: media.MediaInputs = {
          mediaType: media.MediaType.Image,
          maxMediaCount: 10,
        };
        return expect(media.selectMedia(mediaInputs)).rejects.toEqual({ errorCode: ErrorCode.OLD_PLATFORM });
      });

      it('selectMedia call for mediaType = 3 in mediaAPISupportVersion of platform support fails', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task, HostClientType.android);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const mediaInputs: media.MediaInputs = {
          mediaType: media.MediaType.VideoAndImage,
          maxMediaCount: 10,
        };
        return expect(media.selectMedia(mediaInputs)).rejects.toEqual({ errorCode: ErrorCode.OLD_PLATFORM });
      });

      it('selectMedia call in task frameContext works', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const mediaInputs: media.MediaInputs = {
          mediaType: media.MediaType.Image,
          maxMediaCount: 10,
        };
        media.selectMedia(mediaInputs);
        const message = mobilePlatformMock.findMessageByFunc('selectMedia');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
      });

      it('selectMedia call in content frameContext works', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const mediaInputs: media.MediaInputs = {
          mediaType: media.MediaType.Image,
          maxMediaCount: 10,
        };
        media.selectMedia(mediaInputs);
        const message = mobilePlatformMock.findMessageByFunc('selectMedia');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
      });

      it('selectMedia calls with successful result for mediaType = 1', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const mediaInputs: media.MediaInputs = {
          mediaType: media.MediaType.Image,
          maxMediaCount: 10,
        };
        const promise = media.selectMedia(mediaInputs);

        const message = mobilePlatformMock.findMessageByFunc('selectMedia');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);

        const callbackId = message.id;
        const filesArray = [
          {
            content: 'base64encodedImage',
            preview: null,
            format: media.FileFormat.ID,
            mimeType: 'image/jpeg',
            size: 300,
          } as media.Media,
        ];
        mobilePlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [undefined, filesArray],
          },
        } as DOMMessageEvent);

        const mediaAttachments = await promise;
        expect(mediaAttachments.length).toBe(1);
        const mediaAttachment = mediaAttachments[0];
        expect(mediaAttachment).not.toBeNull();
        expect(mediaAttachment.format).toBe(media.FileFormat.ID);
        expect(mediaAttachment.mimeType).toBe('image/jpeg');
        expect(mediaAttachment.content).not.toBeNull();
        expect(mediaAttachment.size).not.toBeNull();
        expect(typeof mediaAttachment.size === 'number').toBeTruthy();
        expect(mediaAttachment.getMedia).toBeDefined();
      });

      it('selectMedia calls with successful result for mediaType = 3', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content, HostClientType.ios);
        mobilePlatformMock.setClientSupportedSDKVersion(videoAndImageMediaAPISupportVersion);
        const mediaInputs: media.MediaInputs = {
          mediaType: media.MediaType.VideoAndImage,
          maxMediaCount: 10,
        };
        const promise = media.selectMedia(mediaInputs);

        const message = mobilePlatformMock.findMessageByFunc('selectMedia');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);

        const callbackId = message.id;
        const filesArray = [
          {
            content: 'base64encodedImage',
            preview: null,
            format: media.FileFormat.ID,
            mimeType: 'video/mp4',
            size: 300,
          } as media.Media,
        ];
        mobilePlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [undefined, filesArray],
          },
        } as DOMMessageEvent);

        const mediaAttachments = await promise;
        expect(mediaAttachments.length).toBe(1);
        const mediaAttachment = mediaAttachments[0];
        expect(mediaAttachment).not.toBeNull();
        expect(mediaAttachment.format).toBe(media.FileFormat.ID);
        expect(mediaAttachment.mimeType).toBe('video/mp4');
        expect(mediaAttachment.content).not.toBeNull();
        expect(mediaAttachment.size).not.toBeNull();
        expect(typeof mediaAttachment.size === 'number').toBeTruthy();
        expect(mediaAttachment.getMedia).toBeDefined();
      });

      it('selectMedia calls with error', async () => {
        expect.assertions(6); // initializeWithContext has 3 assertions + 3 local assertions
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const mediaInputs: media.MediaInputs = {
          mediaType: media.MediaType.Image,
          maxMediaCount: 10,
        };
        const promise = media.selectMedia(mediaInputs);

        const message = mobilePlatformMock.findMessageByFunc('selectMedia');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);

        const callbackId = message.id;
        mobilePlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [{ errorCode: ErrorCode.SIZE_EXCEEDED }],
          },
        } as DOMMessageEvent);

        await expect(promise).rejects.toEqual({ errorCode: ErrorCode.SIZE_EXCEEDED });
      });
    });
  });

  describe('videoController', () => {
    describe('v1', () => {
      it('videoController notifyEventToHost is handled successfully', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task, HostClientType.android);
        mobilePlatformMock.setClientSupportedSDKVersion(nonFullScreenVideoModeAPISupportVersion);

        const videoController = new media.VideoController();
        const sendAndHandleSdkErrorSpy = jest.spyOn(communication, 'sendAndHandleSdkError');
        videoController.stop(emptyCallback);

        const message = mobilePlatformMock.findMessageByFunc('media.controller');

        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
        const callbackId = message.id;

        mobilePlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [undefined],
          },
        } as DOMMessageEvent);

        expect(sendAndHandleSdkErrorSpy).toHaveBeenCalled();
      });

      it('videoController stop function returns SdkError to callback when parent rejects message', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content, HostClientType.android);
        mobilePlatformMock.setClientSupportedSDKVersion(nonFullScreenVideoModeAPISupportVersion);

        const videoController = new media.VideoController();
        const sendAndHandleSdkErrorSpy = jest.spyOn(communication, 'sendAndHandleSdkError');
        const err = {
          errorCode: ErrorCode.INTERNAL_ERROR,
        };

        videoController.stop(emptyCallback);

        const message = mobilePlatformMock.findMessageByFunc('media.controller');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
        const callbackId = message.id;

        mobilePlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [err],
          },
        } as DOMMessageEvent);

        expect(sendAndHandleSdkErrorSpy).toHaveBeenCalled();
      });

      it('videoController notifyEventToHost should fail in default version of platform and should exit early', async () => {
        expect.assertions(5); // initializeWithContext has 3 assertions + 2 in this test = 5

        await mobilePlatformMock.initializeWithContext(FrameContexts.content, HostClientType.android);
        mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);

        const videoController = new media.VideoController();
        const sendMessageToParentSpy = jest.spyOn(communication, 'sendMessageToParent');

        try {
          await videoController.stop(e => {
            return e;
          });
        } catch (err) {
          expect(err).toEqual({ errorCode: ErrorCode.OLD_PLATFORM });
        }

        expect(sendMessageToParentSpy).not.toHaveBeenCalled();
      });

      it('videoController notifyEventToApp should return if no callback is provided', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content, HostClientType.android);
        mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);

        const videoController = new media.VideoController();
        const notifyEventToApp = jest.spyOn(videoController, 'notifyEventToApp');

        try {
          await videoController.stop(e => {
            return e;
          });
        } catch (err) {
          expect(err).toEqual({ errorCode: ErrorCode.OLD_PLATFORM });
        }

        expect(notifyEventToApp).not.toHaveBeenCalled();
      });

      it('videoController notifyEventToApp should call the callback if callback is provided and mediaType is 1', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content, HostClientType.android);
        mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);

        const videoControllerCallback: media.VideoControllerCallback = { onRecordingStarted: jest.fn() };
        const videoController = new media.VideoController(videoControllerCallback);

        const notifyEventToAppSpy = jest.spyOn(videoController, 'notifyEventToApp');
        videoController.notifyEventToApp(1);

        expect(notifyEventToAppSpy).toHaveBeenCalledWith(1);
        expect(videoControllerCallback.onRecordingStarted).toHaveBeenCalled();
      });
    });

    describe('v2', () => {
      it('videoController notifyEventToHost is handled successfully', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content, HostClientType.android);
        mobilePlatformMock.setClientSupportedSDKVersion(nonFullScreenVideoModeAPISupportVersion);

        const videoController = new media.VideoController();
        const promise = videoController.stop();
        const message = mobilePlatformMock.findMessageByFunc('media.controller');

        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);

        const callbackId = message.id;

        mobilePlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [undefined],
          },
        } as DOMMessageEvent);
        await expect(promise).resolves.not.toThrowError();
      });

      it('videoController notifyEventToHost should fail in default version of platform and exit early', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content, HostClientType.android);
        mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);

        const videoController = new media.VideoController();
        const sendAndHandleSdkErrorSpy = jest.spyOn(communication, 'sendAndHandleSdkError');
        const promise = videoController.stop();

        await expect(promise).rejects.toEqual({ errorCode: ErrorCode.OLD_PLATFORM });

        expect(sendAndHandleSdkErrorSpy).not.toHaveBeenCalled();
      });

      it('videoController notifyEventToHost is not handled successfully and returns error', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content, HostClientType.android);
        mobilePlatformMock.setClientSupportedSDKVersion(nonFullScreenVideoModeAPISupportVersion);

        const videoController = new media.VideoController();
        const promise = videoController.stop();
        const err = { errorCode: ErrorCode.INTERNAL_ERROR };
        const sendAndHandleSdkErrorSpy = jest.spyOn(communication, 'sendAndHandleSdkError');
        const message = mobilePlatformMock.findMessageByFunc('media.controller');

        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);

        const callbackId = message.id;

        mobilePlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [err],
          },
        } as DOMMessageEvent);

        expect(sendAndHandleSdkErrorSpy).toHaveBeenCalled();
        return expect(promise).rejects.toEqual(err);
      });
    });
  });

  describe('getMedia', () => {
    describe('v1', () => {
      it('should not allow getMedia calls with invalid media mimetype', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const mediaOutput: media.Media = new media.Media();
        mediaOutput.content = '1234567';
        mediaOutput.mimeType = null;
        mediaOutput.format = media.FileFormat.ID;
        mediaOutput.getMedia((error: SdkError, blob: Blob) => {
          expect(error).not.toBeNull();
          expect(error).toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
        });
      });

      it('should not allow getMedia calls with invalid media content', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const mediaOutput: media.Media = new media.Media();
        mediaOutput.content = null;
        mediaOutput.mimeType = 'image/jpeg';
        mediaOutput.format = media.FileFormat.ID;
        mediaOutput.getMedia((error: SdkError, blob: Blob) => {
          expect(error).not.toBeNull();
          expect(error).toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
        });
      });

      it('should not allow getMedia calls with invalid media file format', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const mediaOutput: media.Media = new media.Media();
        mediaOutput.content = '1234567';
        mediaOutput.mimeType = 'image/jpeg';
        mediaOutput.format = media.FileFormat.Base64;
        mediaOutput.getMedia((error: SdkError, blob: Blob) => {
          expect(error).not.toBeNull();
          expect(error).toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
        });
      });

      it('getMedia call in default version of platform support fails', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
        const mediaOutput: media.Media = new media.Media();
        mediaOutput.content = '1234567';
        mediaOutput.mimeType = 'image/jpeg';
        mediaOutput.format = media.FileFormat.ID;
        mediaOutput.getMedia((error: SdkError, blob: Blob) => {
          expect(error).not.toBeNull();
          expect(error).toEqual({ errorCode: ErrorCode.OLD_PLATFORM });
        });
      });

      it('getMedia call in task frameContext works', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const mediaOutput: media.Media = new media.Media();
        mediaOutput.content = '1234567';
        mediaOutput.mimeType = 'image/jpeg';
        mediaOutput.format = media.FileFormat.ID;
        mediaOutput.getMedia(emptyCallback);
        const message = mobilePlatformMock.findMessageByFunc('getMedia');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(2);
      });

      async function getStringContainedInBlob(blob: Blob): Promise<string> {
        let resolverMethod: (value: string | PromiseLike<string>) => void;
        let rejectionMethod: (reason?: any) => void;
        const blobReadingPromise: Promise<string> = new Promise<string>((resolve, reject) => {
          resolverMethod = resolve;
          rejectionMethod = reject;
        });

        const blobReader = new FileReader();
        blobReader.onloadend = (): void => {
          resolverMethod(String.fromCharCode(...new Uint8Array(blobReader.result as ArrayBuffer)));
        };
        blobReader.onerror = (): void => {
          rejectionMethod(blobReader.error);
        };

        blobReader.readAsArrayBuffer(blob);

        return blobReadingPromise;
      }

      it('getMedia calls with successful result via the handler', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        //mediaAPISupport version(1.8.0) is less than the MediaCallbackSupportVersion(2.0.0)
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const mediaOutput: media.Media = new media.Media();
        mediaOutput.content = '1234567';
        mediaOutput.mimeType = 'image/jpeg';
        mediaOutput.format = media.FileFormat.ID;
        mediaOutput.getMedia((error: SdkError, blob: Blob) =>
          getStringContainedInBlob(blob).then(res => {
            return expect(res).toEqual(stringMediaData);
          }),
        );

        const message = mobilePlatformMock.findMessageByFunc('getMedia');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(2);

        const stringMediaData = 'the media data';
        const firstMediaResult: media.MediaResult = {
          error: undefined,
          mediaChunk: {
            chunk: btoa(stringMediaData),
            chunkSequence: 1,
          },
        };
        const secondMediaResult: media.MediaResult = {
          error: undefined,
          mediaChunk: {
            chunk: undefined,
            chunkSequence: 0,
          },
        };

        const handlerRegistrationMessage = mobilePlatformMock.findMessageByFunc('registerHandler');
        const getMediaHandlerName = handlerRegistrationMessage.args[0];

        const mediaResults = Array.of(firstMediaResult, secondMediaResult);

        for (let i = 0; i < mediaResults.length; ++i) {
          callHandler(getMediaHandlerName, [JSON.stringify(mediaResults[i])]);
        }
      });

      it('getMedia calls with error when data is null via the handler', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const mediaOutput: media.Media = new media.Media();
        mediaOutput.content = '12345678';
        mediaOutput.mimeType = 'image/jpeg';
        mediaOutput.format = media.FileFormat.ID;
        mediaOutput.getMedia((error: SdkError, blob: Blob) => {
          expect(error).toEqual({ errorCode: ErrorCode.INTERNAL_ERROR, message: 'data received is null' });
          expect(blob).toBeFalsy();
        });

        const handlerRegistrationMessage = mobilePlatformMock.findMessageByFunc('registerHandler');
        const getMediaHandlerName = handlerRegistrationMessage.args[0];

        callHandler(getMediaHandlerName, [JSON.stringify({})]);
      });

      it('getMedia via handler call returns error when mediaResult contains SDK error', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        //mediaAPISupport version(1.8.0) is less than the MediaCallbackSupportVersion(2.0.0)
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const mediaOutput: media.Media = new media.Media();
        mediaOutput.content = '1234567';
        mediaOutput.mimeType = 'image/jpeg';
        mediaOutput.format = media.FileFormat.ID;
        mediaOutput.getMedia((error: SdkError, blob: Blob) =>
          expect(error).toEqual({ errorCode: ErrorCode.USER_ABORT }),
        );

        const message = mobilePlatformMock.findMessageByFunc('getMedia');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(2);

        const stringMediaData = 'the media data';
        const firstMediaResult: media.MediaResult = {
          error: { errorCode: ErrorCode.USER_ABORT },
          mediaChunk: {
            chunk: btoa(stringMediaData),
            chunkSequence: 1,
          },
        };
        const secondMediaResult: media.MediaResult = {
          error: undefined,
          mediaChunk: {
            chunk: undefined,
            chunkSequence: 0,
          },
        };

        const handlerRegistrationMessage = mobilePlatformMock.findMessageByFunc('registerHandler');
        const getMediaHandlerName = handlerRegistrationMessage.args[0];

        const mediaResults = Array.of(firstMediaResult, secondMediaResult);

        for (let i = 0; i < mediaResults.length; ++i) {
          callHandler(getMediaHandlerName, [JSON.stringify(mediaResults[i])]);
        }
      });

      it('getMedia calls with successful result via the callback', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        // here we give the same version as the supported version
        mobilePlatformMock.setClientSupportedSDKVersion(getMediaCallbackSupportVersion);
        const mediaOutput: media.Media = new media.Media();
        mediaOutput.content = '1234567';
        mediaOutput.mimeType = 'image/jpeg';
        mediaOutput.format = media.FileFormat.ID;
        mediaOutput.getMedia((error: SdkError, blob: Blob) => {
          getStringContainedInBlob(blob).then(res => {
            return expect(res).toEqual(stringMediaData);
          });
        });

        const message = mobilePlatformMock.findMessageByFunc('getMedia');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1); // args will be of length 1 for the supported version

        const stringMediaData = 'the media data';
        const firstMediaResult: media.MediaResult = {
          error: undefined,
          mediaChunk: {
            chunk: btoa(stringMediaData),
            chunkSequence: 1,
          },
        };
        const secondMediaResult: media.MediaResult = {
          error: undefined,
          mediaChunk: {
            chunk: undefined,
            chunkSequence: 0,
          },
        };

        const mediaResults = Array.of(firstMediaResult, secondMediaResult);

        for (let i = 0; i < mediaResults.length; ++i) {
          mobilePlatformMock.respondToMessage({
            data: {
              id: message.id,
              args: [mediaResults[i]],
              isPartialResponse: i < mediaResults.length - 1,
            },
          } as DOMMessageEvent);
        }
      });

      it('getMedia returns error when called via the callback', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        // here we give the same version as the supported version
        mobilePlatformMock.setClientSupportedSDKVersion(getMediaCallbackSupportVersion);
        const mediaOutput: media.Media = new media.Media();
        mediaOutput.content = '1234567';
        mediaOutput.mimeType = 'image/jpeg';
        mediaOutput.format = media.FileFormat.ID;
        mediaOutput.getMedia((error: SdkError, blob: Blob) => {
          expect(error).toEqual({ errorCode: ErrorCode.USER_ABORT });
        });

        const message = mobilePlatformMock.findMessageByFunc('getMedia');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1); // args will be of length 1 for the supported version

        const stringMediaData = 'the media data';
        const firstMediaResult: media.MediaResult = {
          error: { errorCode: ErrorCode.USER_ABORT },
          mediaChunk: {
            chunk: btoa(stringMediaData),
            chunkSequence: 1,
          },
        };
        const secondMediaResult: media.MediaResult = {
          error: undefined,
          mediaChunk: {
            chunk: undefined,
            chunkSequence: 0,
          },
        };

        const mediaResults = Array.of(firstMediaResult, secondMediaResult);

        for (let i = 0; i < mediaResults.length; ++i) {
          mobilePlatformMock.respondToMessage({
            data: {
              id: message.id,
              args: [mediaResults[i]],
              isPartialResponse: i < mediaResults.length - 1,
            },
          } as DOMMessageEvent);
        }
      });

      it('getMedia calls with error with MediaCallback when data is null', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        mobilePlatformMock.setClientSupportedSDKVersion(getMediaCallbackSupportVersion);
        const mediaOutput: media.Media = new media.Media();
        mediaOutput.content = '12345678';
        mediaOutput.mimeType = 'image/jpeg';
        mediaOutput.format = media.FileFormat.ID;
        mediaOutput.getMedia((error: SdkError, blob: Blob) => {
          expect(error).toEqual({ errorCode: ErrorCode.INTERNAL_ERROR, message: 'data received is null' });
          expect(blob).toBeFalsy();
        });

        const message = mobilePlatformMock.findMessageByFunc('getMedia');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);

        const callbackId = message.id;
        mobilePlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [undefined, undefined],
          },
        } as DOMMessageEvent);
      });

      it('getMedia calls with error with Handler', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);

        const mediaOutput: media.Media = new media.Media();
        mediaOutput.content = '1234567';
        mediaOutput.mimeType = 'image/jpeg';
        mediaOutput.format = media.FileFormat.ID;
        mediaOutput.getMedia((error: SdkError, blob: Blob) => {
          expect(blob).toBeFalsy();
          expect(error).toEqual({
            errorCode: ErrorCode.INTERNAL_ERROR,
            message: 'Error parsing the response: undefined',
          });
        });

        const message = mobilePlatformMock.findMessageByFunc('getMedia');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(2);

        const handlerRegistrationMessage = mobilePlatformMock.findMessageByFunc('registerHandler');
        const getMediaHandlerName = handlerRegistrationMessage.args[0];
        callHandler(getMediaHandlerName, [JSON.stringify(undefined)]);
      });
    });

    describe('v2', () => {
      it('should not allow getMedia calls with invalid media mimetype', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const mediaOutput: media.Media = new media.Media();
        mediaOutput.content = '1234567';
        mediaOutput.mimeType = null;
        mediaOutput.format = media.FileFormat.ID;
        return expect(mediaOutput.getMedia()).rejects.toEqual({
          errorCode: ErrorCode.INVALID_ARGUMENTS,
        });
      });

      it('should not allow getMedia calls with invalid media content', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const mediaOutput: media.Media = new media.Media();
        mediaOutput.content = null;
        mediaOutput.mimeType = 'image/jpeg';
        mediaOutput.format = media.FileFormat.ID;
        return expect(mediaOutput.getMedia()).rejects.toEqual({
          errorCode: ErrorCode.INVALID_ARGUMENTS,
        });
      });

      it('should not allow getMedia calls with invalid media file format', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const mediaOutput: media.Media = new media.Media();
        mediaOutput.content = '1234567';
        mediaOutput.mimeType = 'image/jpeg';
        mediaOutput.format = media.FileFormat.Base64;
        return expect(mediaOutput.getMedia()).rejects.toEqual({
          errorCode: ErrorCode.INVALID_ARGUMENTS,
        });
      });

      it('getMedia call in default version of platform support fails', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
        const mediaOutput: media.Media = new media.Media();
        mediaOutput.content = '1234567';
        mediaOutput.mimeType = 'image/jpeg';
        mediaOutput.format = media.FileFormat.ID;
        return expect(mediaOutput.getMedia()).rejects.toEqual({
          errorCode: ErrorCode.OLD_PLATFORM,
        });
      });

      it('getMedia call in task frameContext works', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const mediaOutput: media.Media = new media.Media();
        mediaOutput.content = '1234567';
        mediaOutput.mimeType = 'image/jpeg';
        mediaOutput.format = media.FileFormat.ID;
        mediaOutput.getMedia();
        const message = mobilePlatformMock.findMessageByFunc('getMedia');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(2);
      });

      async function getStringContainedInBlob(blob: Blob): Promise<string> {
        let resolverMethod: (value: string | PromiseLike<string>) => void;
        let rejectionMethod: (reason?: any) => void;
        const blobReadingPromise: Promise<string> = new Promise<string>((resolve, reject) => {
          resolverMethod = resolve;
          rejectionMethod = reject;
        });

        const blobReader = new FileReader();
        blobReader.onloadend = (): void => {
          resolverMethod(String.fromCharCode(...new Uint8Array(blobReader.result as ArrayBuffer)));
        };
        blobReader.onerror = (): void => {
          rejectionMethod(blobReader.error);
        };

        blobReader.readAsArrayBuffer(blob);

        return blobReadingPromise;
      }

      async function validateGetMediaMessageAndResults(
        supportedSDKVersion: string,
        expectedNumberOfParametersInGetMediaMessage: number,
        respondToMessages: (message: MessageRequest, mediaResults: media.MediaResult[]) => void,
      ): Promise<void> {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        mobilePlatformMock.setClientSupportedSDKVersion(supportedSDKVersion);

        const stringMediaData = 'the media data';
        const firstMediaResult: media.MediaResult = {
          error: undefined,
          mediaChunk: {
            chunk: btoa(stringMediaData),
            chunkSequence: 1,
          },
        };
        const secondMediaResult: media.MediaResult = {
          error: undefined,
          mediaChunk: {
            chunk: undefined,
            chunkSequence: 0,
          },
        };

        const mediaOutput: media.Media = new media.Media();
        mediaOutput.content = '1234567';
        mediaOutput.mimeType = 'image/jpeg';
        mediaOutput.format = media.FileFormat.ID;
        const getMediaPromise: Promise<Blob> = mediaOutput.getMedia();

        const message = mobilePlatformMock.findMessageByFunc('getMedia');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(expectedNumberOfParametersInGetMediaMessage);

        respondToMessages(message, [firstMediaResult, secondMediaResult]);

        const blobContents: string = await getStringContainedInBlob(await getMediaPromise);
        expect(blobContents).toEqual(stringMediaData);
      }

      async function inValidateGetMediaMessageAndResults(
        supportedSDKVersion: string,
        expectedNumberOfParametersInGetMediaMessage: number,
        respondToMessages: (message: MessageRequest, mediaResults: media.MediaResult[]) => void,
      ): Promise<void> {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        mobilePlatformMock.setClientSupportedSDKVersion(supportedSDKVersion);

        const stringMediaData = 'the media data';
        const firstMediaResult: media.MediaResult = {
          error: { errorCode: ErrorCode.USER_ABORT },
          mediaChunk: {
            chunk: btoa(stringMediaData),
            chunkSequence: 1,
          },
        };
        const secondMediaResult: media.MediaResult = {
          error: undefined,
          mediaChunk: {
            chunk: undefined,
            chunkSequence: 0,
          },
        };

        const mediaOutput: media.Media = new media.Media();
        mediaOutput.content = '1234567';
        mediaOutput.mimeType = 'image/jpeg';
        mediaOutput.format = media.FileFormat.ID;
        const getMediaPromise: Promise<Blob> = mediaOutput.getMedia();

        const message = mobilePlatformMock.findMessageByFunc('getMedia');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(expectedNumberOfParametersInGetMediaMessage);

        respondToMessages(message, [firstMediaResult, secondMediaResult]);

        return expect(getMediaPromise).rejects.toEqual({
          errorCode: ErrorCode.USER_ABORT,
        });
      }

      it('getMedia using callback method returns successful result with expected data', async () => {
        validateGetMediaMessageAndResults(
          getMediaCallbackSupportVersion,
          1,
          (message: MessageRequest, mediaResults: media.MediaResult[]) => {
            const callbackId = message.id;

            for (let i = 0; i < mediaResults.length; ++i) {
              mobilePlatformMock.respondToMessage({
                data: {
                  id: callbackId,
                  args: [mediaResults[i]],
                  isPartialResponse: i < mediaResults.length - 1,
                },
              } as DOMMessageEvent);
            }
          },
        );
      });

      it('getMedia calls with error with MediaCallback', async () => {
        inValidateGetMediaMessageAndResults(
          getMediaCallbackSupportVersion,
          1,
          (message: MessageRequest, mediaResults: media.MediaResult[]) => {
            const callbackId = message.id;

            for (let i = 0; i < mediaResults.length; ++i) {
              mobilePlatformMock.respondToMessage({
                data: {
                  id: callbackId,
                  args: [mediaResults[i]],
                  isPartialResponse: i < mediaResults.length - 1,
                },
              } as DOMMessageEvent);
            }
          },
        );
      });

      it('getMedia using register handler method returns successful result with expected data', async () => {
        validateGetMediaMessageAndResults(
          mediaAPISupportVersion,
          2,
          (_message: MessageRequest, mediaResults: media.MediaResult[]) => {
            const handlerRegistrationMessage = mobilePlatformMock.findMessageByFunc('registerHandler');
            const getMediaHandlerName = handlerRegistrationMessage.args[0];

            for (let i = 0; i < mediaResults.length; ++i) {
              callHandler(getMediaHandlerName, [JSON.stringify(mediaResults[i])]);
            }
          },
        );
      });

      it('getMedia via the handler rejects if there is no data', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);

        const mediaOutput: media.Media = new media.Media();
        mediaOutput.content = '1234567';
        mediaOutput.mimeType = 'image/jpeg';
        mediaOutput.format = media.FileFormat.ID;
        const getMediaPromise: Promise<Blob> = mediaOutput.getMedia();

        const message = mobilePlatformMock.findMessageByFunc('getMedia');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(2);

        const handlerRegistrationMessage = mobilePlatformMock.findMessageByFunc('registerHandler');
        const getMediaHandlerName = handlerRegistrationMessage.args[0];

        callHandler(getMediaHandlerName, [JSON.stringify({})]);

        return expect(getMediaPromise).rejects.toEqual({
          errorCode: ErrorCode.INTERNAL_ERROR,
          message: 'data received is null',
        });
      });

      it('getMedia calls with error via Handler', async () => {
        inValidateGetMediaMessageAndResults(
          mediaAPISupportVersion,
          2,
          (_message: MessageRequest, mediaResults: media.MediaResult[]) => {
            const handlerRegistrationMessage = mobilePlatformMock.findMessageByFunc('registerHandler');
            const getMediaHandlerName = handlerRegistrationMessage.args[0];

            for (let i = 0; i < mediaResults.length; ++i) {
              callHandler(getMediaHandlerName, [JSON.stringify(mediaResults[i])]);
            }
          },
        );
      });
    });
  });

  describe('viewImages', () => {
    describe('v1', () => {
      it('should not allow viewImages calls with null imageuris', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        media.viewImages(null, (error: SdkError) => {
          expect(error).not.toBeNull();
          expect(error).toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
        });
      });

      it('should not allow viewImages calls with invalid imageuris', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const uris: media.ImageUri[] = [];
        media.viewImages(uris, (error: SdkError) => {
          expect(error).not.toBeNull();
          expect(error).toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
        });
      });

      it('viewImages call in default version of platform support fails', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
        const uris: media.ImageUri[] = [];
        const uri: media.ImageUri = {
          value: 'https://www.w3schools.com/images/picture.jpg',
          type: media.ImageUriType.URL,
        };
        uris.push(uri);
        media.viewImages(uris, (error: SdkError) => {
          expect(error).not.toBeNull();
          expect(error).toEqual({ errorCode: ErrorCode.OLD_PLATFORM });
        });
      });

      it('viewImages call in task frameContext works', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const uris: media.ImageUri[] = [];
        const uri: media.ImageUri = {
          value: 'https://www.w3schools.com/images/picture.jpg',
          type: media.ImageUriType.URL,
        };
        uris.push(uri);
        media.viewImages(uris, emptyCallback);
        const message = mobilePlatformMock.findMessageByFunc('viewImages');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
      });

      it('viewImages call in content frameContext works', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const uris: media.ImageUri[] = [];
        const uri: media.ImageUri = {
          value: 'https://www.w3schools.com/images/picture.jpg',
          type: media.ImageUriType.URL,
        };
        uris.push(uri);
        media.viewImages(uris, emptyCallback);
        const message = mobilePlatformMock.findMessageByFunc('viewImages');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
      });

      it('viewImages calls with error', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const uris: media.ImageUri[] = [];
        const uri: media.ImageUri = {
          value: '1234567',
          type: media.ImageUriType.ID,
        };
        uris.push(uri);
        media.viewImages(uris, (error: SdkError) => {
          expect(error).toEqual({ errorCode: ErrorCode.FILE_NOT_FOUND });
        });

        const message = mobilePlatformMock.findMessageByFunc('viewImages');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);

        const callbackId = message.id;
        mobilePlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [{ errorCode: ErrorCode.FILE_NOT_FOUND }],
          },
        } as DOMMessageEvent);
      });
    });

    describe('v2', () => {
      it('should not allow viewImages calls with null imageuris', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        return expect(media.viewImages(null)).rejects.toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
      });

      it('should not allow viewImages calls with invalid imageuris', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const uris: media.ImageUri[] = [];
        return expect(media.viewImages(uris)).rejects.toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
      });

      it('viewImages call in default version of platform support fails', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
        const uris: media.ImageUri[] = [];
        const uri: media.ImageUri = {
          value: 'https://www.w3schools.com/images/picture.jpg',
          type: media.ImageUriType.URL,
        };
        uris.push(uri);
        return expect(media.viewImages(uris)).rejects.toEqual({ errorCode: ErrorCode.OLD_PLATFORM });
      });

      it('viewImages call in task frameContext works', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const uris: media.ImageUri[] = [];
        const uri: media.ImageUri = {
          value: 'https://www.w3schools.com/images/picture.jpg',
          type: media.ImageUriType.URL,
        };
        uris.push(uri);
        media.viewImages(uris);
        const message = mobilePlatformMock.findMessageByFunc('viewImages');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
      });

      it('viewImages call in content frameContext works', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const uris: media.ImageUri[] = [];
        const uri: media.ImageUri = {
          value: 'https://www.w3schools.com/images/picture.jpg',
          type: media.ImageUriType.URL,
        };
        uris.push(uri);
        media.viewImages(uris);
        const message = mobilePlatformMock.findMessageByFunc('viewImages');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
      });

      it('viewImages calls with error', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const uris: media.ImageUri[] = [];
        const uri: media.ImageUri = {
          value: '1234567',
          type: media.ImageUriType.ID,
        };
        uris.push(uri);
        const promise = media.viewImages(uris);

        const message = mobilePlatformMock.findMessageByFunc('viewImages');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);

        const callbackId = message.id;
        mobilePlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [{ errorCode: ErrorCode.FILE_NOT_FOUND }],
          },
        } as DOMMessageEvent);
        return expect(promise).rejects.toEqual({ errorCode: ErrorCode.FILE_NOT_FOUND });
      });
    });
  });

  describe('scanBarCode', () => {
    describe('_v1', () => {
      it('scanBarCode call in default version of platform support fails', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
        media.scanBarCode((e: SdkError, d: string) => {
          expect(e).not.toBeNull();
          expect(e).toEqual({ errorCode: ErrorCode.OLD_PLATFORM });
        });
      });

      it('should not allow scanBarCode calls for authentication frame context', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.authentication);
        mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);
        expect(() => media.scanBarCode(emptyCallback, null)).toThrowError(
          'This call is only allowed in following contexts: ["content","task"]. Current context: "authentication".',
        );
      });

      it('scanBarCode call in task frameContext works', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);
        media.scanBarCode(emptyCallback, null);
        const message = mobilePlatformMock.findMessageByFunc('media.scanBarCode');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
      });

      it('scanBarCode call in content frameContext works', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);
        media.scanBarCode(emptyCallback, null);
        const message = mobilePlatformMock.findMessageByFunc('media.scanBarCode');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
      });

      it('scanBarCode calls with successful result', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);

        media.scanBarCode((err: SdkError, decodedText: string) => {
          expect(err).toBeFalsy();
          expect(decodedText).toBe('decodedText');
        });

        const message = mobilePlatformMock.findMessageByFunc('media.scanBarCode');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);

        const callbackId = message.id;
        const response = 'decodedText';
        mobilePlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [undefined, response],
          },
        } as DOMMessageEvent);
      });

      it('scanBarCode with optional barcode config calls with successful result', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);
        const barCodeConfig: media.BarCodeConfig = {
          timeOutIntervalInSec: 40,
        };
        media.scanBarCode((mediaError: SdkError, decodedText: string) => {
          expect(mediaError).toBeFalsy();
          expect(decodedText).not.toBeNull;
          expect(decodedText).toBe('decodedText');
        }, barCodeConfig);

        const message = mobilePlatformMock.findMessageByFunc('media.scanBarCode');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);

        const callbackId = message.id;
        const response = 'decodedText';
        mobilePlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [undefined, response],
          },
        } as DOMMessageEvent);
      });

      it('scanBarCode calls with error', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);
        media.scanBarCode((err: SdkError, decodedText: string) => {
          expect(decodedText).toBeFalsy();
          expect(err).toEqual({ errorCode: ErrorCode.OPERATION_TIMED_OUT });
        });

        const message = mobilePlatformMock.findMessageByFunc('media.scanBarCode');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);

        const callbackId = message.id;
        mobilePlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [{ errorCode: ErrorCode.OPERATION_TIMED_OUT }],
          },
        } as DOMMessageEvent);
      });

      it('should not allow scanBarCode calls with invalid timeOutIntervalInSec', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);
        const barCodeConfig: any = {
          timeOutIntervalInSec: 0,
        };
        media.scanBarCode((mediaError: SdkError, d: string) => {
          expect(mediaError).not.toBeNull();
          expect(mediaError).toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
        }, barCodeConfig);
      });

      it('should not allow scanBarCode calls in desktop', async () => {
        await desktopPlatformMock.initializeWithContext(FrameContexts.content, HostClientType.desktop);
        media.scanBarCode((error: SdkError, d: string) => {
          expect(error).not.toBeNull();
          expect(error).toEqual({ errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM });
        });
      });
    });

    describe('_v2', () => {
      it('should not allow scanBarCode calls before initialization', () => {
        return expect(() => media.scanBarCode()).toThrowError('The library has not yet been initialized');
      });

      it('scanBarCode call in default version of platform support fails', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
        return expect(media.scanBarCode()).rejects.toEqual({ errorCode: ErrorCode.OLD_PLATFORM });
      });

      it('should not allow scanBarCode calls for authentication frame context', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.authentication);
        mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);
        return expect(() => media.scanBarCode()).toThrowError(
          'This call is only allowed in following contexts: ["content","task"]. Current context: "authentication".',
        );
      });

      it('scanBarCode call in task frameContext works', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);
        media.scanBarCode(null);
        const message = mobilePlatformMock.findMessageByFunc('media.scanBarCode');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
      });

      it('scanBarCode call in content frameContext works', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);
        media.scanBarCode(null);
        const message = mobilePlatformMock.findMessageByFunc('media.scanBarCode');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
      });

      it('scanBarCode calls with successful result', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);
        const promise = media.scanBarCode();

        const message = mobilePlatformMock.findMessageByFunc('media.scanBarCode');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);

        const callbackId = message.id;
        const response = 'decodedText';
        mobilePlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [undefined, response],
          },
        } as DOMMessageEvent);

        return expect(promise).resolves.toBe('decodedText');
      });

      it('scanBarCode with optional barcode config calls with successful result', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);
        const barCodeConfig: media.BarCodeConfig = {
          timeOutIntervalInSec: 40,
        };
        const promise = media.scanBarCode(barCodeConfig);

        const message = mobilePlatformMock.findMessageByFunc('media.scanBarCode');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);

        const callbackId = message.id;
        const response = 'decodedText';
        mobilePlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [undefined, response],
          },
        } as DOMMessageEvent);

        return expect(promise).resolves.toBe('decodedText');
      });

      it('scanBarCode calls with error', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.content);
        mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);
        const promise = media.scanBarCode();

        const message = mobilePlatformMock.findMessageByFunc('media.scanBarCode');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);

        const callbackId = message.id;
        mobilePlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [{ errorCode: ErrorCode.OPERATION_TIMED_OUT }],
          },
        } as DOMMessageEvent);

        return expect(promise).rejects.toEqual({ errorCode: ErrorCode.OPERATION_TIMED_OUT });
      });

      it('should not allow scanBarCode calls with invalid timeOutIntervalInSec', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);
        const barCodeConfig = {
          timeOutIntervalInSec: 0,
        };
        return expect(media.scanBarCode(barCodeConfig)).rejects.toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
      });

      it('should allow scanBarCode calls when timeOutIntervalInSec is not passed in config params', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);
        const barCodeConfig: media.BarCodeConfig = {};
        return expect(media.scanBarCode(barCodeConfig)).resolves;
      });

      it('should not allow scanBarCode calls in desktop', async () => {
        await desktopPlatformMock.initializeWithContext(FrameContexts.content, HostClientType.desktop);
        return expect(media.scanBarCode()).rejects.toEqual({ errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM });
      });
    });
  });
});
