import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { app } from '../../src/public/app';
import { FrameContexts, HostClientType } from '../../src/public/constants';
import { ErrorCode, SdkError } from '../../src/public/interfaces';
import { media } from '../../src/public/media';
import { FramelessPostMocks } from '../framelessPostMocks';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

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
  const utils = new Utils();

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

  describe('captureImage', () => {
    it('should not allow captureImage calls before initialization', () => {
      expect(() => media.captureImage(emptyCallback)).toThrowError(new Error(errorLibraryNotInitialized));
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

  describe('selectMedia', () => {
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
      await mobilePlatformMock.initializeWithContext(FrameContexts.task, HostClientType.android);
      mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
      let mediaError: SdkError;
      const mediaInputs: media.MediaInputs = {
        mediaType: media.MediaType.Image,
        imageProps: { imageOutputFormats: [media.ImageOutputFormats.PDF] },
        maxMediaCount: 6,
      };
      media.selectMedia(mediaInputs, (error: SdkError, attachments: media.Media[]) => {
        mediaError = error;
      });
      expect(mediaError).not.toBeNull();
      expect(mediaError.errorCode).toBe(ErrorCode.OLD_PLATFORM);
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
      const videoControllerCallback: media.VideoControllerCallback = { onRecordingStarted: jest.fn() };

      const mediaInputs: media.MediaInputs = {
        mediaType: media.MediaType.Video,
        maxMediaCount: 10,
        videoProps: { videoController: new media.VideoController(videoControllerCallback) },
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

  describe('videoController', () => {
    it('videoController notifyEventToHost is handled successfully', async () => {
      await mobilePlatformMock.initializeWithContext(FrameContexts.task, HostClientType.android);
      mobilePlatformMock.setClientSupportedSDKVersion(nonFullScreenVideoModeAPISupportVersion);
      let mediaError: SdkError;
      new media.VideoController().stop((e: SdkError) => {
        mediaError = e;
      });

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

      expect(mediaError).toBeFalsy();
    });

    it('videoController stop function returns SdkError to callback when parent rejects message', async () => {
      await mobilePlatformMock.initializeWithContext(FrameContexts.content, HostClientType.android);
      mobilePlatformMock.setClientSupportedSDKVersion(nonFullScreenVideoModeAPISupportVersion);
      let error;
      new media.VideoController().stop((e: SdkError) => {
        error = e;
      });
      const err = {
        errorCode: ErrorCode.INTERNAL_ERROR,
      };

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

      expect(error.errorCode).toBe(ErrorCode.INTERNAL_ERROR);
    });

    it('videoController notifyEventToHost should fail in default version of platform', async () => {
      await mobilePlatformMock.initializeWithContext(FrameContexts.content, HostClientType.android);
      mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
      let error;
      new media.VideoController().stop((e: SdkError) => {
        error = e;
      });
      expect(error).not.toBeNull();
      expect(error.errorCode).toBe(ErrorCode.OLD_PLATFORM);
    });

    it('videoController notifyEventToApp should return if no callback is provided', async () => {
      await mobilePlatformMock.initializeWithContext(FrameContexts.content, HostClientType.android);
      mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
      const videoControllerCallback: media.VideoControllerCallback = {
        onRecordingStarted: jest.fn(),
      };

      const videoController = new media.VideoController(videoControllerCallback);
      const notifyEventToApp = jest.spyOn(videoController, 'notifyEventToApp');

      try {
        await videoController.stop((e) => {
          return e;
        });
      } catch (err) {
        expect(err).toEqual({ errorCode: ErrorCode.OLD_PLATFORM });
      }

      expect(notifyEventToApp).not.toHaveBeenCalled();
    });

    it('videoController notifyEventToApp should call the onRecordingStarted callback when the mediaControllerEvent is 1', async () => {
      await mobilePlatformMock.initializeWithContext(FrameContexts.content, HostClientType.android);
      mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);

      const videoControllerCallback: media.VideoControllerCallback = {
        onRecordingStarted: jest.fn(),
      };

      const videoController = new media.VideoController(videoControllerCallback);

      const notifyEventToAppSpy = jest.spyOn(videoController, 'notifyEventToApp');
      videoController.notifyEventToApp(media.MediaControllerEvent.StartRecording);

      expect(notifyEventToAppSpy).toHaveBeenCalledWith(media.MediaControllerEvent.StartRecording);
      expect(videoControllerCallback.onRecordingStarted).toHaveBeenCalled();
    });

    it('videoController notifyEventToApp should call the onRecordingStopped callback if callback is provided and mediaControllerEvent is 2', async () => {
      await mobilePlatformMock.initializeWithContext(FrameContexts.content, HostClientType.android);
      mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);

      const videoControllerCallback: media.VideoControllerCallback = {
        onRecordingStarted: emptyCallback,
      };

      const videoController = new media.VideoController(videoControllerCallback);

      const notifyEventToAppSpy = jest.spyOn(videoController, 'notifyEventToApp');
      videoController.notifyEventToApp(media.MediaControllerEvent.StopRecording);

      expect(notifyEventToAppSpy).toHaveBeenCalledWith(media.MediaControllerEvent.StopRecording);
    });
  });

  describe('viewImages', () => {
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

  describe('scanBarCode', () => {
    it('scanBarCode call in default version of platform support fails', async () => {
      await mobilePlatformMock.initializeWithContext(FrameContexts.task, HostClientType.android);
      mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
      media.scanBarCode((e: SdkError, d: string) => {
        expect(e).not.toBeNull();
        expect(e).toEqual({ errorCode: ErrorCode.OLD_PLATFORM });
      });
    });

    it('should not allow scanBarCode calls for authentication frame context', async () => {
      await mobilePlatformMock.initializeWithContext(FrameContexts.authentication, HostClientType.android);
      mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);
      expect(() => media.scanBarCode(emptyCallback, null)).toThrowError(
        'This call is only allowed in following contexts: ["content","task"]. Current context: "authentication".',
      );
    });

    it('scanBarCode call in task frameContext works', async () => {
      await mobilePlatformMock.initializeWithContext(FrameContexts.task, HostClientType.android);
      mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);
      media.scanBarCode(emptyCallback, null);
      const message = mobilePlatformMock.findMessageByFunc('media.scanBarCode');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
    });

    it('scanBarCode call in content frameContext works', async () => {
      await mobilePlatformMock.initializeWithContext(FrameContexts.content, HostClientType.android);
      mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);
      media.scanBarCode(emptyCallback, null);
      const message = mobilePlatformMock.findMessageByFunc('media.scanBarCode');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
    });

    it('scanBarCode calls with successful result', async () => {
      await mobilePlatformMock.initializeWithContext(FrameContexts.content, HostClientType.android);
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
      await mobilePlatformMock.initializeWithContext(FrameContexts.content, HostClientType.android);
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
      await mobilePlatformMock.initializeWithContext(FrameContexts.content, HostClientType.android);
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
      await mobilePlatformMock.initializeWithContext(FrameContexts.task, HostClientType.android);
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
});
