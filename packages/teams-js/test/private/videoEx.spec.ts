import { DOMMessageEvent } from '../../src/internal/interfaces';
import { videoEx } from '../../src/private/videoEx';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { video } from '../../src/public/video';
import { FramelessPostMocks } from '../framelessPostMocks';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

/**
 * Test cases for selectPeople API
 */
describe('videoEx', () => {
  const framelessPlatformMock = new FramelessPostMocks();
  const framedPlatformMock = new Utils();

  beforeEach(() => {
    framelessPlatformMock.messages = [];
    framedPlatformMock.messages = [];
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      framedPlatformMock.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      app._uninitialize();
    }
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
        it('FRAMED - should not allow registerForVideoFrame calls from the wrong context', async () => {
          await framedPlatformMock.initializeWithContext(context);

          expect(() => videoEx.registerForVideoFrame(emptyVideoFrameCallback, videoFrameConfig)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });

        it('FRAMELESS - should not allow registerForVideoFrame calls from the wrong context', async () => {
          await framelessPlatformMock.initializeWithContext(context);

          expect(() => videoEx.registerForVideoFrame(emptyVideoFrameCallback, videoFrameConfig)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });

    it('FRAMED - should throw error when video is not supported in runtime config', async () => {
      await framedPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      framedPlatformMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
      expect.assertions(1);
      try {
        videoEx.registerForVideoFrame(emptyVideoFrameCallback, videoFrameConfig);
      } catch (e) {
        expect(e).toEqual(errorNotSupportedOnPlatform);
      }
    });

    it('FRAMELESS - should throw error when video is not supported in runtime config', async () => {
      await framelessPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      framelessPlatformMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
      expect.assertions(4);
      try {
        videoEx.registerForVideoFrame(emptyVideoFrameCallback, videoFrameConfig);
      } catch (e) {
        expect(e).toEqual(errorNotSupportedOnPlatform);
      }
    });

    it('FRAMED - should successfully send registerForVideoFrame message', async () => {
      await framedPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      videoEx.registerForVideoFrame(emptyVideoFrameCallback, videoFrameConfig);
      const message = framedPlatformMock.findMessageByFunc('video.registerForVideoFrame');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toEqual(videoFrameConfig);
    });

    it('FRAMELESS - should successfully send registerForVideoFrame message', async () => {
      await framelessPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      videoEx.registerForVideoFrame(emptyVideoFrameCallback, videoFrameConfig);
      const message = framelessPlatformMock.findMessageByFunc('video.registerForVideoFrame');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toHaveProperty('audioInferenceModel');
      expect(message.args[0].format).toBe(video.VideoFrameFormat.NV12);
      expect(message.args[0].requireCameraStream).toBe(false);
    });

    it('FRAMED - should not send default message when register video frame handler', async () => {
      await framedPlatformMock.initializeWithContext('sidePanel');
      videoEx.registerForVideoFrame(emptyVideoFrameCallback, videoFrameConfig);
      const messageForRegister = framedPlatformMock.findMessageByFunc('registerHandler');
      expect(messageForRegister).toBeNull();
    });

    it('FRAMELESS - should not send default message when register video frame handler', async () => {
      await framelessPlatformMock.initializeWithContext('sidePanel');
      videoEx.registerForVideoFrame(emptyVideoFrameCallback, videoFrameConfig);
      const messageForRegister = framelessPlatformMock.findMessageByFunc('registerHandler');
      expect(messageForRegister).toBeNull();
    });

    it('FRAMED - should successfully invoke video frame event handler', async () => {
      await framedPlatformMock.initializeWithContext(FrameContexts.sidePanel);
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

      videoEx.registerForVideoFrame(videoFrameCallback, videoFrameConfig);
      const videoFrameMock = {
        width: 30,
        height: 40,
        data: 101,
      };
      framedPlatformMock.sendMessage('video.newVideoFrame', videoFrameMock);
      expect(returnedVideoFrame).toEqual(videoFrameMock);
      expect(handlerInvoked).toBeTruthy();
    });

    it('FRAMELESS - should successfully invoke video frame event handler', async () => {
      await framelessPlatformMock.initializeWithContext(FrameContexts.sidePanel);
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
      videoEx.registerForVideoFrame(videoFrameCallback, videoFrameConfig);
      const videoFrameMock = {
        width: 30,
        height: 40,
        data: 101,
      };
      framelessPlatformMock.respondToMessage({
        data: {
          func: 'video.newVideoFrame',
          args: [videoFrameMock],
        },
      } as DOMMessageEvent);
      expect(handlerInvoked).toBeTruthy();
      expect(returnedVideoFrame).toEqual(videoFrameMock);
    });

    it('FRAMED - should invoke video frame event handler and successfully send videoFrameProcessed', async () => {
      await framedPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      const videoFrameCallback = (
        _frame: videoEx.VideoFrame,
        _notifyVideoFrameProcessed: () => void,
        _notifyError: (errorMessage: string) => void,
      ): void => {
        _notifyVideoFrameProcessed();
      };

      videoEx.registerForVideoFrame(videoFrameCallback, videoFrameConfig);
      const videoFrameMock = {
        width: 30,
        height: 40,
        data: 101,
      };
      framedPlatformMock.sendMessage('video.newVideoFrame', videoFrameMock);
      const message = framedPlatformMock.findMessageByFunc('video.videoFrameProcessed');

      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toBeUndefined();
    });

    it('FRAMED - should invoke video frame event handler and successfully send videoFrameProcessed with timestamp', async () => {
      await framedPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      const videoFrameCallback = (
        _frame: video.VideoFrame,
        _notifyVideoFrameProcessed: () => void,
        _notifyError: (errorMessage: string) => void,
      ): void => {
        _notifyVideoFrameProcessed();
      };

      video.registerForVideoFrame(videoFrameCallback, videoFrameConfig);
      const videoFrameMock = {
        width: 30,
        height: 40,
        data: 101,
        timestamp: 200,
      };
      framedPlatformMock.sendMessage('video.newVideoFrame', videoFrameMock);
      const message = framedPlatformMock.findMessageByFunc('video.videoFrameProcessed');

      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toBe(200);
    });

    it('FRAMELESS - should invoke video frame event handler and successfully send videoFrameProcessed', async () => {
      await framelessPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      const videoFrameCallback = (
        _frame: videoEx.VideoFrame,
        _notifyVideoFrameProcessed: () => void,
        _notifyError: (errorMessage: string) => void,
      ): void => {
        _notifyVideoFrameProcessed();
      };

      videoEx.registerForVideoFrame(videoFrameCallback, videoFrameConfig);
      const videoFrameMock = {
        width: 30,
        height: 40,
        data: 101,
      };
      framelessPlatformMock.respondToMessage({
        data: {
          func: 'video.newVideoFrame',
          args: [videoFrameMock],
        },
      } as DOMMessageEvent);
      const message = framelessPlatformMock.findMessageByFunc('video.videoFrameProcessed');

      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
    });

    it('FRAMELESS - should invoke video frame event handler and successfully send videoFrameProcessed with timestamp', async () => {
      await framelessPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      const videoFrameCallback = (
        _frame: video.VideoFrame,
        _notifyVideoFrameProcessed: () => void,
        _notifyError: (errorMessage: string) => void,
      ): void => {
        _notifyVideoFrameProcessed();
      };

      video.registerForVideoFrame(videoFrameCallback, videoFrameConfig);
      const videoFrameMock = {
        width: 30,
        height: 40,
        data: 101,
        timestamp: 200,
      };
      framelessPlatformMock.respondToMessage({
        data: {
          func: 'video.newVideoFrame',
          args: [videoFrameMock],
        },
      } as DOMMessageEvent);
      const message = framelessPlatformMock.findMessageByFunc('video.videoFrameProcessed');

      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toBe(200);
    });

    it('FRAMED - should invoke video frame event handler and successfully send notifyError', async () => {
      await framedPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      const errorMessage = 'Error occurs when processing the video frame';
      const videoFrameCallback = (
        _frame: videoEx.VideoFrame,
        _notifyVideoFrameProcessed: () => void,
        _notifyError: (errorMessage: string) => void,
      ): void => {
        _notifyError(errorMessage);
      };

      videoEx.registerForVideoFrame(videoFrameCallback, videoFrameConfig);
      const videoFrameMock = {
        width: 30,
        height: 40,
        data: 101,
      };
      framedPlatformMock.sendMessage('video.newVideoFrame', videoFrameMock);
      const message = framedPlatformMock.findMessageByFunc('video.notifyError');

      expect(message).not.toBeNull();
      expect(message.args.length).toBe(2);
      expect(message.args[0]).toEqual(errorMessage);
      expect(message.args[1]).toEqual(videoEx.ErrorLevel.Warn);
    });

    it('FRAMELESS - should invoke video frame event handler and successfully send notifyError', async () => {
      await framelessPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      const errorMessage = 'Error occurs when processing the video frame';
      const videoFrameCallback = (
        _frame: videoEx.VideoFrame,
        _notifyVideoFrameProcessed: () => void,
        _notifyError: (errorMessage: string) => void,
      ): void => {
        _notifyError(errorMessage);
      };

      videoEx.registerForVideoFrame(videoFrameCallback, videoFrameConfig);
      const videoFrameMock = {
        width: 30,
        height: 40,
        data: 101,
      };
      framelessPlatformMock.respondToMessage({
        data: {
          func: 'video.newVideoFrame',
          args: [videoFrameMock],
        },
      } as DOMMessageEvent);
      const message = framelessPlatformMock.findMessageByFunc('video.notifyError');

      expect(message).not.toBeNull();
      expect(message.args.length).toBe(2);
      expect(message.args[0]).toEqual(errorMessage);
      expect(message.args[1]).toEqual(videoEx.ErrorLevel.Warn);
    });

    it('FRAMED - should not invoke video frame event handler when videoFrame is undefined', async () => {
      await framedPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      let handlerInvoked = false;
      const videoFrameCallback = (
        _frame: videoEx.VideoFrame,
        _notifyVideoFrameProcessed: () => void,
        _notifyError: (errorMessage: string) => void,
      ): void => {
        handlerInvoked = true;
      };
      videoEx.registerForVideoFrame(videoFrameCallback, videoFrameConfig);
      framedPlatformMock.sendMessage('video.newVideoFrame', undefined);
      expect(handlerInvoked).toBe(false);
    });

    it('FRAMELESS - should not invoke video frame event handler when videoFrame is undefined', async () => {
      await framelessPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      let handlerInvoked = false;
      const videoFrameCallback = (
        _frame: videoEx.VideoFrame,
        _notifyVideoFrameProcessed: () => void,
        _notifyError: (errorMessage: string) => void,
      ): void => {
        handlerInvoked = true;
      };
      videoEx.registerForVideoFrame(videoFrameCallback, videoFrameConfig);
      framelessPlatformMock.respondToMessage({
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
        it('FRAMED - should not allow notifySelectedVideoEffectChanged calls from the wrong context', async () => {
          await framedPlatformMock.initializeWithContext(context);

          expect(() => videoEx.notifySelectedVideoEffectChanged(effectChangeType, effectId)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });

        it('FRAMELESS - should not allow notifySelectedVideoEffectChanged calls from the wrong context', async () => {
          await framelessPlatformMock.initializeWithContext(context);

          expect(() => videoEx.notifySelectedVideoEffectChanged(effectChangeType, effectId)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });

    it('FRAMED - should throw error when video is not supported in runtime config', async () => {
      await framedPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      framedPlatformMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
      expect.assertions(1);
      try {
        videoEx.notifySelectedVideoEffectChanged(effectChangeType, effectId);
      } catch (e) {
        expect(e).toEqual(errorNotSupportedOnPlatform);
      }
    });

    it('FRAMELESS - should throw error when video is not supported in runtime config', async () => {
      await framelessPlatformMock.initializeWithContext(FrameContexts.sidePanel);

      framedPlatformMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
      expect.assertions(4);
      try {
        videoEx.notifySelectedVideoEffectChanged(effectChangeType, effectId);
      } catch (e) {
        expect(e).toEqual(errorNotSupportedOnPlatform);
      }
    });

    it('FRAMED - should successfully send notifySelectedVideoEffectChanged message', async () => {
      await framedPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      videoEx.notifySelectedVideoEffectChanged(effectChangeType, effectId);
      const message = framedPlatformMock.findMessageByFunc('video.videoEffectChanged');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(3);
      expect(message.args).toStrictEqual([effectChangeType, effectId, undefined]);
    });

    it('FRAMELESS - should successfully send notifySelectedVideoEffectChanged message', async () => {
      await framelessPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      videoEx.notifySelectedVideoEffectChanged(effectChangeType, effectId);
      const message = framelessPlatformMock.findMessageByFunc('video.videoEffectChanged');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(3);
      expect(message.args).toStrictEqual([effectChangeType, effectId, null]);
    });
  });

  describe('registerForVideoEffect', () => {
    const allowedContexts = [FrameContexts.sidePanel];
    Object.values(FrameContexts).forEach((context) => {
      if (!allowedContexts.some((allowedContext) => allowedContext === context)) {
        it('FRAMED - should not allow registerForVideoEffect calls from the wrong context', async () => {
          await framedPlatformMock.initializeWithContext(context);

          // eslint-disable-next-line @typescript-eslint/no-empty-function
          expect(() => videoEx.registerForVideoEffect(() => {})).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });

        it('FRAMELESS - should not allow registerForVideoEffect calls from the wrong context', async () => {
          await framelessPlatformMock.initializeWithContext(context);

          // eslint-disable-next-line @typescript-eslint/no-empty-function
          expect(() => videoEx.registerForVideoEffect(() => {})).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });

    it('FRAMED - should throw error when video is not supported in runtime config', async () => {
      await framedPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      framedPlatformMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
      expect.assertions(1);
      try {
        videoEx.registerForVideoEffect(() => {});
      } catch (e) {
        expect(e).toEqual(errorNotSupportedOnPlatform);
      }
    });

    it('FRAMELESS - should throw error when video is not supported in runtime config', async () => {
      await framelessPlatformMock.initializeWithContext(FrameContexts.sidePanel);

      framelessPlatformMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
      expect.assertions(4);
      try {
        videoEx.registerForVideoEffect(() => {});
      } catch (e) {
        expect(e).toEqual(errorNotSupportedOnPlatform);
      }
    });

    it('FRAMED - should successfully register effectParameterChange', async () => {
      await framedPlatformMock.initializeWithContext('sidePanel');

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      videoEx.registerForVideoEffect(() => {});

      expect(framedPlatformMock.findMessageByFunc('registerHandler')).toBeNull();
      const messageForRegister = framedPlatformMock.findMessageByFunc('video.registerForVideoEffect');
      expect(messageForRegister.args.length).toBe(0);
    });

    it('FRAMELESS - should successfully register effectParameterChange', async () => {
      await framelessPlatformMock.initializeWithContext('sidePanel');

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      videoEx.registerForVideoEffect(() => {});

      expect(framelessPlatformMock.findMessageByFunc('registerHandler')).toBeNull();
      const messageForRegister = framelessPlatformMock.findMessageByFunc('video.registerForVideoEffect');
      expect(messageForRegister.args.length).toBe(0);
    });

    it('FRAMED - should successfully invoke effectParameterChange handler', async () => {
      await framedPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      let returnedEffectId: string;
      let handlerInvoked = false;
      const videoEffectCallBack = (effectId: string): void => {
        handlerInvoked = true;
        returnedEffectId = effectId;
      };

      videoEx.registerForVideoEffect(videoEffectCallBack);
      const effectId = 'sampleEffectId';
      framedPlatformMock.sendMessage('video.effectParameterChange', effectId);
      expect(returnedEffectId).toEqual(effectId);
      expect(handlerInvoked).toBeTruthy();
    });

    it('FRAMELESS - should successfully invoke effectParameterChange handler', async () => {
      await framelessPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      let returnedEffectId: string;
      let handlerInvoked = false;
      const videoEffectCallBack = (effectId: string): void => {
        handlerInvoked = true;
        returnedEffectId = effectId;
      };

      videoEx.registerForVideoEffect(videoEffectCallBack);
      const effectId = 'sampleEffectId';
      framelessPlatformMock.respondToMessage({
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
        it('FRAMED - should not allow updatePersonalizedEffects calls from the wrong context', async () => {
          await framedPlatformMock.initializeWithContext(context);
          expect(() => videoEx.updatePersonalizedEffects(personalizedEffects)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });

        it('FRAMELESS - should not allow updatePersonalizedEffects calls from the wrong context', async () => {
          await framelessPlatformMock.initializeWithContext(context);
          expect(() => videoEx.updatePersonalizedEffects(personalizedEffects)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });

    it('FRAMED - should throw error when video is not supported in runtime config', async () => {
      await framedPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      framedPlatformMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
      expect.assertions(1);
      try {
        videoEx.updatePersonalizedEffects(personalizedEffects);
      } catch (e) {
        expect(e).toEqual(errorNotSupportedOnPlatform);
      }
    });

    it('FRAMELESS - should throw error when video is not supported in runtime config', async () => {
      await framelessPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      framelessPlatformMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
      expect.assertions(4);
      try {
        videoEx.updatePersonalizedEffects(personalizedEffects);
      } catch (e) {
        expect(e).toEqual(errorNotSupportedOnPlatform);
      }
    });

    it('FRAMED - should successfully send PersonalizedEffects', async () => {
      await framedPlatformMock.initializeWithContext('sidePanel');
      videoEx.updatePersonalizedEffects(personalizedEffects);
      const message = framedPlatformMock.findMessageByFunc('video.personalizedEffectsChanged');
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toEqual(personalizedEffects);
    });

    it('FRAMELESS - should successfully send PersonalizedEffects', async () => {
      await framelessPlatformMock.initializeWithContext('sidePanel');
      videoEx.updatePersonalizedEffects(personalizedEffects);
      const message = framelessPlatformMock.findMessageByFunc('video.personalizedEffectsChanged');
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toEqual(personalizedEffects);
    });
  });

  describe('isSupported', () => {
    it('FRAMED - should not be supported before initialization', () => {
      framedPlatformMock.uninitializeRuntimeConfig();
      expect(() => videoEx.isSupported()).toThrowError('The library has not yet been initialized');
    });

    it('FRAMELESS - should not be supported before initialization', () => {
      framelessPlatformMock.uninitializeRuntimeConfig();
      expect(() => videoEx.isSupported()).toThrowError('The library has not yet been initialized');
    });
  });

  describe('notifyFatalError', () => {
    it('FRAMED - should not be supported before initialization', () => {
      framedPlatformMock.uninitializeRuntimeConfig();
      expect(() => videoEx.notifyFatalError('')).toThrowError('The library has not yet been initialized');
    });

    it('FRAMELESS - should not be supported before initialization', () => {
      framelessPlatformMock.uninitializeRuntimeConfig();
      expect(() => videoEx.notifyFatalError('')).toThrowError('The library has not yet been initialized');
    });

    it('FRAMED - should send error to host successfully', async () => {
      await framedPlatformMock.initializeWithContext('sidePanel');
      const fakeErrorMsg = 'fake error';
      videoEx.notifyFatalError(fakeErrorMsg);
      const message = framedPlatformMock.findMessageByFunc('video.notifyError');
      expect(message.args.length).toBe(2);
      expect(message.args[0]).toEqual(fakeErrorMsg);
      expect(message.args[1]).toEqual(videoEx.ErrorLevel.Fatal);
    });

    it('FRAMELESS - should send error to host successfully', async () => {
      await framelessPlatformMock.initializeWithContext('sidePanel');
      const fakeErrorMsg = 'fake error';
      videoEx.notifyFatalError(fakeErrorMsg);
      const message = framelessPlatformMock.findMessageByFunc('video.notifyError');
      expect(message.args.length).toBe(2);
      expect(message.args[0]).toEqual(fakeErrorMsg);
      expect(message.args[1]).toEqual(videoEx.ErrorLevel.Fatal);
    });
  });
});
