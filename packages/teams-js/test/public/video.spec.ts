import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { VideoPerformanceMonitor } from '../../src/internal/videoPerformanceMonitor';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { video } from '../../src/public/video';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

mockMediaStreamAPI();

/**
 * Test cases for video API
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
        videoBufferHandler: (_bufferData, _onSuccess, _onError) => {},
        videoFrameHandler: (data) => Promise.resolve(data.videoFrame),
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

        it('should listen to video.setFrameProcessTimeLimit', () => {
          expect.assertions(2);
          const setFrameProcessTimeLimitSpy = jest.spyOn(VideoPerformanceMonitor.prototype, 'setFrameProcessTimeLimit');
          // Act
          video.registerForVideoFrame(registerForVideoFrameParameters);
          sendMessage('video.setFrameProcessTimeLimit', { timeLimit: 100 });

          // Assert
          expect(setFrameProcessTimeLimitSpy).toBeCalledTimes(1);
          expect(setFrameProcessTimeLimitSpy.mock.calls[0][0]).toEqual(100);
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
        ])('should successfully invoke videoBufferHandler (legacy: $isLegacy)', async ({ frameData }) => {
          expect.assertions(2);

          // Arrange
          const videoBufferHandler = jest.fn();

          // Act
          video.registerForVideoFrame({
            ...registerForVideoFrameParameters,
            videoBufferHandler,
          });
          sendMessage('video.newVideoFrame', frameData);

          // Assert
          expect(videoBufferHandler).toHaveBeenCalledTimes(1);
          expect(videoBufferHandler.mock.lastCall[0]).toEqual({
            width: 30,
            height: 40,
            videoFrameBuffer: 101,
          });
        });

        it('should invoke video frame event handler and successfully send videoFrameProcessed', async () => {
          expect.assertions(6);

          // Arrange
          const videoBufferHandler: video.VideoBufferHandler = (_frame, onSuccess) => onSuccess();
          const reportStartFrameProcessingSpy = jest.spyOn(
            VideoPerformanceMonitor.prototype,
            'reportStartFrameProcessing',
          );
          const reportFrameProcessedSpy = jest.spyOn(VideoPerformanceMonitor.prototype, 'reportFrameProcessed');
          const startMonitorSlowFrameProcessingSpy = jest.spyOn(
            VideoPerformanceMonitor.prototype,
            'startMonitorSlowFrameProcessing',
          );

          // Act
          video.registerForVideoFrame({ ...registerForVideoFrameParameters, videoBufferHandler });
          const videoFrameMock = { width: 30, height: 40, data: 101, timestamp: 200 };
          sendMessage('video.newVideoFrame', videoFrameMock);

          // Assert
          expect(reportStartFrameProcessingSpy).toBeCalledWith(30, 40);
          expect(reportFrameProcessedSpy).toBeCalledTimes(1);
          expect(startMonitorSlowFrameProcessingSpy).toBeCalledTimes(1);
          const message = utils.findMessageByFunc('video.videoFrameProcessed');
          expect(message).not.toBeNull();
          expect(message?.args?.length).toBe(1);
          expect(message?.args?.[0]).toEqual(200);
        });

        it('should invoke video frame event handler and successfully send notifyError', async () => {
          expect.assertions(3);

          // Arrange
          const errorMessage = 'Error occurs when processing the video frame';
          const videoBufferHandler: video.VideoBufferHandler = (_frame, _onSuccess, onError) => onError(errorMessage);

          // Act
          video.registerForVideoFrame({
            ...registerForVideoFrameParameters,
            videoBufferHandler,
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
          const videoBufferHandler = jest.fn();

          // Act
          video.registerForVideoFrame({ ...registerForVideoFrameParameters, videoBufferHandler });
          sendMessage('video.newVideoFrame', undefined);

          // Assert
          expect(videoBufferHandler).not.toHaveBeenCalled();
        });
      });

      describe('mediaStream', () => {
        beforeEach(async () => {
          await utils.initializeWithContext(FrameContexts.sidePanel);
          utils.setRuntimeConfig({ apiVersion: 1, supports: { video: { mediaStream: true } } });
        });

        it('should successfully invoke videoFrameHandler', async () => {
          expect.assertions(3);

          // Arrange
          const videoFrameHandler = jest.fn();
          const reportStartFrameProcessingSpy = jest.spyOn(
            VideoPerformanceMonitor.prototype,
            'reportStartFrameProcessing',
          );
          const reportFrameProcessedSpy = jest.spyOn(VideoPerformanceMonitor.prototype, 'reportFrameProcessed');
          // Act
          video.registerForVideoFrame({
            ...registerForVideoFrameParameters,
            videoFrameHandler,
          });
          sendMessage('video.startVideoExtensibilityVideoStream', { streamId: 'stream id' });
          await utils.flushPromises();

          // Assert
          expect(reportStartFrameProcessingSpy).toBeCalledWith(100, 100);
          expect(reportFrameProcessedSpy).toBeCalledTimes(1);
          expect(videoFrameHandler).toHaveBeenCalledTimes(1);
        });

        it('should get and register stream with streamId received from startVideoExtensibilityVideoStream', async () => {
          expect.assertions(4);

          // Arrange
          const videoFrameHandler = jest.fn();
          const webview = window['chrome']['webview'] as unknown as {
            getTextureStream: jest.Mock;
            registerTextureStream: jest.Mock;
          };

          // Act
          video.registerForVideoFrame({
            ...registerForVideoFrameParameters,
            videoFrameHandler,
          });
          sendMessage('video.startVideoExtensibilityVideoStream', { streamId: 'stream id' });
          await utils.flushPromises();

          // Assert
          expect(webview.getTextureStream).toHaveBeenCalledTimes(1);
          expect(webview.getTextureStream.mock.lastCall[0]).toBe('stream id');
          expect(webview.registerTextureStream).toHaveBeenCalledTimes(1);
          expect(webview.registerTextureStream.mock.lastCall[0]).toBe('stream id');
        });

        it('should notify error when callback rejects', async () => {
          expect.assertions(3);

          // Arrange
          const errorMessage = 'error message';
          const videoFrameHandler = jest.fn().mockRejectedValue(errorMessage);

          // Act
          video.registerForVideoFrame({
            ...registerForVideoFrameParameters,
            videoFrameHandler,
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
        expect.assertions(6);

        // Arrange
        await utils.initializeWithContext(FrameContexts.sidePanel);
        const videoEffectCallBack = jest.fn().mockResolvedValue(undefined);
        const reportApplyingVideoEffectSpy = jest.spyOn(VideoPerformanceMonitor.prototype, 'reportApplyingVideoEffect');
        const reportVideoEffectChangedSpy = jest.spyOn(VideoPerformanceMonitor.prototype, 'reportVideoEffectChanged');

        // Act
        video.registerForVideoEffect(videoEffectCallBack);
        const effectId = 'sampleEffectId';
        sendMessage('video.effectParameterChange', effectId);

        // Assert
        expect(reportApplyingVideoEffectSpy).toHaveBeenCalledTimes(1);
        expect(reportApplyingVideoEffectSpy.mock.calls[0][0]).toEqual(effectId);
        expect(videoEffectCallBack).toHaveBeenCalledTimes(1);
        expect(videoEffectCallBack.mock.lastCall[0]).toEqual(effectId);
        await utils.flushPromises();
        expect(reportVideoEffectChangedSpy).toHaveBeenCalledTimes(1);
        expect(reportVideoEffectChangedSpy.mock.calls[0][0]).toEqual(effectId);
      });

      it('should invoke videoEffectReadiness handler on callback resolved', async () => {
        expect.assertions(4);

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
        expect(messageForRegister?.args?.length).toBe(4);
        expect(messageForRegister?.args?.[0]).toEqual(true);
        expect(messageForRegister?.args?.[1]).toEqual(effectId);
      });

      it('should invoke videoEffectReadiness handler on callback rejects', async () => {
        expect.assertions(5);

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
        expect(messageForRegister?.args?.length).toBe(4);
        expect(messageForRegister?.args?.[0]).toEqual(false);
        expect(messageForRegister?.args?.[1]).toEqual(effectId);
        expect(messageForRegister?.args?.[2]).toEqual('InvalidEffectId');
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
            videoBufferHandler: jest.fn(),
            videoFrameHandler: jest.fn(),
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

function mockMediaStreamAPI() {
  // Jest doesn't support MediaStream API yet, so we need to mock it.
  // Reference:
  //   https://stackoverflow.com/questions/57424190/referenceerror-mediastream-is-not-defined-in-unittest-with-jest
  //   https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom

  // eslint-disable-next-line strict-null-checks/all
  let transform;

  Object.defineProperty(window, 'MediaStream', {
    value: jest.fn().mockImplementation((tracks: MediaStreamTrack[]) => ({
      getVideoTracks: () => tracks,
    })),

    writable: true,
  });

  Object.defineProperty(window, 'MediaStreamTrack', {
    value: jest.fn().mockImplementation(() => ({})),
    writable: true,
  });

  Object.defineProperty(window, 'ReadableStream', {
    value: jest.fn().mockImplementation(() => ({
      pipeThrough: () => ({
        pipeTo: () =>
          transform &&
          transform(
            /* mock VideoFrame */
            {
              timestamp: 0,
              codedWidth: 100,
              codedHeight: 100,
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              close: () => {},
            },
            /* mock TransformStreamDefaultController */
            {
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              enqueue: () => {},
            },
          ),
      }),
    })),
    writable: true,
  });

  Object.defineProperty(window, 'WritableStream', {
    value: jest.fn().mockImplementation(() => ({})),
    writable: true,
  });

  Object.defineProperty(window, 'MediaStreamTrackProcessor', {
    value: jest.fn().mockImplementation(() => ({
      readable: new ReadableStream(),
    })),
    writable: true,
  });

  Object.defineProperty(window, 'MediaStreamTrackGenerator', {
    value: jest.fn().mockImplementation(() => ({
      writable: new WritableStream(),
    })),
    writable: true,
  });

  Object.defineProperty(window, 'TransformStream', {
    value: jest.fn().mockImplementation((transformer) => (transform = transformer.transform)),
    writable: true,
  });

  Object.defineProperty(window, 'chrome', {
    value: {
      webview: {
        getTextureStream: jest.fn(() => {
          const videoTrack = new MediaStreamTrack();
          const videoStream = new MediaStream([videoTrack]);
          return Promise.resolve(videoStream);
        }),
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        registerTextureStream: jest.fn(),
      },
    },
  });
}
