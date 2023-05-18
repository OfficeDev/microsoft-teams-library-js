import { GlobalVars } from '../../src/internal/globalVars';
import { DOMMessageEvent, MessageRequest } from '../../src/internal/interfaces';
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
        _frame: videoEx.VideoFrame,
        _notifyVideoFrameProcessed: () => void,
        _notifyError: (errorMessage: string) => void,
      ): void => {};
      const videoFrameConfig: videoEx.VideoFrameConfig = {
        format: video.VideoFrameFormat.NV12,
        requireCameraStream: false,
        audioInferenceModel: new ArrayBuffer(100),
      };

      const allowedContexts = [FrameContexts.sidePanel];
      Object.values(FrameContexts).forEach((context) => {
        if (!allowedContexts.some((allowedContext) => allowedContext === context)) {
          it('should not allow registerForVideoFrame calls from the wrong context', async () => {
            await utils.initializeWithContext(context);

            expect(() =>
              videoEx.registerForVideoFrame({
                videoBufferHandler: emptyVideoFrameCallback,
                config: videoFrameConfig,
              }),
            ).toThrowError(
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
          videoEx.registerForVideoFrame({
            videoBufferHandler: emptyVideoFrameCallback,
            config: videoFrameConfig,
          });
        } catch (e) {
          expect(e).toEqual(errorNotSupportedOnPlatform);
        }
      });

      it('should successfully send registerForVideoFrame message', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        videoEx.registerForVideoFrame({
          videoBufferHandler: emptyVideoFrameCallback,
          config: videoFrameConfig,
        });
        const message = utils.findMessageByFunc('video.registerForVideoFrame') as MessageRequest;
        expect(message).not.toBeNull();
        expect(message.args[0]).toHaveProperty('audioInferenceModel');
        expect(message.args[0].format).toBe(video.VideoFrameFormat.NV12);
        expect(message.args[0].requireCameraStream).toBe(false);
      });

      it('should not send default message when register video frame handler', async () => {
        await utils.initializeWithContext('sidePanel');
        videoEx.registerForVideoFrame({
          videoBufferHandler: emptyVideoFrameCallback,
          config: videoFrameConfig,
        });
        const messageForRegister = utils.findMessageByFunc('registerHandler');
        expect(messageForRegister).toBeNull();
      });

      it('should successfully invoke video frame event handler', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        let returnedVideoFrame: videoEx.VideoFrame;
        let handlerInvoked = false;
        //callback
        const videoFrameCallback = (
          _frame: videoEx.VideoFrame,
          _notifyVideoFrameProcessed: () => void,
          _notifyError: (errorMessage: string) => void,
        ): void => {
          handlerInvoked = true;
          returnedVideoFrame = _frame;
        };
        videoEx.registerForVideoFrame({
          videoBufferHandler: videoFrameCallback,
          config: videoFrameConfig,
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
        expect(returnedVideoFrame).toEqual(videoFrameMock);
      });

      it('should invoke video frame event handler and successfully send videoFrameProcessed', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        const videoFrameCallback = (
          _frame: videoEx.VideoFrame,
          _notifyVideoFrameProcessed: () => void,
          _notifyError: (errorMessage: string) => void,
        ): void => {
          _notifyVideoFrameProcessed();
        };

        videoEx.registerForVideoFrame({
          videoBufferHandler: videoFrameCallback,
          config: videoFrameConfig,
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
        expect(message.args.length).toBe(1);
      });

      it('should invoke video frame event handler and successfully send videoFrameProcessed with timestamp', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        const videoFrameCallback = (
          _frame: video.VideoFrame,
          _notifyVideoFrameProcessed: () => void,
          _notifyError: (errorMessage: string) => void,
        ): void => {
          _notifyVideoFrameProcessed();
        };

        videoEx.registerForVideoFrame({
          videoBufferHandler: videoFrameCallback,
          config: videoFrameConfig,
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
        expect(message.args.length).toBe(1);
        expect(message.args[0]).toBe(200);
      });

      it('should invoke video frame event handler and successfully send notifyError', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        const errorMessage = 'Error occurs when processing the video frame';
        const videoFrameCallback = (
          _frame: videoEx.VideoFrame,
          _notifyVideoFrameProcessed: () => void,
          _notifyError: (errorMessage: string) => void,
        ): void => {
          _notifyError(errorMessage);
        };

        videoEx.registerForVideoFrame({
          videoBufferHandler: videoFrameCallback,
          config: videoFrameConfig,
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
        expect(message.args.length).toBe(2);
        expect(message.args[0]).toEqual(errorMessage);
        expect(message.args[1]).toEqual(videoEx.ErrorLevel.Warn);
      });

      it('should not invoke video frame event handler when videoFrame is undefined', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        let handlerInvoked = false;
        const videoFrameCallback = (
          _frame: videoEx.VideoFrame,
          _notifyVideoFrameProcessed: () => void,
          _notifyError: (errorMessage: string) => void,
        ): void => {
          handlerInvoked = true;
        };
        videoEx.registerForVideoFrame({
          videoBufferHandler: videoFrameCallback,
          config: videoFrameConfig,
        });
        utils.respondToFramelessMessage({
          data: {
            func: 'video.newVideoFrame',
            args: [undefined],
          },
        } as DOMMessageEvent);
        expect(handlerInvoked).toBe(false);
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
        expect(message.args.length).toBe(3);
        expect(message.args).toStrictEqual([effectChangeType, effectId, null]);
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
        expect(messageForRegister.args.length).toBe(0);
      });

      it('should successfully invoke effectParameterChange handler', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        let returnedEffectId: string;
        let handlerInvoked = false;
        const videoEffectCallBack = (effectId: string): Promise<void> => {
          handlerInvoked = true;
          returnedEffectId = effectId;
          return Promise.resolve();
        };

        videoEx.registerForVideoEffect(videoEffectCallBack);
        const effectId = 'sampleEffectId';
        utils.respondToFramelessMessage({
          data: {
            func: 'video.effectParameterChange',
            args: [effectId],
          },
        } as DOMMessageEvent);
        expect(returnedEffectId).toEqual(effectId);
        expect(handlerInvoked).toBeTruthy();
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
        expect(message.args.length).toBe(1);
        expect(message.args[0]).toEqual(personalizedEffects);
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
        expect(message.args.length).toBe(2);
        expect(message.args[0]).toEqual(fakeErrorMsg);
        expect(message.args[1]).toEqual(videoEx.ErrorLevel.Fatal);
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
        _frame: videoEx.VideoFrame,
        _notifyVideoFrameProcessed: () => void,
        _notifyError: (errorMessage: string) => void,
      ): void => {};
      const videoFrameConfig: videoEx.VideoFrameConfig = {
        format: video.VideoFrameFormat.NV12,
        requireCameraStream: false,
        audioInferenceModel: new ArrayBuffer(100),
      };

      const allowedContexts = [FrameContexts.sidePanel];
      Object.values(FrameContexts).forEach((context) => {
        if (!allowedContexts.some((allowedContext) => allowedContext === context)) {
          it('should not allow registerForVideoFrame calls from the wrong context', async () => {
            await utils.initializeWithContext(context);

            expect(() =>
              videoEx.registerForVideoFrame({
                videoBufferHandler: emptyVideoFrameCallback,
                config: videoFrameConfig,
              }),
            ).toThrowError(
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
          videoEx.registerForVideoFrame({
            videoBufferHandler: emptyVideoFrameCallback,
            config: videoFrameConfig,
          });
        } catch (e) {
          expect(e).toEqual(errorNotSupportedOnPlatform);
        }
      });

      it('should successfully send registerForVideoFrame message', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        videoEx.registerForVideoFrame({
          videoBufferHandler: emptyVideoFrameCallback,
          config: videoFrameConfig,
        });
        const message = utils.findMessageByFunc('video.registerForVideoFrame');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
        expect(message.args[0]).toEqual(videoFrameConfig);
      });

      it('should not send default message when register video frame handler', async () => {
        await utils.initializeWithContext('sidePanel');
        videoEx.registerForVideoFrame({
          videoBufferHandler: emptyVideoFrameCallback,
          config: videoFrameConfig,
        });
        const messageForRegister = utils.findMessageByFunc('registerHandler');
        expect(messageForRegister).toBeNull();
      });

      it('should successfully invoke video frame event handler', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        let returnedVideoFrame: videoEx.VideoFrame;
        let handlerInvoked = false;

        const videoFrameCallback = (
          _frame: videoEx.VideoFrame,
          _notifyVideoFrameProcessed: () => void,
          _notifyError: (errorMessage: string) => void,
        ): void => {
          handlerInvoked = true;
          returnedVideoFrame = _frame;
        };

        videoEx.registerForVideoFrame({
          videoBufferHandler: videoFrameCallback,
          config: videoFrameConfig,
        });
        const videoFrameMock = {
          width: 30,
          height: 40,
          data: 101,
        };
        utils.sendMessage('video.newVideoFrame', videoFrameMock);
        expect(returnedVideoFrame).toEqual(videoFrameMock);
        expect(handlerInvoked).toBeTruthy();
      });

      it('should invoke video frame event handler and successfully send videoFrameProcessed', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        const videoFrameCallback = (
          _frame: videoEx.VideoFrame,
          _notifyVideoFrameProcessed: () => void,
          _notifyError: (errorMessage: string) => void,
        ): void => {
          _notifyVideoFrameProcessed();
        };

        videoEx.registerForVideoFrame({
          videoBufferHandler: videoFrameCallback,
          config: videoFrameConfig,
        });
        const videoFrameMock = {
          width: 30,
          height: 40,
          data: 101,
        };
        utils.sendMessage('video.newVideoFrame', videoFrameMock);
        const message = utils.findMessageByFunc('video.videoFrameProcessed');

        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
        expect(message.args[0]).toBeUndefined();
      });

      it('should invoke video frame event handler and successfully send videoFrameProcessed with timestamp', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        const videoFrameCallback = (
          _frame: video.VideoFrame,
          _notifyVideoFrameProcessed: () => void,
          _notifyError: (errorMessage: string) => void,
        ): void => {
          _notifyVideoFrameProcessed();
        };

        videoEx.registerForVideoFrame({
          videoBufferHandler: videoFrameCallback,
          config: videoFrameConfig,
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
        expect(message.args.length).toBe(1);
        expect(message.args[0]).toBe(200);
      });

      it('should invoke video frame event handler and successfully send notifyError', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        const errorMessage = 'Error occurs when processing the video frame';
        const videoFrameCallback = (
          _frame: videoEx.VideoFrame,
          _notifyVideoFrameProcessed: () => void,
          _notifyError: (errorMessage: string) => void,
        ): void => {
          _notifyError(errorMessage);
        };

        videoEx.registerForVideoFrame({
          videoBufferHandler: videoFrameCallback,
          config: videoFrameConfig,
        });
        const videoFrameMock = {
          width: 30,
          height: 40,
          data: 101,
        };
        utils.sendMessage('video.newVideoFrame', videoFrameMock);
        const message = utils.findMessageByFunc('video.notifyError');

        expect(message).not.toBeNull();
        expect(message.args.length).toBe(2);
        expect(message.args[0]).toEqual(errorMessage);
        expect(message.args[1]).toEqual(videoEx.ErrorLevel.Warn);
      });

      it('should not invoke video frame event handler when videoFrame is undefined', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        let handlerInvoked = false;
        const videoFrameCallback = (
          _frame: videoEx.VideoFrame,
          _notifyVideoFrameProcessed: () => void,
          _notifyError: (errorMessage: string) => void,
        ): void => {
          handlerInvoked = true;
        };
        videoEx.registerForVideoFrame({
          videoBufferHandler: videoFrameCallback,
          config: videoFrameConfig,
        });
        utils.sendMessage('video.newVideoFrame', undefined);
        expect(handlerInvoked).toBe(false);
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
        expect(message.args.length).toBe(3);
        expect(message.args).toStrictEqual([effectChangeType, effectId, undefined]);
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
        expect(messageForRegister.args.length).toBe(0);
      });

      it('should successfully invoke effectParameterChange handler', async () => {
        await utils.initializeWithContext(FrameContexts.sidePanel);
        let returnedEffectId: string;
        let handlerInvoked = false;
        const videoEffectCallBack = (effectId: string): Promise<void> => {
          handlerInvoked = true;
          returnedEffectId = effectId;
          return Promise.resolve();
        };

        videoEx.registerForVideoEffect(videoEffectCallBack);
        const effectId = 'sampleEffectId';
        utils.sendMessage('video.effectParameterChange', effectId);
        expect(returnedEffectId).toEqual(effectId);
        expect(handlerInvoked).toBeTruthy();
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
        expect(message.args.length).toBe(1);
        expect(message.args[0]).toEqual(personalizedEffects);
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
        expect(message.args.length).toBe(2);
        expect(message.args[0]).toEqual(fakeErrorMsg);
        expect(message.args[1]).toEqual(videoEx.ErrorLevel.Fatal);
      });
    });
  });
});
