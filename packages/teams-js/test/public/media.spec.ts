/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-empty-function */
import { getMediaCallbackSupportVersion, mediaAPISupportVersion } from '../../src/internal/constants';
import { callHandler } from '../../src/internal/handlers';
import { DOMMessageEvent, MessageRequest } from '../../src/internal/interfaces';
import { app } from '../../src/public/app';
import { FrameContexts, HostClientType } from '../../src/public/constants';
import { ErrorCode, SdkError } from '../../src/public/interfaces';
import { media } from '../../src/public/media';
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
  });

  describe('captureImage', () => {
    describe('v1', () => {
      it('should not allow captureImage calls before initialization', () => {
        expect(() => media.captureImage(emptyCallback)).toThrowError('The library has not yet been initialized');
      });
      it('captureImage call in default version of platform support fails', done => {
        mobilePlatformMock.initializeWithContext(FrameContexts.task).then(() => {
          mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
          media.captureImage((error: SdkError, f: media.File[]) => {
            expect(error).not.toBeNull();
            expect(error.errorCode).toBe(ErrorCode.OLD_PLATFORM);
            done();
          });
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
      it('should not allow captureImage calls in desktop', done => {
        desktopPlatformMock.initializeWithContext(FrameContexts.content).then(() => {
          media.captureImage((error: SdkError, f: media.File[]) => {
            expect(error).not.toBeNull();
            expect(error.errorCode).toBe(ErrorCode.NOT_SUPPORTED_ON_PLATFORM);
            done();
          });
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
      it('captureImage calls with successful result', done => {
        mobilePlatformMock.initializeWithContext(FrameContexts.content).then(() => {
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
            done();
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
      });
      it('captureImage calls with error', done => {
        mobilePlatformMock.initializeWithContext(FrameContexts.content).then(() => {
          mobilePlatformMock.setClientSupportedSDKVersion(minVersionForCaptureImage);
          media.captureImage((error: SdkError, files: media.File[]) => {
            expect(files).toBeFalsy();
            expect(error.errorCode).toBe(ErrorCode.PERMISSION_DENIED);
            done();
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
      it('should not allow selectMedia calls with null mediaInputs', done => {
        mobilePlatformMock.initializeWithContext(FrameContexts.task).then(() => {
          mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
          media.selectMedia(null, (error: SdkError, attachments: media.Media[]) => {
            expect(error).not.toBeNull();
            expect(error.errorCode).toBe(ErrorCode.INVALID_ARGUMENTS);
            done();
          });
        });
      });

      it('should not allow selectMedia calls with invalid mediaInputs', done => {
        mobilePlatformMock.initializeWithContext(FrameContexts.task).then(() => {
          mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
          const mediaInputs: media.MediaInputs = {
            mediaType: media.MediaType.Image,
            maxMediaCount: 11,
          };
          media.selectMedia(mediaInputs, (error: SdkError, attachments: media.Media[]) => {
            expect(error).not.toBeNull();
            expect(error.errorCode).toBe(ErrorCode.INVALID_ARGUMENTS);
            done();
          });
        });
      });

      it('selectMedia call in default version of platform support fails', done => {
        mobilePlatformMock.initializeWithContext(FrameContexts.task).then(() => {
          mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
          let mediaError: SdkError;
          const mediaInputs: media.MediaInputs = {
            mediaType: media.MediaType.Image,
            maxMediaCount: 10,
          };
          media.selectMedia(mediaInputs, (error: SdkError, attachments: media.Media[]) => {
            expect(error).not.toBeNull();
            expect(error.errorCode).toBe(ErrorCode.OLD_PLATFORM);
            done();
          });
        });
      });

      it('selectMedia call for mediaType = 3 in mediaAPISupportVersion of platform support fails', done => {
        mobilePlatformMock.initializeWithContext(FrameContexts.task, HostClientType.android).then(() => {
          mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
          const mediaInputs: media.MediaInputs = {
            mediaType: media.MediaType.VideoAndImage,
            maxMediaCount: 10,
          };
          media.selectMedia(mediaInputs, (error: SdkError, attachments: media.Media[]) => {
            expect(error).not.toBeNull();
            expect(error.errorCode).toBe(ErrorCode.OLD_PLATFORM);
            done();
          });
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

      it('selectMedia calls with successful result for mediaType = 1', done => {
        mobilePlatformMock.initializeWithContext(FrameContexts.content).then(() => {
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
            done();
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
      });

      it('selectMedia calls with successful result for mediaType = 3', done => {
        mobilePlatformMock.initializeWithContext(FrameContexts.content, HostClientType.ios).then(() => {
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
            done();
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
      });

      it('videoController notifyEventToHost should fail in default version of platform', () => {
        return mobilePlatformMock.initializeWithContext(FrameContexts.content, HostClientType.android).then(() => {
          mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
          let error;
          new media.VideoController().stop((e: SdkError) => {
            error = e;
          });
          expect(error).not.toBeNull();
          expect(error.errorCode).toBe(ErrorCode.OLD_PLATFORM);
        });
      });

      it('videoController notifyEventToHost is handled successfully', () => {
        return mobilePlatformMock.initializeWithContext(FrameContexts.content, HostClientType.android).then(() => {
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
      });

      it('videoController notifyEventToHost is not handled successfully', () => {
        return mobilePlatformMock.initializeWithContext(FrameContexts.content, HostClientType.android).then(() => {
          mobilePlatformMock.setClientSupportedSDKVersion(nonFullScreenVideoModeAPISupportVersion);
          let mediaError: SdkError;
          new media.VideoController().stop((e: SdkError) => {
            mediaError = e;
          });

          const err: SdkError = {
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

          expect(mediaError).toBe(err);
        });
      });

      it('should invoke correct video callback for MediaControllerEvent when registered', () => {
        return mobilePlatformMock.initializeWithContext(FrameContexts.content, HostClientType.ios).then(() => {
          mobilePlatformMock.setClientSupportedSDKVersion(nonFullScreenVideoModeAPISupportVersion);
          let mediaError: SdkError;
          const mockCallback = jest.fn();
          const videoControllerCallback: media.VideoControllerCallback = {
            onRecordingStarted() {
              mockCallback();
            },
          };
          const videoProps: media.VideoProps = {
            videoController: new media.VideoController(videoControllerCallback),
          };
          const mediaInputs: media.MediaInputs = {
            mediaType: media.MediaType.Video,
            maxMediaCount: 10,
            videoProps: videoProps,
          };

          media
            .selectMedia(mediaInputs, (e: SdkError, attachments: media.Media[]) => {
              mediaError = e;
            })
            .then(() => {
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
              expect(mockCallback).toHaveBeenCalled();
            });
        });
      });

      it('should not invoke video callback for MediaControllerEvent when not registered', () => {
        return mobilePlatformMock.initializeWithContext(FrameContexts.content, HostClientType.ios).then(() => {
          mobilePlatformMock.setClientSupportedSDKVersion(nonFullScreenVideoModeAPISupportVersion);
          let mediaError: SdkError;
          const mediaInputs: media.MediaInputs = {
            mediaType: media.MediaType.Video,
            maxMediaCount: 10,
            videoProps: {},
          };

          media.selectMedia(mediaInputs, (e: SdkError, attachments: media.Media[]) => {
            mediaError = e;
          });

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
          expect(jest.fn()).not.toHaveBeenCalled();
        });
      });

      it('selectMedia calls with error', () => {
        return mobilePlatformMock.initializeWithContext(FrameContexts.content).then(() => {
          mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
          const mediaInputs: media.MediaInputs = {
            mediaType: media.MediaType.Image,
            maxMediaCount: 10,
          };
          media.selectMedia(mediaInputs, (mediaError: SdkError, mediaAttachments: media.Media[]) => {
            expect(mediaAttachments).toBeFalsy();
            expect(mediaError.errorCode).toBe(ErrorCode.SIZE_EXCEEDED);
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

        return expect(promise).rejects.toEqual({ errorCode: ErrorCode.SIZE_EXCEEDED });
      });
    });
  });

  describe('getMedia', () => {
    describe('v1', () => {
      it('should not allow getMedia calls with invalid media mimetype', done => {
        mobilePlatformMock.initializeWithContext(FrameContexts.task).then(() => {
          mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
          const mediaOutput: media.Media = new media.Media();
          mediaOutput.content = '1234567';
          mediaOutput.mimeType = null;
          mediaOutput.format = media.FileFormat.ID;
          mediaOutput.getMedia((error: SdkError, blob: Blob) => {
            expect(error).not.toBeNull();
            expect(error.errorCode).toBe(ErrorCode.INVALID_ARGUMENTS);
            done();
          });
        });
      });

      it('should not allow getMedia calls with invalid media content', done => {
        mobilePlatformMock.initializeWithContext(FrameContexts.task).then(() => {
          mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
          const mediaOutput: media.Media = new media.Media();
          mediaOutput.content = null;
          mediaOutput.mimeType = 'image/jpeg';
          mediaOutput.format = media.FileFormat.ID;
          mediaOutput.getMedia((error: SdkError, blob: Blob) => {
            expect(error).not.toBeNull();
            expect(error.errorCode).toBe(ErrorCode.INVALID_ARGUMENTS);
            done();
          });
        });
      });

      it('should not allow getMedia calls with invalid media file format', done => {
        mobilePlatformMock.initializeWithContext(FrameContexts.task).then(() => {
          mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
          const mediaOutput: media.Media = new media.Media();
          mediaOutput.content = '1234567';
          mediaOutput.mimeType = 'image/jpeg';
          mediaOutput.format = media.FileFormat.Base64;
          mediaOutput.getMedia((error: SdkError, blob: Blob) => {
            expect(error).not.toBeNull();
            expect(error.errorCode).toBe(ErrorCode.INVALID_ARGUMENTS);
            done();
          });
        });
      });

      it('getMedia call in default version of platform support fails', done => {
        mobilePlatformMock.initializeWithContext(FrameContexts.task).then(() => {
          mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
          const mediaOutput: media.Media = new media.Media();
          mediaOutput.content = '1234567';
          mediaOutput.mimeType = 'image/jpeg';
          mediaOutput.format = media.FileFormat.ID;
          mediaOutput.getMedia((error: SdkError, blob: Blob) => {
            expect(error).not.toBeNull();
            expect(error.errorCode).toBe(ErrorCode.OLD_PLATFORM);
            done();
          });
        });
      });

      it('getMedia call in task frameContext works', async () => {
        mobilePlatformMock.initializeWithContext(FrameContexts.task).then(() => {
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

      it('getMedia calls with successful result via the handler', done => {
        mobilePlatformMock.initializeWithContext(FrameContexts.content).then(() => {
          //mediaAPISupport version(1.8.0) is less than the MediaCallbackSupportVersion(2.0.0)
          mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
          const mediaOutput: media.Media = new media.Media();
          mediaOutput.content = '1234567';
          mediaOutput.mimeType = 'image/jpeg';
          mediaOutput.format = media.FileFormat.ID;
          mediaOutput.getMedia((error: SdkError, blob: Blob) => {
            getStringContainedInBlob(blob).then(res => {
              expect(res).toEqual(stringMediaData);
              done();
            });
          });

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
      });

      it('getMedia calls with successful result via the callback', done => {
        mobilePlatformMock.initializeWithContext(FrameContexts.content).then(() => {
          // here we give the same version as the supported version
          mobilePlatformMock.setClientSupportedSDKVersion(getMediaCallbackSupportVersion);
          const mediaOutput: media.Media = new media.Media();
          mediaOutput.content = '1234567';
          mediaOutput.mimeType = 'image/jpeg';
          mediaOutput.format = media.FileFormat.ID;
          mediaOutput.getMedia((error: SdkError, blob: Blob) => {
            getStringContainedInBlob(blob).then(res => {
              expect(res).toEqual(stringMediaData);
              done();
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
      });

      it('getMedia calls with error with MediaCallback', done => {
        mobilePlatformMock.initializeWithContext(FrameContexts.content).then(() => {
          mobilePlatformMock.setClientSupportedSDKVersion(getMediaCallbackSupportVersion);
          const mediaOutput: media.Media = new media.Media();
          mediaOutput.content = '12345678';
          mediaOutput.mimeType = 'image/jpeg';
          mediaOutput.format = media.FileFormat.ID;
          mediaOutput.getMedia((error: SdkError, blob: Blob) => {
            expect(error.errorCode).toBe(500);
            expect(error.message).toEqual('data received is null');
            expect(blob).toBeFalsy();
            done();
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
      });

      it('getMedia calls with error with Handler', done => {
        mobilePlatformMock.initializeWithContext(FrameContexts.content).then(() => {
          mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);

          const mediaOutput: media.Media = new media.Media();
          mediaOutput.content = '1234567';
          mediaOutput.mimeType = 'image/jpeg';
          mediaOutput.format = media.FileFormat.ID;
          mediaOutput.getMedia((error: SdkError, blob: Blob) => {
            expect(blob).toBeFalsy();
            expect(error.errorCode).toBe(500);
            done();
          });

          const message = mobilePlatformMock.findMessageByFunc('getMedia');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(2);

          const handlerRegistrationMessage = mobilePlatformMock.findMessageByFunc('registerHandler');
          const getMediaHandlerName = handlerRegistrationMessage.args[0];
          callHandler(getMediaHandlerName, [JSON.stringify(undefined)]);
        });
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
        return expect(mediaOutput.getMedia()).rejects.toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
      });

      it('should not allow getMedia calls with invalid media content', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const mediaOutput: media.Media = new media.Media();
        mediaOutput.content = null;
        mediaOutput.mimeType = 'image/jpeg';
        mediaOutput.format = media.FileFormat.ID;
        return expect(mediaOutput.getMedia()).rejects.toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
      });

      it('should not allow getMedia calls with invalid media file format', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
        const mediaOutput: media.Media = new media.Media();
        mediaOutput.content = '1234567';
        mediaOutput.mimeType = 'image/jpeg';
        mediaOutput.format = media.FileFormat.Base64;
        return expect(mediaOutput.getMedia()).rejects.toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
      });

      it('getMedia call in default version of platform support fails', async () => {
        await mobilePlatformMock.initializeWithContext(FrameContexts.task);
        mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
        const mediaOutput: media.Media = new media.Media();
        mediaOutput.content = '1234567';
        mediaOutput.mimeType = 'image/jpeg';
        mediaOutput.format = media.FileFormat.ID;
        return expect(mediaOutput.getMedia()).rejects.toEqual({ errorCode: ErrorCode.OLD_PLATFORM });
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
    });
  });

  describe('viewImages', () => {
    describe('v1', () => {
      it('should not allow viewImages calls with null imageuris', done => {
        mobilePlatformMock.initializeWithContext(FrameContexts.task).then(() => {
          mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
          media.viewImages(null, (error: SdkError) => {
            expect(error).not.toBeNull();
            expect(error.errorCode).toBe(ErrorCode.INVALID_ARGUMENTS);
            done();
          });
        });
      });

      it('should not allow viewImages calls with invalid imageuris', done => {
        mobilePlatformMock.initializeWithContext(FrameContexts.task).then(() => {
          mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
          const uris: media.ImageUri[] = [];
          media.viewImages(uris, (error: SdkError) => {
            expect(error).not.toBeNull();
            expect(error.errorCode).toBe(ErrorCode.INVALID_ARGUMENTS);
            done();
          });
        });
      });

      it('viewImages call in default version of platform support fails', done => {
        mobilePlatformMock.initializeWithContext(FrameContexts.task).then(() => {
          mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
          const uris: media.ImageUri[] = [];
          const uri: media.ImageUri = {
            value: 'https://www.w3schools.com/images/picture.jpg',
            type: media.ImageUriType.URL,
          };
          uris.push(uri);
          media.viewImages(uris, (error: SdkError) => {
            expect(error).not.toBeNull();
            expect(error.errorCode).toBe(ErrorCode.OLD_PLATFORM);
            done();
          });
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

      it('viewImages calls with error', done => {
        mobilePlatformMock.initializeWithContext(FrameContexts.content).then(() => {
          mobilePlatformMock.setClientSupportedSDKVersion(mediaAPISupportVersion);
          const uris: media.ImageUri[] = [];
          const uri: media.ImageUri = {
            value: '1234567',
            type: media.ImageUriType.ID,
          };
          uris.push(uri);
          media.viewImages(uris, (error: SdkError) => {
            expect(error.errorCode).toBe(ErrorCode.FILE_NOT_FOUND);
            done();
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
      it('scanBarCode call in default version of platform support fails', done => {
        mobilePlatformMock.initializeWithContext(FrameContexts.task).then(() => {
          mobilePlatformMock.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
          media.scanBarCode((e: SdkError, d: string) => {
            expect(e).not.toBeNull();
            expect(e.errorCode).toBe(ErrorCode.OLD_PLATFORM);
            done();
          });
        });
      });

      it('should not allow scanBarCode calls for authentication frame context', () => {
        mobilePlatformMock.initializeWithContext(FrameContexts.authentication).then(() => {
          mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);
          expect(() => media.scanBarCode(emptyCallback, null)).toThrowError(
            'This call is only allowed in following contexts: ["content","task"]. Current context: "authentication".',
          );
        });
      });

      it('scanBarCode call in task frameContext works', () => {
        mobilePlatformMock.initializeWithContext(FrameContexts.task).then(() => {
          mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);
          media.scanBarCode(emptyCallback, null);
          const message = mobilePlatformMock.findMessageByFunc('media.scanBarCode');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);
        });
      });

      it('scanBarCode call in content frameContext works', () => {
        mobilePlatformMock.initializeWithContext(FrameContexts.content).then(() => {
          mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);
          media.scanBarCode(emptyCallback, null);
          const message = mobilePlatformMock.findMessageByFunc('media.scanBarCode');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);
        });
      });

      it('scanBarCode calls with successful result', done => {
        mobilePlatformMock.initializeWithContext(FrameContexts.content).then(() => {
          mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);

          media.scanBarCode((err: SdkError, decodedText: string) => {
            expect(err).toBeFalsy();
            expect(decodedText).toBe('decodedText');
            done();
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
      });

      it('scanBarCode with optional barcode config calls with successful result', done => {
        mobilePlatformMock.initializeWithContext(FrameContexts.content).then(() => {
          mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);
          const barCodeConfig: media.BarCodeConfig = {
            timeOutIntervalInSec: 40,
          };
          media.scanBarCode((mediaError: SdkError, decodedText: string) => {
            expect(mediaError).toBeFalsy();
            expect(decodedText).not.toBeNull;
            expect(decodedText).toBe('decodedText');
            done();
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
      });

      it('scanBarCode calls with error', done => {
        mobilePlatformMock.initializeWithContext(FrameContexts.content).then(() => {
          mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);
          media.scanBarCode((err: SdkError, decodedText: string) => {
            expect(decodedText).toBeFalsy();
            expect(err.errorCode).toBe(ErrorCode.OPERATION_TIMED_OUT);
            done();
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
      });

      it('should not allow scanBarCode calls with invalid timeOutIntervalInSec', done => {
        mobilePlatformMock.initializeWithContext(FrameContexts.task).then(() => {
          mobilePlatformMock.setClientSupportedSDKVersion(scanBarCodeAPISupportVersion);
          const barCodeConfig: any = {
            timeOutIntervalInSec: 0,
          };
          media.scanBarCode((mediaError: SdkError, d: string) => {
            expect(mediaError).not.toBeNull();
            expect(mediaError.errorCode).toBe(ErrorCode.INVALID_ARGUMENTS);
            done();
          }, barCodeConfig);
        });
      });

      it('should not allow scanBarCode calls in desktop', done => {
        desktopPlatformMock.initializeWithContext(FrameContexts.content, HostClientType.desktop).then(() => {
          media.scanBarCode((error: SdkError, d: string) => {
            expect(error).not.toBeNull();
            expect(error.errorCode).toBe(ErrorCode.NOT_SUPPORTED_ON_PLATFORM);
            done();
          });
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
