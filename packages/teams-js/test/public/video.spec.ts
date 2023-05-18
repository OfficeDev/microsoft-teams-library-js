import './mediaStreamApiMock';

import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { video } from '../../src/public/video';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

/**
 * Test cases for selectPeople API
 */
describe('video', () => {
  let utils: Utils;
  describe.each([
    {
      framedOrFrameless: 'frameless',
      sendMessage: (func: string, ...args: unknown[]) => {
        utils.respondToFramelessMessage({ data: { func, args } } as DOMMessageEvent);
      },
    },
    {
      framedOrFrameless: 'framed',
      sendMessage: (func: string, ...args: unknown[]) => {
        utils.sendMessage(func, ...args);
      },
    },
  ] as const)('$framedOrFrameless', ({ framedOrFrameless, sendMessage }) => {
    const isFrameless = framedOrFrameless === 'frameless';
    const allowedContexts = [FrameContexts.sidePanel];
    const notAllowedContexts = Object.values(FrameContexts).filter((context) => !allowedContexts.includes(context));

    beforeAll(() => {
      GlobalVars.isFramelessWindow = isFrameless;
    });

    afterAll(() => {
      GlobalVars.isFramelessWindow = false;
    });

    beforeEach(() => {
      utils = new Utils();
      if (isFrameless) {
        utils.mockWindow.parent = undefined;
      }
    });

    afterEach(() => {
      app._uninitialize();
    });

    describe('registerForVideoFrame', () => {
      const registerForVideoFrameParameters: video.RegisterForVideoFrameParameters = {
        sharedFrameCallback: (_frame, _onSuccess, _onError) => {},
        mediaStreamCallback: (data) => Promise.resolve(data.videoFrame),
        config: { format: video.VideoFrameFormat.NV12 },
      };

      describe.each([
        {
          variant: 'sharedFrame',
          supports: { video: { sharedFrame: true } },
          eventName: 'video.registerForVideoFrame',
        },
        {
          variant: 'mediaStream',
          supports: { video: { mediaStream: true } },
          eventName: 'video.mediaStream.registerForVideoFrame',
        },
      ])('$variant', ({ supports, eventName }) => {
        beforeEach(async () => {
          await utils.initializeWithContext(FrameContexts.sidePanel);
          utils.setRuntimeConfig({ apiVersion: 1, supports });
        });

        it(`should successfully send ${eventName} message`, async () => {
          expect.assertions(3);

          // Act
          video.registerForVideoFrame(registerForVideoFrameParameters);

          // Assert
          const message = utils.findMessageByFunc(eventName);
          expect(message).not.toBeNull();
          expect(message?.args?.length).toBe(1);
          expect(message?.args).toEqual([registerForVideoFrameParameters.config]);
        });

        it('should not send default message when register video frame handler', async () => {
          expect.assertions(1);

          // Act
          video.registerForVideoFrame(registerForVideoFrameParameters);

          // Assert
          const messageForRegister = utils.findMessageByFunc('registerHandler');
          expect(messageForRegister).toBeNull();
        });
      });

      describe('sharedFrame', () => {
        beforeEach(async () => {
          await utils.initializeWithContext(FrameContexts.sidePanel);
          utils.setRuntimeConfig({ apiVersion: 1, supports: { video: { sharedFrame: true } } });
        });

        it.each([
          { isLegacy: true, frameData: { width: 30, height: 40, data: 101 } },
          { isLegacy: false, frameData: { width: 30, height: 40, videoFrameBuffer: 101 } },
        ])('should successfully invoke sharedFrameHandler (legacy: $isLegacy)', async ({ frameData }) => {
          expect.assertions(2);

          // Arrange
          const sharedFrameCallback = jest.fn();

          // Act
          video.registerForVideoFrame({
            ...registerForVideoFrameParameters,
            sharedFrameCallback,
          });
          sendMessage('video.newVideoFrame', frameData);

          // Assert
          expect(sharedFrameCallback).toHaveBeenCalledTimes(1);
          expect(sharedFrameCallback.mock.lastCall[0]).toEqual({
            width: 30,
            height: 40,
            videoFrameBuffer: 101,
          });
        });

        it('should invoke video frame event handler and successfully send videoFrameProcessed', async () => {
          expect.assertions(3);

          // Arrange
          const sharedFrameCallback: video.SharedFrameCallback = (_frame, onSuccess) => onSuccess();

          // Act
          video.registerForVideoFrame({ ...registerForVideoFrameParameters, sharedFrameCallback });
          const videoFrameMock = { width: 30, height: 40, data: 101, timestamp: 200 };
          sendMessage('video.newVideoFrame', videoFrameMock);

          // Assert
          const message = utils.findMessageByFunc('video.videoFrameProcessed');
          expect(message).not.toBeNull();
          expect(message?.args?.length).toBe(1);
          expect(message?.args?.[0]).toEqual(200);
        });

        it('should invoke video frame event handler and successfully send notifyError', async () => {
          expect.assertions(3);

          // Arrange
          const errorMessage = 'Error occurs when processing the video frame';
          const sharedFrameCallback: video.SharedFrameCallback = (_frame, _onSuccess, onError) => onError(errorMessage);

          // Act
          video.registerForVideoFrame({
            ...registerForVideoFrameParameters,
            sharedFrameCallback,
          });
          const videoFrameMock = { width: 30, height: 40, data: 101 };
          sendMessage('video.newVideoFrame', videoFrameMock);

          // Assert
          const message = utils.findMessageByFunc('video.notifyError');
          expect(message).not.toBeNull();
          expect(message?.args?.length).toBe(1);
          expect(message?.args?.[0]).toEqual(errorMessage);
        });

        it('should not invoke video frame event handler when videoFrame is undefined', async () => {
          expect.assertions(1);

          // Arrange
          const sharedFrameCallback = jest.fn();

          // Act
          video.registerForVideoFrame({ ...registerForVideoFrameParameters, sharedFrameCallback });
          sendMessage('video.newVideoFrame', undefined);

          // Assert
          expect(sharedFrameCallback).not.toHaveBeenCalled();
        });
      });

      describe('mediaStream', () => {
        beforeEach(async () => {
          await utils.initializeWithContext(FrameContexts.sidePanel);
          utils.setRuntimeConfig({ apiVersion: 1, supports: { video: { mediaStream: true } } });
        });

        it('should successfully invoke mediaStreamHandler', async () => {
          expect.assertions(1);

          // Arrange
          const mediaStreamCallback = jest.fn();

          // Act
          video.registerForVideoFrame({
            ...registerForVideoFrameParameters,
            mediaStreamCallback,
          });
          sendMessage('video.startVideoExtensibilityVideoStream', { streamId: 'stream id' });
          await utils.flushPromises();

          // Assert
          expect(mediaStreamCallback).toHaveBeenCalledTimes(1);
        });

        it('should get and register stream with streamId received from startVideoExtensibilityVideoStream', async () => {
          expect.assertions(4);

          // Arrange
          const mediaStreamCallback = jest.fn();
          const webview = window['chrome']['webview'] as unknown as {
            getTextureStream: jest.Mock;
            registerTextureStream: jest.Mock;
          };
          const getTextureStreamSpy = jest.spyOn(webview, 'getTextureStream');
          const registerTextureStreamSpy = jest.spyOn(webview, 'registerTextureStream');

          // Act
          video.registerForVideoFrame({
            ...registerForVideoFrameParameters,
            mediaStreamCallback,
          });
          sendMessage('video.startVideoExtensibilityVideoStream', { streamId: 'stream id' });
          await utils.flushPromises();

          // Assert
          expect(webview.getTextureStream).toHaveBeenCalledTimes(1);
          expect(webview.getTextureStream.mock.lastCall[0]).toBe('stream id');
          expect(webview.registerTextureStream).toHaveBeenCalledTimes(1);
          expect(webview.registerTextureStream.mock.lastCall[0]).toBe('stream id');

          // cleanup
          getTextureStreamSpy.mockRestore();
          registerTextureStreamSpy.mockRestore();
        });

        it('should notify error when callback rejects', async () => {
          expect.assertions(3);

          // Arrange
          const errorMessage = 'error message';
          const mediaStreamCallback = jest.fn().mockRejectedValue(errorMessage);

          // Act
          video.registerForVideoFrame({
            ...registerForVideoFrameParameters,
            mediaStreamCallback,
          });
          sendMessage('video.startVideoExtensibilityVideoStream', { streamId: 'stream id' });
          await utils.flushPromises();

          // Assert
          const message = utils.findMessageByFunc('video.notifyError');
          expect(message).not.toBeNull();
          expect(message?.args?.length).toBe(1);
          expect(message?.args?.[0]).toEqual(errorMessage);
        });
      });
    });

    describe('notifySelectedVideoEffectChanged', () => {
      it('should successfully send notifySelectedVideoEffectChanged message', async () => {
        expect.assertions(3);

        // Arrange
        await utils.initializeWithContext(FrameContexts.sidePanel);

        // Act
        video.notifySelectedVideoEffectChanged(video.EffectChangeType.EffectChanged, 'effectId');

        // Assert
        const message = utils.findMessageByFunc('video.videoEffectChanged');
        expect(message).not.toBeNull();
        expect(message?.args?.length).toBe(2);
        expect(message?.args).toEqual([video.EffectChangeType.EffectChanged, 'effectId']);
      });
    });

    describe('registerForVideoEffect', () => {
      it('should successfully register effectParameterChange', async () => {
        expect.assertions(3);

        // Arrange
        await utils.initializeWithContext(FrameContexts.sidePanel);

        // Act
        video.registerForVideoEffect(() => Promise.resolve());

        const messageForRegister = utils.findMessageByFunc('video.registerForVideoEffect');
        expect(messageForRegister).not.toBeNull();
        expect(messageForRegister?.args?.length).toBe(0);
        expect(utils.findMessageByFunc('registerHandler')).toBeNull();
      });

      it('should successfully invoke effectParameterChange handler', async () => {
        expect.assertions(2);

        // Arrange
        await utils.initializeWithContext(FrameContexts.sidePanel);
        const videoEffectCallBack = jest.fn().mockResolvedValue(undefined);

        // Act
        video.registerForVideoEffect(videoEffectCallBack);
        const effectId = 'sampleEffectId';
        sendMessage('video.effectParameterChange', effectId);

        // Assert
        expect(videoEffectCallBack).toHaveBeenCalledTimes(1);
        expect(videoEffectCallBack.mock.lastCall[0]).toEqual(effectId);
      });

      it('should invoke videoEffectReadiness handler on callback resolved', async () => {
        expect.assertions(3);

        // Arrange
        await utils.initializeWithContext(FrameContexts.sidePanel);
        const videoEffectCallBack = jest.fn().mockResolvedValue(undefined);

        // Act
        video.registerForVideoEffect(videoEffectCallBack);
        const effectId = 'sampleEffectId';
        sendMessage('video.effectParameterChange', effectId);
        await videoEffectCallBack.mock.results[0].value;

        // Assert
        const messageForRegister = utils.findMessageByFunc('video.videoEffectReadiness');
        expect(messageForRegister).not.toBeNull();
        expect(messageForRegister?.args?.length).toBe(2);
        expect(messageForRegister?.args).toEqual([true, effectId]);
      });

      it('should invoke videoEffectReadiness handler on callback rejects', async () => {
        expect.assertions(3);

        // Arrange
        await utils.initializeWithContext(FrameContexts.sidePanel);
        const videoEffectCallBack = jest
          .fn<Promise<void>, unknown[]>()
          .mockRejectedValue(video.EffectFailureReason.InvalidEffectId);

        // Act
        video.registerForVideoEffect(videoEffectCallBack);
        const effectId = 'sampleEffectId';
        sendMessage('video.effectParameterChange', effectId);
        await videoEffectCallBack.mock.results[0].value.catch(() => {});

        // Assert
        const messageForRegister = utils.findMessageByFunc('video.videoEffectReadiness');
        expect(messageForRegister).not.toBeNull();
        expect(messageForRegister?.args?.length).toBe(3);
        expect(messageForRegister?.args).toEqual([false, effectId, 'InvalidEffectId']);
      });
    });

    describe('isSupported', () => {
      it('should throw if called before initialization', () => {
        utils.uninitializeRuntimeConfig();
        expect(() => video.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
      });
    });

    // Error cases
    describe.each([
      {
        apiName: 'registerForVideoFrame',
        callApi: () =>
          video.registerForVideoFrame({
            sharedFrameCallback: jest.fn(),
            mediaStreamCallback: jest.fn(),
            config: { format: video.VideoFrameFormat.NV12 },
          }),
      },
      {
        apiName: 'notifySelectedVideoEffectChanged',
        callApi: () => video.notifySelectedVideoEffectChanged(video.EffectChangeType.EffectChanged, 'effectId'),
      },
      {
        apiName: 'registerForVideoEffect',
        callApi: () => video.registerForVideoEffect(() => Promise.resolve()),
      },
    ])(`$apiName`, ({ callApi }) => {
      it.each(notAllowedContexts)('is not allowed in wrong context: FrameContext.%s', async (wrongContext) => {
        expect.assertions(1);

        // Arrange
        const stringifiedAllowedContexts = JSON.stringify(allowedContexts);
        const expectedError = `This call is only allowed in following contexts: ${stringifiedAllowedContexts}. Current context: "${wrongContext}".`;
        await utils.initializeWithContext(wrongContext);

        // Assert
        expect(() => callApi()).toThrowError(expectedError);
      });

      it('should throw error when video is not supported in runtime config', async () => {
        expect.assertions(1);

        // Arrange
        await utils.initializeWithContext(FrameContexts.sidePanel);
        utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
        let thrownError: unknown;

        // Act
        try {
          callApi();
        } catch (e) {
          thrownError = e;
        }

        // Assert
        expect(thrownError).toEqual(errorNotSupportedOnPlatform);
      });
    });
  });
});
