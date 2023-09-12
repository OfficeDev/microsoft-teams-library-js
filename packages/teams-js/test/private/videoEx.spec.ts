import { GlobalVars } from '../../src/internal/globalVars';
import { DOMMessageEvent, MessageRequest } from '../../src/internal/interfaces';
import { VideoPerformanceMonitor } from '../../src/internal/videoPerformanceMonitor';
import { videoEx } from '../../src/private/videoEx';
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
describe('videoEx', () => {
  describe('frameless', () => {
    let utils: Utils = new Utils();
    beforeEach(() => {
      utils = new Utils();
      utils.mockWindow.parent = undefined;
      app._initialize(utils.mockWindow);
      utils.messages = [];
      GlobalVars.isFramelessWindow = false;
    });
    afterEach(() => {
      app._uninitialize();
      GlobalVars.isFramelessWindow = false;
    });

    describe('registerForVideoFrame', () => {
      const emptyVideoFrameCallback = (
        _frame: videoEx.VideoBufferData,
        _notifyVideoFrameProcessed: () => void,
        _notifyError: (errorMessage: string) => void,
      ): void => {};
      const videoFrameConfig: videoEx.VideoFrameConfig = {
        format: video.VideoFrameFormat.NV12,
        requireCameraStream: false,
        audioInferenceModel: new ArrayBuffer(100),
      };

      const registerForVideoFrameParameters: videoEx.RegisterForVideoFrameParameters = {
        videoBufferHandler: (_bufferData, _onSuccess, _onError) => {},
        videoFrameHandler: (data) => Promise.resolve(data.videoFrame),
        config: videoFrameConfig,
      };

      const allowedContexts = [FrameContexts.sidePanel];
      Object.values(FrameContexts).forEach((context) => {
        if (!allowedContexts.some((allowedContext) => allowedContext === context)) {
          it('should not allow registerForVideoFrame calls from the wrong context', async () => {
            await utils.initializeWithContext(context);

            expect(() => videoEx.registerForVideoFrame(registerForVideoFrameParameters)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });

      it('should throw error when video is not supported in runtime config', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
        expect.assertions(1);
        try {
          videoEx.registerForVideoFrame(registerForVideoFrameParameters);
        } catch (e) {
          expect(e).toEqual(errorNotSupportedOnPlatform);
        }
      });

      it('should successfully send registerForVideoFrame message', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        videoEx.registerForVideoFrame(registerForVideoFrameParameters);
        const message = utils.findMessageByFunc('video.registerForVideoFrame') as MessageRequest;
        expect(message).not.toBeNull();
        expect(message?.args?.[0]).toHaveProperty('audioInferenceModel');
        expect(message?.args?.[0].format).toBe(video.VideoFrameFormat.NV12);
        expect(message?.args?.[0].requireCameraStream).toBe(false);
      });

      it('should not send default message when register video frame handler', async () => {
        await utils.initializeWithContext('sidePanel');
        videoEx.registerForVideoFrame(registerForVideoFrameParameters);
        const messageForRegister = utils.findMessageByFunc('registerHandler');
        expect(messageForRegister).toBeNull();
      });

      it('should successfully invoke video frame event handler', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        const reportStartFrameProcessingSpy = jest.spyOn(
          VideoPerformanceMonitor.prototype,
          'reportStartFrameProcessing',
        );
        const reportFrameProcessedSpy = jest.spyOn(VideoPerformanceMonitor.prototype, 'reportFrameProcessed');
        const startMonitorSlowFrameProcessingSpy = jest.spyOn(
          VideoPerformanceMonitor.prototype,
          'startMonitorSlowFrameProcessing',
        );
        let returnedVideoFrame: videoEx.VideoBufferData;
        let handlerInvoked = false;
        //callback
        const videoBufferCallback = (
          _videoBufferData: videoEx.VideoBufferData,
          _notifyVideoFrameProcessed: () => void,
          _notifyError: (errorMessage: string) => void,
        ): void => {
          handlerInvoked = true;
          returnedVideoFrame = _videoBufferData;
          _notifyVideoFrameProcessed();
        };
        videoEx.registerForVideoFrame({
          ...registerForVideoFrameParameters,
          videoBufferHandler: videoBufferCallback,
        });
        const videoFrameMock = {
          width: 30,
          height: 40,
          data: 101,
        };
        utils.respondToFramelessMessage({
          data: {
            func: 'video.newVideoFrame',
            args: [videoFrameMock],
          },
        } as DOMMessageEvent);
        expect(handlerInvoked).toBeTruthy();
        expect(returnedVideoFrame!).toEqual(videoFrameMock);
        expect(reportStartFrameProcessingSpy).toBeCalledWith(30, 40);
        expect(startMonitorSlowFrameProcessingSpy).toBeCalledTimes(1);
        expect(reportFrameProcessedSpy).toBeCalledTimes(1);
      });

      it('should invoke video frame event handler and successfully send videoFrameProcessed', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        const videoBufferCallback = (
          _videoBufferData: videoEx.VideoBufferData,
          _notifyVideoFrameProcessed: () => void,
          _notifyError: (errorMessage: string) => void,
        ): void => {
          _notifyVideoFrameProcessed();
        };

        videoEx.registerForVideoFrame({
          ...registerForVideoFrameParameters,
          videoBufferHandler: videoBufferCallback,
        });
        const videoFrameMock = {
          width: 30,
          height: 40,
          data: 101,
        };
        utils.respondToFramelessMessage({
          data: {
            func: 'video.newVideoFrame',
            args: [videoFrameMock],
          },
        } as DOMMessageEvent);
        const message = utils.findMessageByFunc('video.videoFrameProcessed');

        expect(message).not.toBeNull();
        expect(message?.args?.length).toBe(1);
      });

      it('should invoke video frame event handler and successfully send videoFrameProcessed with timestamp', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        const videoBufferCallback = (
          _frame: video.VideoFrame,
          _notifyVideoFrameProcessed: () => void,
          _notifyError: (errorMessage: string) => void,
        ): void => {
          _notifyVideoFrameProcessed();
        };

        videoEx.registerForVideoFrame({
          ...registerForVideoFrameParameters,
          videoBufferHandler: videoBufferCallback,
        });
        const videoFrameMock = {
          width: 30,
          height: 40,
          data: 101,
          timestamp: 200,
        };
        utils.respondToFramelessMessage({
          data: {
            func: 'video.newVideoFrame',
            args: [videoFrameMock],
          },
        } as DOMMessageEvent);
        const message = utils.findMessageByFunc('video.videoFrameProcessed');

        expect(message).not.toBeNull();
        expect(message?.args?.length).toBe(1);
        expect(message?.args?.[0]).toBe(200);
      });

      it('should invoke video frame event handler and successfully send notifyError', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        const errorMessage = 'Error occurs when processing the video frame';
        const videoBufferCallback = (
          _videoBufferData: videoEx.VideoBufferData,
          _notifyVideoFrameProcessed: () => void,
          _notifyError: (errorMessage: string) => void,
        ): void => {
          _notifyError(errorMessage);
        };

        videoEx.registerForVideoFrame({
          ...registerForVideoFrameParameters,
          videoBufferHandler: videoBufferCallback,
        });
        const videoFrameMock = {
          width: 30,
          height: 40,
          data: 101,
        };
        utils.respondToFramelessMessage({
          data: {
            func: 'video.newVideoFrame',
            args: [videoFrameMock],
          },
        } as DOMMessageEvent);
        const message = utils.findMessageByFunc('video.notifyError');

        expect(message).not.toBeNull();
        expect(message?.args?.length).toBe(2);
        expect(message?.args?.[0]).toEqual(errorMessage);
        expect(message?.args?.[1]).toEqual(videoEx.ErrorLevel.Warn);
      });

      it('should not invoke video frame event handler when videoFrame is undefined', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        let handlerInvoked = false;
        const videoBufferCallback = (
          _videoBufferData: videoEx.VideoBufferData,
          _notifyVideoFrameProcessed: () => void,
          _notifyError: (errorMessage: string) => void,
        ): void => {
          handlerInvoked = true;
        };
        videoEx.registerForVideoFrame({
          ...registerForVideoFrameParameters,
          videoBufferHandler: videoBufferCallback,
        });
        utils.respondToFramelessMessage({
          data: {
            func: 'video.newVideoFrame',
            args: [undefined],
          },
        } as DOMMessageEvent);
        expect(handlerInvoked).toBe(false);
      });

      it('should listen to video.setFrameProcessTimeLimit', async () => {
        expect.assertions(2);
        await utils.initializeWithContext(FrameContexts.sidePanel);
        const setFrameProcessTimeLimitSpy = jest.spyOn(VideoPerformanceMonitor.prototype, 'setFrameProcessTimeLimit');
        // Act
        videoEx.registerForVideoFrame(registerForVideoFrameParameters);
        utils.respondToFramelessMessage({
          data: {
            func: 'video.setFrameProcessTimeLimit',
            args: [100],
          },
        } as DOMMessageEvent);

        // Assert
        expect(setFrameProcessTimeLimitSpy).toBeCalledTimes(1);
        expect(setFrameProcessTimeLimitSpy.mock.calls[0][0]).toEqual(100);
      });

      describe('mediaStream', () => {
        let restoreMediaStreamAPI: () => void;
        beforeEach(async () => {
          await utils.initializeWithContext(FrameContexts.sidePanel);
          utils.setRuntimeConfig({ apiVersion: 1, supports: { video: { mediaStream: true } } });
        });
        beforeAll(() => {
          restoreMediaStreamAPI = mockMediaStreamAPI();
        });
        afterAll(() => {
          restoreMediaStreamAPI();
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
          videoEx.registerForVideoFrame({
            ...registerForVideoFrameParameters,
            videoFrameHandler,
          });
          utils.respondToFramelessMessage({
            data: {
              func: 'video.startVideoExtensibilityVideoStream',
              args: [{ streamId: 'stream id' }],
            },
          } as DOMMessageEvent);
          await utils.flushPromises();

          // Assert
          expect(reportStartFrameProcessingSpy).toBeCalledWith(100, 100);
          expect(reportFrameProcessedSpy).toBeCalledTimes(1);
          expect(videoFrameHandler).toHaveBeenCalledTimes(1);
        });

        it('should register for audioInferenceDiscardStatusChange and get and register stream with streamId received from startVideoExtensibilityVideoStream', async () => {
          expect.assertions(6);

          // Arrange
          const videoFrameHandler = jest.fn();
          const webview = window['chrome']['webview'] as unknown as {
            getTextureStream: jest.Mock;
            registerTextureStream: jest.Mock;
          };

          // Act
          videoEx.registerForVideoFrame({
            ...registerForVideoFrameParameters,
            videoFrameHandler,
          });
          utils.respondToFramelessMessage({
            data: {
              func: 'video.startVideoExtensibilityVideoStream',
              args: [{ streamId: 'stream id', metadataInTexture: true }],
            },
          } as DOMMessageEvent);
          await utils.flushPromises();

          // Assert
          expect(webview.getTextureStream).toHaveBeenCalledTimes(1);
          expect(webview.getTextureStream.mock.lastCall[0]).toBe('stream id');
          expect(webview.registerTextureStream).toHaveBeenCalledTimes(1);
          expect(webview.registerTextureStream.mock.lastCall[0]).toBe('stream id');
          const msgRegisterAudioInferenceDiscardStatusChange = utils.findMessageByFunc('registerHandler');
          expect(msgRegisterAudioInferenceDiscardStatusChange).not.toBeNull();
          expect(msgRegisterAudioInferenceDiscardStatusChange?.args?.[0]).toBe(
            'video.mediaStream.audioInferenceDiscardStatusChange',
          );
        });

        it('should get and register stream with streamId received from startVideoExtensibilityVideoStream', async () => {
          expect.assertions(5);

          // Arrange
          const videoFrameHandler = jest.fn();
          const webview = window['chrome']['webview'] as unknown as {
            getTextureStream: jest.Mock;
            registerTextureStream: jest.Mock;
          };

          // Act
          videoEx.registerForVideoFrame({
            ...registerForVideoFrameParameters,
            videoFrameHandler,
          });
          utils.respondToFramelessMessage({
            data: {
              func: 'video.startVideoExtensibilityVideoStream',
              args: [{ streamId: 'stream id' }],
            },
          } as DOMMessageEvent);
          await utils.flushPromises();

          // Assert
          expect(webview.getTextureStream).toHaveBeenCalledTimes(1);
          expect(webview.getTextureStream.mock.lastCall[0]).toBe('stream id');
          expect(webview.registerTextureStream).toHaveBeenCalledTimes(1);
          expect(webview.registerTextureStream.mock.lastCall[0]).toBe('stream id');
          // no registerHandler message for audioInferenceDiscardStatusChange
          expect(utils.findMessageByFunc('registerHandler')).toBeNull();
        });

        it('should notify error when callback rejects', async () => {
          expect.assertions(4);

          // Arrange
          const errorMessage = 'error message';
          const videoFrameHandler = jest.fn().mockRejectedValue(errorMessage);

          // Act
          videoEx.registerForVideoFrame({
            ...registerForVideoFrameParameters,
            videoFrameHandler,
          });
          utils.respondToFramelessMessage({
            data: {
              func: 'video.startVideoExtensibilityVideoStream',
              args: [{ streamId: 'stream id' }],
            },
          } as DOMMessageEvent);
          await utils.flushPromises();

          // Assert
          const message = utils.findMessageByFunc('video.notifyError');
          expect(message).not.toBeNull();
          expect(message?.args?.length).toBe(2);
          expect(message?.args?.[0]).toEqual(errorMessage);
          expect(message?.args?.[1]).toEqual(videoEx.ErrorLevel.Warn);
        });
      });
    });

    describe('notifySelectedVideoEffectChanged', () => {
      const effectChangeType = video.EffectChangeType.EffectChanged;
      const effectId = 'effectId';

      const allowedContexts = [FrameContexts.sidePanel];
      Object.values(FrameContexts).forEach((context) => {
        if (!allowedContexts.some((allowedContext) => allowedContext === context)) {
          it('should not allow notifySelectedVideoEffectChanged calls from the wrong context', async () => {
            await utils.initializeWithContext(context);

            expect(() => videoEx.notifySelectedVideoEffectChanged(effectChangeType, effectId)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });

      it('should throw error when video is not supported in runtime config', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);

        utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
        expect.assertions(1);
        try {
          videoEx.notifySelectedVideoEffectChanged(effectChangeType, effectId);
        } catch (e) {
          expect(e).toEqual(errorNotSupportedOnPlatform);
        }
      });

      it('should successfully send notifySelectedVideoEffectChanged message', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        videoEx.notifySelectedVideoEffectChanged(effectChangeType, effectId);
        const message = utils.findMessageByFunc('video.videoEffectChanged');
        expect(message).not.toBeNull();
        expect(message?.args?.length).toBe(3);
        expect(message?.args).toStrictEqual([effectChangeType, effectId, null]);
      });
    });

    describe('registerForVideoEffect', () => {
      const allowedContexts = [FrameContexts.sidePanel];
      Object.values(FrameContexts).forEach((context) => {
        if (!allowedContexts.some((allowedContext) => allowedContext === context)) {
          it('should not allow registerForVideoEffect calls from the wrong context', async () => {
            await utils.initializeWithContext(context);

            // eslint-disable-next-line @typescript-eslint/no-empty-function
            expect(() => videoEx.registerForVideoEffect(() => Promise.resolve())).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });

      it('should throw error when video is not supported in runtime config', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);

        utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
        expect.assertions(1);
        try {
          videoEx.registerForVideoEffect(() => Promise.resolve());
        } catch (e) {
          expect(e).toEqual(errorNotSupportedOnPlatform);
        }
      });

      it('should successfully register effectParameterChange', async () => {
        await utils.initializeWithContext('sidePanel');

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        videoEx.registerForVideoEffect(() => Promise.resolve());

        expect(utils.findMessageByFunc('registerHandler')).toBeNull();
        const messageForRegister = utils.findMessageByFunc('video.registerForVideoEffect');
        expect(messageForRegister?.args?.length).toBe(0);
      });

      it('should successfully invoke effectParameterChange handler', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        let returnedEffectId: string | undefined;
        let returnedEffectParam: string | undefined;
        let handlerInvoked = false;
        const videoEffectCallBack = (effectId: string | undefined, effectParam?: string): Promise<void> => {
          handlerInvoked = true;
          returnedEffectId = effectId;
          returnedEffectParam = effectParam;
          return Promise.resolve();
        };

        videoEx.registerForVideoEffect(videoEffectCallBack);
        const effectId = 'sampleEffectId';
        const effectParameter = 'sampleEffectParameter';
        utils.respondToFramelessMessage({
          data: {
            func: 'video.effectParameterChange',
            args: [effectId, effectParameter],
          },
        } as DOMMessageEvent);
        expect(returnedEffectId).toEqual(effectId);
        expect(returnedEffectParam).toEqual(effectParameter);
        expect(handlerInvoked).toBeTruthy();
      });

      it('should invoke videoEffectReadiness handler on callback resolved', async () => {
        expect.assertions(3);

        // Arrange
        await utils.initializeWithContext(FrameContexts.sidePanel);
        const videoEffectCallBack = jest.fn().mockResolvedValue(undefined);

        // Act
        videoEx.registerForVideoEffect(videoEffectCallBack);
        const effectId = 'sampleEffectId';
        const effectParameter = 'sampleEffectParameter';
        utils.respondToFramelessMessage({
          data: {
            func: 'video.effectParameterChange',
            args: [effectId, effectParameter],
          },
        } as DOMMessageEvent);
        await videoEffectCallBack.mock.results[0].value;

        // Assert
        const messageForRegister = utils.findMessageByFunc('video.videoEffectReadiness');
        expect(messageForRegister).not.toBeNull();
        expect(messageForRegister?.args?.length).toBe(4);
        expect(messageForRegister?.args).toEqual([true, effectId, null, effectParameter]);
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
        const effectParameter = 'sampleEffectParameter';
        utils.respondToFramelessMessage({
          data: {
            func: 'video.effectParameterChange',
            args: [effectId, effectParameter],
          },
        } as DOMMessageEvent);
        await videoEffectCallBack.mock.results[0].value.catch(() => {});

        // Assert
        const messageForRegister = utils.findMessageByFunc('video.videoEffectReadiness');
        expect(messageForRegister).not.toBeNull();
        expect(messageForRegister?.args?.length).toBe(4);
        expect(messageForRegister?.args).toEqual([false, effectId, 'InvalidEffectId', effectParameter]);
      });
    });

    describe('updatePersonalizedEffects', () => {
      const allowedContexts = [FrameContexts.sidePanel];
      const personalizedEffects: videoEx.PersonalizedEffect[] = [
        { name: 'e1', id: '1', type: 'background', thumbnail: 'mockthumbnail' },
      ];
      Object.values(FrameContexts).forEach((context) => {
        if (!allowedContexts.some((allowedContext) => allowedContext === context)) {
          it('should not allow updatePersonalizedEffects calls from the wrong context', async () => {
            await utils.initializeWithContext(context);
            expect(() => videoEx.updatePersonalizedEffects(personalizedEffects)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });

      it('should throw error when video is not supported in runtime config', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
        expect.assertions(1);
        try {
          videoEx.updatePersonalizedEffects(personalizedEffects);
        } catch (e) {
          expect(e).toEqual(errorNotSupportedOnPlatform);
        }
      });

      it('should successfully send PersonalizedEffects', async () => {
        await utils.initializeWithContext('sidePanel');
        videoEx.updatePersonalizedEffects(personalizedEffects);
        const message = utils.findMessageByFunc('video.personalizedEffectsChanged');
        expect(message?.args?.length).toBe(1);
        expect(message?.args?.[0]).toEqual(personalizedEffects);
      });
    });

    describe('isSupported', () => {
      it('should not be supported before initialization', () => {
        utils.uninitializeRuntimeConfig();
        expect(() => videoEx.isSupported()).toThrowError('The library has not yet been initialized');
      });
    });

    describe('notifyFatalError', () => {
      it('should not be supported before initialization', () => {
        utils.uninitializeRuntimeConfig();
        expect(() => videoEx.notifyFatalError('')).toThrowError('The library has not yet been initialized');
      });

      it('should send error to host successfully', async () => {
        await utils.initializeWithContext('sidePanel');
        const fakeErrorMsg = 'fake error';
        videoEx.notifyFatalError(fakeErrorMsg);
        const message = utils.findMessageByFunc('video.notifyError');
        expect(message?.args?.length).toBe(2);
        expect(message?.args?.[0]).toEqual(fakeErrorMsg);
        expect(message?.args?.[1]).toEqual(videoEx.ErrorLevel.Fatal);
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

    describe('registerForVideoFrame', () => {
      const emptyVideoFrameCallback = (
        _videoBufferData: videoEx.VideoBufferData,
        _notifyVideoFrameProcessed: () => void,
        _notifyError: (errorMessage: string) => void,
      ): void => {};
      const videoFrameConfig: videoEx.VideoFrameConfig = {
        format: video.VideoFrameFormat.NV12,
        requireCameraStream: false,
        audioInferenceModel: new ArrayBuffer(100),
      };
      const registerForVideoFrameParameters: videoEx.RegisterForVideoFrameParameters = {
        videoBufferHandler: (_bufferData, _onSuccess, _onError) => {},
        videoFrameHandler: (data) => Promise.resolve(data.videoFrame),
        config: videoFrameConfig,
      };

      const allowedContexts = [FrameContexts.sidePanel];
      Object.values(FrameContexts).forEach((context) => {
        if (!allowedContexts.some((allowedContext) => allowedContext === context)) {
          it('should not allow registerForVideoFrame calls from the wrong context', async () => {
            await utils.initializeWithContext(context);

            expect(() => videoEx.registerForVideoFrame(registerForVideoFrameParameters)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });

      it('should throw error when video is not supported in runtime config', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
        expect.assertions(1);
        try {
          videoEx.registerForVideoFrame(registerForVideoFrameParameters);
        } catch (e) {
          expect(e).toEqual(errorNotSupportedOnPlatform);
        }
      });

      it('should successfully send registerForVideoFrame message', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        videoEx.registerForVideoFrame(registerForVideoFrameParameters);
        const message = utils.findMessageByFunc('video.registerForVideoFrame');
        expect(message).not.toBeNull();
        expect(message?.args?.length).toBe(1);
        expect(message?.args?.[0]).toEqual(videoFrameConfig);
      });

      it('should not send default message when register video frame handler', async () => {
        await utils.initializeWithContext('sidePanel');
        videoEx.registerForVideoFrame(registerForVideoFrameParameters);
        const messageForRegister = utils.findMessageByFunc('registerHandler');
        expect(messageForRegister).toBeNull();
      });

      it('should successfully invoke video frame event handler', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        let returnedVideoFrame: videoEx.VideoBufferData;
        let handlerInvoked = false;

        const videoBufferCallback = (
          _videoBufferData: videoEx.VideoBufferData,
          _notifyVideoFrameProcessed: () => void,
          _notifyError: (errorMessage: string) => void,
        ): void => {
          handlerInvoked = true;
          returnedVideoFrame = _videoBufferData;
        };

        videoEx.registerForVideoFrame({
          ...registerForVideoFrameParameters,
          videoBufferHandler: videoBufferCallback,
        });
        const videoFrameMock = {
          width: 30,
          height: 40,
          data: 101,
        };
        utils.sendMessage('video.newVideoFrame', videoFrameMock);
        expect(returnedVideoFrame!).toEqual(videoFrameMock);
        expect(handlerInvoked).toBeTruthy();
      });

      it('should invoke video frame event handler and successfully send videoFrameProcessed', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        const videoBufferCallback = (
          _videoBufferData: videoEx.VideoBufferData,
          _notifyVideoFrameProcessed: () => void,
          _notifyError: (errorMessage: string) => void,
        ): void => {
          _notifyVideoFrameProcessed();
        };

        videoEx.registerForVideoFrame({
          ...registerForVideoFrameParameters,
          videoBufferHandler: videoBufferCallback,
        });
        const videoFrameMock = {
          width: 30,
          height: 40,
          data: 101,
        };
        utils.sendMessage('video.newVideoFrame', videoFrameMock);
        const message = utils.findMessageByFunc('video.videoFrameProcessed');

        expect(message).not.toBeNull();
        expect(message?.args?.length).toBe(1);
        expect(message?.args?.[0]).toBeUndefined();
      });

      it('should invoke video frame event handler and successfully send videoFrameProcessed with timestamp', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        const videoBufferCallback = (
          _frame: video.VideoFrame,
          _notifyVideoFrameProcessed: () => void,
          _notifyError: (errorMessage: string) => void,
        ): void => {
          _notifyVideoFrameProcessed();
        };

        videoEx.registerForVideoFrame({
          ...registerForVideoFrameParameters,
          videoBufferHandler: videoBufferCallback,
        });
        const videoFrameMock = {
          width: 30,
          height: 40,
          data: 101,
          timestamp: 200,
        };
        utils.sendMessage('video.newVideoFrame', videoFrameMock);
        const message = utils.findMessageByFunc('video.videoFrameProcessed');

        expect(message).not.toBeNull();
        expect(message?.args?.length).toBe(1);
        expect(message?.args?.[0]).toBe(200);
      });

      it('should invoke video frame event handler and successfully send notifyError', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        const errorMessage = 'Error occurs when processing the video frame';
        const videoBufferCallback = (
          _videoBufferData: videoEx.VideoBufferData,
          _notifyVideoFrameProcessed: () => void,
          _notifyError: (errorMessage: string) => void,
        ): void => {
          _notifyError(errorMessage);
        };

        videoEx.registerForVideoFrame({
          ...registerForVideoFrameParameters,
          videoBufferHandler: videoBufferCallback,
        });
        const videoFrameMock = {
          width: 30,
          height: 40,
          data: 101,
        };
        utils.sendMessage('video.newVideoFrame', videoFrameMock);
        const message = utils.findMessageByFunc('video.notifyError');

        expect(message).not.toBeNull();
        expect(message?.args?.length).toBe(2);
        expect(message?.args?.[0]).toEqual(errorMessage);
        expect(message?.args?.[1]).toEqual(videoEx.ErrorLevel.Warn);
      });

      it('should not invoke video frame event handler when videoFrame is undefined', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        let handlerInvoked = false;
        const videoBufferCallback = (
          _videoBufferData: videoEx.VideoBufferData,
          _notifyVideoFrameProcessed: () => void,
          _notifyError: (errorMessage: string) => void,
        ): void => {
          handlerInvoked = true;
        };
        videoEx.registerForVideoFrame({
          ...registerForVideoFrameParameters,
          videoBufferHandler: videoBufferCallback,
        });
        utils.sendMessage('video.newVideoFrame', undefined);
        expect(handlerInvoked).toBe(false);
      });

      describe('mediaStream', () => {
        let restoreMediaStreamAPI: () => void;
        beforeEach(async () => {
          await utils.initializeWithContext(FrameContexts.sidePanel);
          utils.setRuntimeConfig({ apiVersion: 1, supports: { video: { mediaStream: true } } });
        });
        beforeAll(() => {
          restoreMediaStreamAPI = mockMediaStreamAPI();
        });
        afterAll(() => {
          restoreMediaStreamAPI();
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
          videoEx.registerForVideoFrame({
            ...registerForVideoFrameParameters,
            videoFrameHandler,
          });
          utils.sendMessage('video.startVideoExtensibilityVideoStream', { streamId: 'stream id' });
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
          videoEx.registerForVideoFrame({
            ...registerForVideoFrameParameters,
            videoFrameHandler,
          });
          utils.sendMessage('video.startVideoExtensibilityVideoStream', { streamId: 'stream id' });
          await utils.flushPromises();

          // Assert
          expect(webview.getTextureStream).toHaveBeenCalledTimes(1);
          expect(webview.getTextureStream.mock.lastCall[0]).toBe('stream id');
          expect(webview.registerTextureStream).toHaveBeenCalledTimes(1);
          expect(webview.registerTextureStream.mock.lastCall[0]).toBe('stream id');
        });

        it('should notify error when callback rejects', async () => {
          expect.assertions(4);

          // Arrange
          const errorMessage = 'error message';
          const videoFrameHandler = jest.fn().mockRejectedValue(errorMessage);

          // Act
          videoEx.registerForVideoFrame({
            ...registerForVideoFrameParameters,
            videoFrameHandler,
          });
          utils.sendMessage('video.startVideoExtensibilityVideoStream', { streamId: 'stream id' });
          await utils.flushPromises();

          // Assert
          const message = utils.findMessageByFunc('video.notifyError');
          expect(message).not.toBeNull();
          expect(message?.args?.length).toBe(2);
          expect(message?.args?.[0]).toEqual(errorMessage);
          expect(message?.args?.[1]).toEqual(videoEx.ErrorLevel.Warn);
        });
      });
    });

    describe('notifySelectedVideoEffectChanged', () => {
      const effectChangeType = video.EffectChangeType.EffectChanged;
      const effectId = 'effectId';

      const allowedContexts = [FrameContexts.sidePanel];
      Object.values(FrameContexts).forEach((context) => {
        if (!allowedContexts.some((allowedContext) => allowedContext === context)) {
          it('should not allow notifySelectedVideoEffectChanged calls from the wrong context', async () => {
            await utils.initializeWithContext(context);

            expect(() => videoEx.notifySelectedVideoEffectChanged(effectChangeType, effectId)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });

      it('should throw error when video is not supported in runtime config', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
        expect.assertions(1);
        try {
          videoEx.notifySelectedVideoEffectChanged(effectChangeType, effectId);
        } catch (e) {
          expect(e).toEqual(errorNotSupportedOnPlatform);
        }
      });

      it('should successfully send notifySelectedVideoEffectChanged message', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        videoEx.notifySelectedVideoEffectChanged(effectChangeType, effectId);
        const message = utils.findMessageByFunc('video.videoEffectChanged');
        expect(message).not.toBeNull();
        expect(message?.args?.length).toBe(3);
        expect(message?.args).toStrictEqual([effectChangeType, effectId, undefined]);
      });
    });

    describe('registerForVideoEffect', () => {
      const allowedContexts = [FrameContexts.sidePanel];
      Object.values(FrameContexts).forEach((context) => {
        if (!allowedContexts.some((allowedContext) => allowedContext === context)) {
          it('should not allow registerForVideoEffect calls from the wrong context', async () => {
            await utils.initializeWithContext(context);

            // eslint-disable-next-line @typescript-eslint/no-empty-function
            expect(() => videoEx.registerForVideoEffect(() => Promise.resolve())).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });

      it('should throw error when video is not supported in runtime config', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
        expect.assertions(1);
        try {
          videoEx.registerForVideoEffect(() => Promise.resolve());
        } catch (e) {
          expect(e).toEqual(errorNotSupportedOnPlatform);
        }
      });

      it('should successfully register effectParameterChange', async () => {
        await utils.initializeWithContext('sidePanel');

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        videoEx.registerForVideoEffect(() => Promise.resolve());

        expect(utils.findMessageByFunc('registerHandler')).toBeNull();
        const messageForRegister = utils.findMessageByFunc('video.registerForVideoEffect');
        expect(messageForRegister?.args?.length).toBe(0);
      });

      it('should successfully invoke effectParameterChange handler', async () => {
        expect.assertions(3);
        await utils.initializeWithContext(FrameContexts.sidePanel);
        let returnedEffectId: string | undefined;
        let returnedEffectParameter: string | undefined;
        let handlerInvoked = false;
        const videoEffectCallBack = (effectId: string | undefined, effectParam?: string): Promise<void> => {
          handlerInvoked = true;
          returnedEffectId = effectId;
          returnedEffectParameter = effectParam;
          return Promise.resolve();
        };

        videoEx.registerForVideoEffect(videoEffectCallBack);
        const effectId = 'sampleEffectId';
        const effectParameter = 'sampleEffectParameter';
        utils.sendMessage('video.effectParameterChange', effectId, effectParameter);
        expect(returnedEffectId).toEqual(effectId);
        expect(returnedEffectParameter).toEqual(effectParameter);
        expect(handlerInvoked).toBeTruthy();
      });

      it('should invoke videoEffectReadiness handler on callback resolved', async () => {
        expect.assertions(3);

        // Arrange
        await utils.initializeWithContext(FrameContexts.sidePanel);
        const videoEffectCallBack = jest.fn().mockResolvedValue(undefined);

        // Act
        videoEx.registerForVideoEffect(videoEffectCallBack);
        const effectId = 'sampleEffectId';
        const effectParameter = 'sampleEffectParameter';
        utils.sendMessage('video.effectParameterChange', effectId, effectParameter);
        await videoEffectCallBack.mock.results[0].value;

        // Assert
        const messageForRegister = utils.findMessageByFunc('video.videoEffectReadiness');
        expect(messageForRegister).not.toBeNull();
        expect(messageForRegister?.args?.length).toBe(4);
        expect(messageForRegister?.args).toEqual([true, effectId, undefined, effectParameter]);
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
        const effectParameter = 'sampleEffectParameter';
        utils.sendMessage('video.effectParameterChange', effectId, effectParameter);
        await videoEffectCallBack.mock.results[0].value.catch(() => {});

        // Assert
        const messageForRegister = utils.findMessageByFunc('video.videoEffectReadiness');
        expect(messageForRegister).not.toBeNull();
        expect(messageForRegister?.args?.length).toBe(4);
        expect(messageForRegister?.args).toEqual([false, effectId, 'InvalidEffectId', effectParameter]);
      });
    });

    describe('updatePersonalizedEffects', () => {
      const allowedContexts = [FrameContexts.sidePanel];
      const personalizedEffects: videoEx.PersonalizedEffect[] = [
        { name: 'e1', id: '1', type: 'background', thumbnail: 'mockthumbnail' },
      ];
      Object.values(FrameContexts).forEach((context) => {
        if (!allowedContexts.some((allowedContext) => allowedContext === context)) {
          it('should not allow updatePersonalizedEffects calls from the wrong context', async () => {
            await utils.initializeWithContext(context);
            expect(() => videoEx.updatePersonalizedEffects(personalizedEffects)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });

      it('should throw error when video is not supported in runtime config', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
        expect.assertions(1);
        try {
          videoEx.updatePersonalizedEffects(personalizedEffects);
        } catch (e) {
          expect(e).toEqual(errorNotSupportedOnPlatform);
        }
      });

      it('should successfully send PersonalizedEffects', async () => {
        await utils.initializeWithContext('sidePanel');
        videoEx.updatePersonalizedEffects(personalizedEffects);
        const message = utils.findMessageByFunc('video.personalizedEffectsChanged');
        expect(message?.args?.length).toBe(1);
        expect(message?.args?.[0]).toEqual(personalizedEffects);
      });
    });
    describe('notifyFatalError', () => {
      it('should not be supported before initialization', () => {
        utils.uninitializeRuntimeConfig();
        expect(() => videoEx.notifyFatalError('')).toThrowError('The library has not yet been initialized');
      });

      it('should send error to host successfully', async () => {
        await utils.initializeWithContext('sidePanel');
        const fakeErrorMsg = 'fake error';
        videoEx.notifyFatalError(fakeErrorMsg);
        const message = utils.findMessageByFunc('video.notifyError');
        expect(message?.args?.length).toBe(2);
        expect(message?.args?.[0]).toEqual(fakeErrorMsg);
        expect(message?.args?.[1]).toEqual(videoEx.ErrorLevel.Fatal);
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

  const originalMediaStream = window['MediaStream'];

  Object.defineProperty(window, 'MediaStream', {
    value: jest.fn().mockImplementation((tracks: MediaStreamTrack[]) => ({
      getVideoTracks: () => tracks,
    })),

    writable: true,
  });

  const originalMediaStreamTrack = window['MediaStreamTrack'];

  Object.defineProperty(window, 'MediaStreamTrack', {
    value: jest.fn().mockImplementation(() => ({})),
    writable: true,
  });

  const originalReadableStream = window['ReadableStream'];

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

  const originalWritableStream = window['WritableStream'];

  Object.defineProperty(window, 'WritableStream', {
    value: jest.fn().mockImplementation(() => ({})),
    writable: true,
  });

  const originalMediaStreamTrackProcessor = window['MediaStreamTrackProcessor'];

  Object.defineProperty(window, 'MediaStreamTrackProcessor', {
    value: jest.fn().mockImplementation(() => ({
      readable: new ReadableStream(),
    })),
    writable: true,
  });

  const originalMediaStreamTrackGenerator = window['MediaStreamTrackGenerator'];

  Object.defineProperty(window, 'MediaStreamTrackGenerator', {
    value: jest.fn().mockImplementation(() => ({
      writable: new WritableStream(),
    })),
    writable: true,
  });

  const originalTransformStream = window['TransformStream'];

  Object.defineProperty(window, 'TransformStream', {
    value: jest.fn().mockImplementation((transformer) => (transform = transformer.transform)),
    writable: true,
  });

  const originalChrome = window['chrome'];

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
    writable: true,
  });

  // restore original APIs
  return () => {
    Object.defineProperties(window, {
      MediaStream: {
        value: originalMediaStream,
        writable: true,
      },
      MediaStreamTrack: {
        value: originalMediaStreamTrack,
        writable: true,
      },
      ReadableStream: {
        value: originalReadableStream,
        writable: true,
      },
      WritableStream: {
        value: originalWritableStream,
        writable: true,
      },
      MediaStreamTrackProcessor: {
        value: originalMediaStreamTrackProcessor,
        writable: true,
      },
      MediaStreamTrackGenerator: {
        value: originalMediaStreamTrackGenerator,
        writable: true,
      },
      TransformStream: {
        value: originalTransformStream,
        writable: true,
      },
      chrome: {
        value: originalChrome,
        writable: true,
      },
    });
  };
}
