import { FramelessPostMocks } from '../framelessPostMocks';
import { app } from '../../src/public/app';
import { FrameContexts } from '../../src/public/constants';
import { video } from '../../src/public/video';
import { Utils } from '../utils';
import { DOMMessageEvent } from '../../src/internal/interfaces';

/**
 * Test cases for selectPeople API
 */
describe('video', () => {
  const mobilePlatformMock = new FramelessPostMocks();
  const desktopPlatformMock = new Utils();

  beforeEach(() => {
    mobilePlatformMock.messages = [];
    desktopPlatformMock.messages = [];
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      app._uninitialize();
    }
  });

  describe('registerForVideoFrame', () => {
    let emptyVideoEffectCallback = (
      _frame: video.VideoFrame,
      _notifyVideoFrameProcessed: () => void,
      _notifyError: (errorMessage: string) => void,
    ): void => {};
    const videoFrameConfig: video.VideoFrameConfig = {
      format: video.VideoFrameFormat.NV12,
    };

    const allowedContexts = [FrameContexts.sidePanel];
    Object.values(FrameContexts).forEach(context => {
      if (allowedContexts.some(allowedContext => allowedContext === context)) {
        return;
      }
      it('DESKTOP - should not allow registerForVideoFrame calls from the wrong context', async () => {
        await desktopPlatformMock.initializeWithContext(context);

        expect(() => video.registerForVideoFrame(emptyVideoEffectCallback, videoFrameConfig)).toThrowError(
          `This call is only allowed in following contexts: ${JSON.stringify(
            allowedContexts,
          )}. Current context: "${context}".`,
        );
      });
      it('MOBILE - should not allow registerForVideoFrame calls from the wrong context', async () => {
        await mobilePlatformMock.initializeWithContext(context);

        expect(() => video.registerForVideoFrame(emptyVideoEffectCallback, videoFrameConfig)).toThrowError(
          `This call is only allowed in following contexts: ${JSON.stringify(
            allowedContexts,
          )}. Current context: "${context}".`,
        );
      });
    });

    it('DESKTOP - should successfully send registerForVideoFrame message', async () => {
      await desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      video.registerForVideoFrame(emptyVideoEffectCallback, videoFrameConfig);
      const message = desktopPlatformMock.findMessageByFunc('video.registerForVideoFrame');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args).toEqual([videoFrameConfig]);
    });
    it('MOBILE - should successfully send registerForVideoFrame message', async () => {
      await mobilePlatformMock.initializeWithContext(FrameContexts.sidePanel);
      video.registerForVideoFrame(emptyVideoEffectCallback, videoFrameConfig);
      const message = mobilePlatformMock.findMessageByFunc('video.registerForVideoFrame');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args).toEqual([videoFrameConfig]);
    });

    it('DESKTOP - should successful register video frame handler', async () => {
      await desktopPlatformMock.initializeWithContext('sidePanel');

      video.registerForVideoFrame(emptyVideoEffectCallback, videoFrameConfig);

      const messageForRegister = desktopPlatformMock.findMessageByFunc('registerHandler');
      expect(messageForRegister).not.toBeNull();
      expect(messageForRegister.args.length).toBe(1);
      expect(messageForRegister.args[0]).toBe('video.newVideoFrame');
    });

    it('MOBILE - should successful register video frame handler', async () => {
      await mobilePlatformMock.initializeWithContext('sidePanel');

      video.registerForVideoFrame(emptyVideoEffectCallback, videoFrameConfig);

      const messageForRegister = mobilePlatformMock.findMessageByFunc('registerHandler');
      expect(messageForRegister).not.toBeNull();
      expect(messageForRegister.args.length).toBe(1);
      expect(messageForRegister.args[0]).toBe('video.newVideoFrame');
    });
    it('DESKTOP - should successfully invoke video frame event handler', async () => {
      await desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      let returnedVideoFrame: video.VideoFrame;
      let handlerInvoked = false;

      let videoEffectCallback = (
        _frame: video.VideoFrame,
        _notifyVideoFrameProcessed: () => void,
        _notifyError: (errorMessage: string) => void,
      ): void => {
        handlerInvoked = true;
        returnedVideoFrame = _frame;
      };

      video.registerForVideoFrame(videoEffectCallback, videoFrameConfig);
      const videoFrameMock = {
        width: 30,
        height: 40,
        data: 101,
      };
      desktopPlatformMock.sendMessage('video.newVideoFrame', videoFrameMock);
      expect(returnedVideoFrame).toEqual(videoFrameMock);
      expect(handlerInvoked).toBeTruthy();
    });

    it('MOBILE - should successfully invoke video frame event handler', async () => {
      await mobilePlatformMock.initializeWithContext(FrameContexts.sidePanel);
      let returnedVideoFrame: video.VideoFrame;
      let handlerInvoked = false;
      //callback
      let videoEffectCallback = (
        _frame: video.VideoFrame,
        _notifyVideoFrameProcessed: () => void,
        _notifyError: (errorMessage: string) => void,
      ): void => {
        handlerInvoked = true;
        returnedVideoFrame = _frame;
      };
      video.registerForVideoFrame(videoEffectCallback, videoFrameConfig);
      const videoFrameMock = {
        width: 30,
        height: 40,
        data: 101,
      };
      mobilePlatformMock.respondToMessage({
        data: {
          func: 'video.newVideoFrame',
          args: [videoFrameMock],
        },
      } as DOMMessageEvent);
      expect(handlerInvoked).toBeTruthy();
      expect(returnedVideoFrame).toEqual(videoFrameMock);
    });

    it('DESKTOP - should invoke video frame event handler and successfully send videoFrameProcessed', async () => {
      await desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      const errorMessage = 'error occurs';
      const videoEffectCallback = (
        _frame: video.VideoFrame,
        _notifyVideoFrameProcessed: () => void,
        _notifyError: (errorMessage: string) => void,
      ): void => {
        if (_frame === null) {
          _notifyError(errorMessage);
        } else {
          _notifyVideoFrameProcessed();
        }
      };

      video.registerForVideoFrame(videoEffectCallback, videoFrameConfig);
      const videoFrameMock = {
        width: 30,
        height: 40,
        data: 101,
      };
      desktopPlatformMock.sendMessage('video.newVideoFrame', videoFrameMock);
      const message = desktopPlatformMock.findMessageByFunc('video.videoFrameProcessed');

      expect(message).not.toBeNull();
      expect(message.args.length).toBe(0);
    });

    it('MOBILE - should invoke video frame event handler and successfully send videoFrameProcessed', async () => {
      await mobilePlatformMock.initializeWithContext(FrameContexts.sidePanel);
      const errorMessage = 'error occurs';
      const videoEffectCallback = (
        _frame: video.VideoFrame,
        _notifyVideoFrameProcessed: () => void,
        _notifyError: (errorMessage: string) => void,
      ): void => {
        if (_frame === null) {
          _notifyError(errorMessage);
        } else {
          _notifyVideoFrameProcessed();
        }
      };

      video.registerForVideoFrame(videoEffectCallback, videoFrameConfig);
      const videoFrameMock = {
        width: 30,
        height: 40,
        data: 101,
      };
      mobilePlatformMock.respondToMessage({
        data: {
          func: 'video.newVideoFrame',
          args: [videoFrameMock],
        },
      } as DOMMessageEvent);
      const message = mobilePlatformMock.findMessageByFunc('video.videoFrameProcessed');

      expect(message).not.toBeNull();
      expect(message.args.length).toBe(0);
    });
    it('DESKTOP - should invoke video frame event handler and successfully send notifyError', async () => {
      await desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      const errorMessage = 'error occurs';
      const videoEffectCallback = (
        _frame: video.VideoFrame,
        _notifyVideoFrameProcessed: () => void,
        _notifyError: (errorMessage: string) => void,
      ): void => {
        if (_frame === null) {
          _notifyError(errorMessage);
        } else {
          _notifyVideoFrameProcessed();
        }
      };

      video.registerForVideoFrame(videoEffectCallback, videoFrameConfig);

      desktopPlatformMock.sendMessage('video.newVideoFrame', null);
      const message = desktopPlatformMock.findMessageByFunc('video.notifyError');

      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toEqual(errorMessage);
    });

    it('MOBILE - should invoke video frame event handler and successfully send notifyError', async () => {
      await mobilePlatformMock.initializeWithContext(FrameContexts.sidePanel);
      const errorMessage = 'error occurs';
      const videoEffectCallback = (
        _frame: video.VideoFrame,
        _notifyVideoFrameProcessed: () => void,
        _notifyError: (errorMessage: string) => void,
      ): void => {
        if (_frame === null) {
          _notifyError(errorMessage);
        } else {
          _notifyVideoFrameProcessed();
        }
      };

      video.registerForVideoFrame(videoEffectCallback, videoFrameConfig);
      mobilePlatformMock.respondToMessage({
        data: {
          func: 'video.newVideoFrame',
          args: [null],
        },
      } as DOMMessageEvent);
      const message = mobilePlatformMock.findMessageByFunc('video.notifyError');

      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toEqual(errorMessage);
    });

    it('DESKTOP - should not invoke video frame event handler when videoFrame is undefined', async () => {
      await desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      let handlerInvoked = false;
      let videoEffectCallback = (
        _frame: video.VideoFrame,
        _notifyVideoFrameProcessed: () => void,
        _notifyError: (errorMessage: string) => void,
      ): void => {
        handlerInvoked = true;
      };
      video.registerForVideoFrame(videoEffectCallback, videoFrameConfig);
      desktopPlatformMock.sendMessage('video.newVideoFrame', undefined);
      expect(handlerInvoked).toBe(false);
    });
    it('MOBILE - should not invoke video frame event handler when videoFrame is undefined', async () => {
      await mobilePlatformMock.initializeWithContext(FrameContexts.sidePanel);
      let handlerInvoked = false;
      let videoEffectCallback = (
        _frame: video.VideoFrame,
        _notifyVideoFrameProcessed: () => void,
        _notifyError: (errorMessage: string) => void,
      ): void => {
        handlerInvoked = true;
      };
      video.registerForVideoFrame(videoEffectCallback, videoFrameConfig);
      mobilePlatformMock.respondToMessage({
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
    Object.values(FrameContexts).forEach(context => {
      if (allowedContexts.some(allowedContext => allowedContext === context)) {
        return;
      }
      it('DESKTOP - should not allow notifySelectedVideoEffectChanged calls from the wrong context', async () => {
        await desktopPlatformMock.initializeWithContext(context);

        expect(() => video.notifySelectedVideoEffectChanged(effectChangeType, effectId)).toThrowError(
          `This call is only allowed in following contexts: ${JSON.stringify(
            allowedContexts,
          )}. Current context: "${context}".`,
        );
      });
      it('MOBILE - should not allow notifySelectedVideoEffectChanged calls from the wrong context', async () => {
        await mobilePlatformMock.initializeWithContext(context);

        expect(() => video.notifySelectedVideoEffectChanged(effectChangeType, effectId)).toThrowError(
          `This call is only allowed in following contexts: ${JSON.stringify(
            allowedContexts,
          )}. Current context: "${context}".`,
        );
      });
    });

    it('DESKTOP - should successfully send notifySelectedVideoEffectChanged message', async () => {
      await desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      video.notifySelectedVideoEffectChanged(effectChangeType, effectId);
      const message = desktopPlatformMock.findMessageByFunc('video.videoEffectChanged');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(2);
      expect(message.args).toEqual([effectChangeType, effectId]);
    });
    it('MOBILE - should successfully send notifySelectedVideoEffectChanged message', async () => {
      await mobilePlatformMock.initializeWithContext(FrameContexts.sidePanel);
      video.notifySelectedVideoEffectChanged(effectChangeType, effectId);
      const message = mobilePlatformMock.findMessageByFunc('video.videoEffectChanged');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(2);
      expect(message.args).toEqual([effectChangeType, effectId]);
    });
  });

  describe('registerForVideoEffect', () => {
    const allowedContexts = [FrameContexts.sidePanel];
    Object.values(FrameContexts).forEach(context => {
      if (allowedContexts.some(allowedContext => allowedContext === context)) {
        return;
      }
      it('DESKTOP - should not allow registerForVideoEffect calls from the wrong context', async () => {
        await desktopPlatformMock.initializeWithContext(context);

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        expect(() => video.registerForVideoEffect(() => {})).toThrowError(
          `This call is only allowed in following contexts: ${JSON.stringify(
            allowedContexts,
          )}. Current context: "${context}".`,
        );
      });
      it('MOBILE - should not allow registerForVideoEffect calls from the wrong context', async () => {
        await mobilePlatformMock.initializeWithContext(context);

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        expect(() => video.registerForVideoEffect(() => {})).toThrowError(
          `This call is only allowed in following contexts: ${JSON.stringify(
            allowedContexts,
          )}. Current context: "${context}".`,
        );
      });
    });

    it('DESKTOP - should successful register effectParameterChange', async () => {
      await desktopPlatformMock.initializeWithContext('sidePanel');

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      video.registerForVideoEffect(() => {});

      const messageForRegister = desktopPlatformMock.findMessageByFunc('registerHandler');
      expect(messageForRegister).not.toBeNull();
      expect(messageForRegister.args.length).toBe(1);
      expect(messageForRegister.args[0]).toBe('video.effectParameterChange');
    });
    it('MOBILE - should successful register effectParameterChange', async () => {
      await mobilePlatformMock.initializeWithContext('sidePanel');

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      video.registerForVideoEffect(() => {});

      const messageForRegister = mobilePlatformMock.findMessageByFunc('registerHandler');
      expect(messageForRegister).not.toBeNull();
      expect(messageForRegister.args.length).toBe(1);
      expect(messageForRegister.args[0]).toBe('video.effectParameterChange');
    });
    it('DESKTOP - should successfully invoke effectParameterChange handler', async () => {
      await desktopPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      let returnedEffectId: string;
      let handlerInvoked = false;
      const handlerMock = (effectId: string): void => {
        handlerInvoked = true;
        returnedEffectId = effectId;
      };

      video.registerForVideoEffect(handlerMock);
      const effectId = 'sampleEffectId';
      desktopPlatformMock.sendMessage('video.effectParameterChange', effectId);
      expect(returnedEffectId).toEqual(effectId);
      expect(handlerInvoked).toBeTruthy();
    });
    it('MOBILE - should successfully invoke effectParameterChange handler', async () => {
      await mobilePlatformMock.initializeWithContext(FrameContexts.sidePanel);
      let returnedEffectId: string;
      let handlerInvoked = false;
      const handlerMock = (effectId: string): void => {
        handlerInvoked = true;
        returnedEffectId = effectId;
      };

      video.registerForVideoEffect(handlerMock);
      const effectId = 'sampleEffectId';
      mobilePlatformMock.respondToMessage({
        data: {
          func: 'video.effectParameterChange',
          args: [effectId],
        },
      } as DOMMessageEvent);
      expect(returnedEffectId).toEqual(effectId);
      expect(handlerInvoked).toBeTruthy();
    });
  });
});
