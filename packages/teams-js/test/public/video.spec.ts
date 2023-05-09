import './mediaStreamApiMock';

import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { _minRuntimeConfigToUninitialize, IBaseRuntime } from '../../src/public/runtime';
import { video } from '../../src/public/video';
import { FramelessPostMocks } from '../framelessPostMocks';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

/**
 * Test cases for selectPeople API
 */
describe('video', () => {
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

  describe('isSupported', () => {
    it('should throw if called before initialization', () => {
      framedPlatformMock.uninitializeRuntimeConfig();
      expect(() => video.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });
  });

  describe.each([
    {
      init: (frameContext: string) => framedPlatformMock.initializeWithContext(frameContext),
      setRuntimeConfig: (config: IBaseRuntime) => framedPlatformMock.setRuntimeConfig(config),
      postMessage: (func: string, ...args: any) => framedPlatformMock.sendMessage(func, ...args),
      findMessageByFunc: (func: string) => framedPlatformMock.findMessageByFunc(func),
    },
    {
      init: (frameContext: string) => framelessPlatformMock.initializeWithContext(frameContext),
      setRuntimeConfig: (config: IBaseRuntime) => framelessPlatformMock.setRuntimeConfig(config),
      postMessage: (func: string, ...args: any) =>
        framelessPlatformMock.respondToMessage({
          data: {
            func,
            args,
          },
        } as DOMMessageEvent),
      findMessageByFunc: (func: string) => framelessPlatformMock.findMessageByFunc(func),
    },
  ])('registerForVideoFrame', ({ init, setRuntimeConfig, postMessage, findMessageByFunc }) => {
    it('should not allow registerForVideoFrame calls from the wrong context', async () => {
      await init(FrameContexts.content);
      expect(() => video.registerForVideoFrame({} as video.RegisterForVideoFrameParameters)).toThrowError();
    });

    it('should throw error when video is not supported in runtime config', async () => {
      await init(FrameContexts.sidePanel);
      setRuntimeConfig({ apiVersion: 1, supports: {} });
      expect(() => video.registerForVideoFrame({} as video.RegisterForVideoFrameParameters)).toThrowError();
    });

    describe('when sharedFrame is supported', () => {
      beforeEach(async () => {
        await init(FrameContexts.sidePanel);
        setRuntimeConfig({
          apiVersion: 1,
          supports: {
            video: {
              sharedFrame: true,
            },
          },
        });
      });

      it('should send registerForVideoFrame message', () => {
        const videoFrameConfig = {
          format: video.VideoFrameFormat.NV12,
        };
        video.registerForVideoFrame({
          mediaStreamCallback: (receivedVideoFrame: video.MediaStreamFrameData) =>
            Promise.resolve(receivedVideoFrame.videoFrame),
          sharedFrameCallback: () => {},
          config: videoFrameConfig,
        });
        const message = findMessageByFunc('video.registerForVideoFrame');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
        expect(message.args).toEqual([videoFrameConfig]);
      });

      it('should invoke sharedFrameCallback when receiving a shared frame', async () => {
        let returnedVideoFrame;
        let handlerInvoked = false;
        const videoFrameConfig = {
          format: video.VideoFrameFormat.NV12,
        };
        video.registerForVideoFrame({
          mediaStreamCallback: (receivedVideoFrame: video.MediaStreamFrameData) =>
            Promise.resolve(receivedVideoFrame.videoFrame),
          sharedFrameCallback: (videoFrame) => {
            returnedVideoFrame = videoFrame;
            handlerInvoked = true;
          },
          config: videoFrameConfig,
        });
        const videoFrameMock = {
          width: 30,
          height: 40,
          data: 101,
          videoFrameBuffer: 101,
        };
        postMessage('video.newVideoFrame', videoFrameMock);
        expect(returnedVideoFrame).toEqual(videoFrameMock);
        expect(handlerInvoked).toBeTruthy();
      });

      it('should invoke sharedFrameCallback and successfully send videoFrameProcessed', async () => {
        const videoFrameConfig = {
          format: video.VideoFrameFormat.NV12,
        };
        video.registerForVideoFrame({
          mediaStreamCallback: (receivedVideoFrame: video.MediaStreamFrameData) =>
            Promise.resolve(receivedVideoFrame.videoFrame),
          sharedFrameCallback: (videoFrame, notifySuccess) => {
            notifySuccess();
          },
          config: videoFrameConfig,
        });
        const videoFrameMock = {
          width: 30,
          height: 40,
          data: 101,
          videoFrameBuffer: 101,
          timestamp: 200,
        };
        postMessage('video.newVideoFrame', videoFrameMock);
        const message = findMessageByFunc('video.videoFrameProcessed');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
        expect(message.args[0]).toBe(200);
      });

      it('should invoke sharedFrameCallback and send notifyError on error', async () => {
        const errorMsg = 'error';
        const videoFrameConfig = {
          format: video.VideoFrameFormat.NV12,
        };
        video.registerForVideoFrame({
          mediaStreamCallback: (receivedVideoFrame: video.MediaStreamFrameData) =>
            Promise.resolve(receivedVideoFrame.videoFrame),
          sharedFrameCallback: (videoFrame, notifySuccess, notifyError) => {
            notifyError(errorMsg);
          },
          config: videoFrameConfig,
        });
        const videoFrameMock = {
          width: 30,
          height: 40,
          data: 101,
          videoFrameBuffer: 101,
          timestamp: 200,
        };
        postMessage('video.newVideoFrame', videoFrameMock);
        const message = findMessageByFunc('video.notifyError');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(1);
        expect(message.args[0]).toBe(errorMsg);
      });

      it('should not invoke video frame event handler when videoFrame is undefined', () => {
        let handlerInvoked = false;
        const videoFrameConfig = {
          format: video.VideoFrameFormat.NV12,
        };
        video.registerForVideoFrame({
          mediaStreamCallback: (receivedVideoFrame: video.MediaStreamFrameData) =>
            Promise.resolve(receivedVideoFrame.videoFrame),
          sharedFrameCallback: (videoFrame, notifySuccess, notifyError) => {
            handlerInvoked = true;
          },
          config: videoFrameConfig,
        });
        postMessage('video.newVideoFrame', undefined);
        expect(handlerInvoked).toBeFalsy();
      });
    });

    describe('when mediaStream is supported', () => {
      let targetStreamId;
      let registeredStreamId;
      let videoTrack = new MediaStreamTrack();
      let videoStream = new MediaStream([videoTrack]);
      beforeEach(async () => {
        window['chrome'] = {
          webview: {
            getTextureStream: (streamId: string) => {
              targetStreamId = streamId;
              return Promise.resolve(videoStream);
            },
            registerTextureStream: (streamId: string, track: MediaStreamTrack) => {
              registeredStreamId = streamId;
            },
          },
        };
        await init(FrameContexts.sidePanel);
        setRuntimeConfig({
          apiVersion: 1,
          supports: {
            video: {
              mediaStream: true,
            },
          },
        });
      });

      it('should get and register stream on video.startVideoExtensibilityVideoStream', async () => {
        await init(FrameContexts.sidePanel);
        const streamId = 'testStreamId';
        const videoFrameConfig = {
          format: video.VideoFrameFormat.NV12,
        };
        video.registerForVideoFrame({
          mediaStreamCallback: (receivedVideoFrame: video.MediaStreamFrameData) =>
            Promise.resolve(receivedVideoFrame.videoFrame),
          sharedFrameCallback: (videoFrame, notifySuccess, notifyError) => {},
          config: videoFrameConfig,
        });
        postMessage('video.startVideoExtensibilityVideoStream', { streamId });
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(targetStreamId).toEqual(streamId);
        expect(registeredStreamId).toEqual(streamId);
      });

      it('should send event to parent to inform the registration', async () => {
        await init(FrameContexts.sidePanel);
        const streamId = 'testStreamId';
        const videoFrameConfig = {
          format: video.VideoFrameFormat.NV12,
        };
        video.registerForVideoFrame({
          mediaStreamCallback: (receivedVideoFrame: video.MediaStreamFrameData) =>
            Promise.resolve(receivedVideoFrame.videoFrame),
          sharedFrameCallback: (videoFrame, notifySuccess, notifyError) => {},
          config: videoFrameConfig,
        });
        postMessage('video.startVideoExtensibilityVideoStream', { streamId });
        const msg = findMessageByFunc('video.mediaStream.registerForVideoFrame');
        expect(msg).not.toBeNull();
        expect(msg.args.length).toBe(1);
        expect(msg.args).toEqual([
          {
            format: video.VideoFrameFormat.NV12,
          },
        ]);
      });

      it('should invoke callback', async () => {
        await init(FrameContexts.sidePanel);
        let callbackInvoked = false;
        const videoFrameConfig = {
          format: video.VideoFrameFormat.NV12,
        };
        video.registerForVideoFrame({
          mediaStreamCallback: (receivedVideoFrame: video.MediaStreamFrameData) => {
            callbackInvoked = true;
            return Promise.resolve(receivedVideoFrame.videoFrame);
          },
          sharedFrameCallback: (videoFrame, notifySuccess, notifyError) => {},
          config: videoFrameConfig,
        });
        postMessage('video.startVideoExtensibilityVideoStream', { streamId: 'streamId' });
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(callbackInvoked).toBeTruthy();
      });

      it('should notify error when callback rejects', async () => {
        const errorMessage = 'error';
        await init(FrameContexts.sidePanel);
        const videoFrameConfig = {
          format: video.VideoFrameFormat.NV12,
        };
        video.registerForVideoFrame({
          mediaStreamCallback: (receivedVideoFrame: video.MediaStreamFrameData) => Promise.reject(errorMessage),
          sharedFrameCallback: (videoFrame, notifySuccess, notifyError) => {},
          config: videoFrameConfig,
        });
        postMessage('video.startVideoExtensibilityVideoStream', { streamId: 'streamId' });
        await new Promise((resolve) => setTimeout(resolve, 0));
        const message = findMessageByFunc('video.notifyError');
        expect(message).not.toBeNull();
        expect(message?.args.length).toBe(1);
        expect(message?.args[0]).toEqual(errorMessage);
      });
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

          expect(() => video.notifySelectedVideoEffectChanged(effectChangeType, effectId)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });

        it('FRAMELESS - should not allow notifySelectedVideoEffectChanged calls from the wrong context', async () => {
          await framelessPlatformMock.initializeWithContext(context);

          expect(() => video.notifySelectedVideoEffectChanged(effectChangeType, effectId)).toThrowError(
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
        video.notifySelectedVideoEffectChanged(effectChangeType, effectId);
      } catch (e) {
        expect(e).toEqual(errorNotSupportedOnPlatform);
      }
    });

    it('FRAMELESS - should throw error when video is not supported in runtime config', async () => {
      await framelessPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      framelessPlatformMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
      expect.assertions(4);
      try {
        video.notifySelectedVideoEffectChanged(effectChangeType, effectId);
      } catch (e) {
        expect(e).toEqual(errorNotSupportedOnPlatform);
      }
    });

    it('FRAMED - should successfully send notifySelectedVideoEffectChanged message', async () => {
      await framedPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      video.notifySelectedVideoEffectChanged(effectChangeType, effectId);
      const message = framedPlatformMock.findMessageByFunc('video.videoEffectChanged');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(2);
      expect(message.args).toEqual([effectChangeType, effectId]);
    });

    it('FRAMELESS - should successfully send notifySelectedVideoEffectChanged message', async () => {
      await framelessPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      video.notifySelectedVideoEffectChanged(effectChangeType, effectId);
      const message = framelessPlatformMock.findMessageByFunc('video.videoEffectChanged');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(2);
      expect(message.args).toEqual([effectChangeType, effectId]);
    });
  });

  describe('registerForVideoEffect', () => {
    const allowedContexts = [FrameContexts.sidePanel];
    Object.values(FrameContexts).forEach((context) => {
      if (!allowedContexts.some((allowedContext) => allowedContext === context)) {
        it('FRAMED - should not allow registerForVideoEffect calls from the wrong context', async () => {
          await framedPlatformMock.initializeWithContext(context);

          // eslint-disable-next-line @typescript-eslint/no-empty-function
          expect(() => video.registerForVideoEffect(() => Promise.resolve())).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });

        it('FRAMELESS - should not allow registerForVideoEffect calls from the wrong context', async () => {
          await framelessPlatformMock.initializeWithContext(context);

          // eslint-disable-next-line @typescript-eslint/no-empty-function
          expect(() => video.registerForVideoEffect(() => Promise.resolve())).toThrowError(
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
        video.registerForVideoEffect(() => Promise.resolve());
      } catch (e) {
        expect(e).toEqual(errorNotSupportedOnPlatform);
      }
    });

    it('FRAMELESS - should throw error when video is not supported in runtime config', async () => {
      await framelessPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      framelessPlatformMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
      expect.assertions(4);
      try {
        video.registerForVideoEffect(() => Promise.resolve());
      } catch (e) {
        expect(e).toEqual(errorNotSupportedOnPlatform);
      }
    });

    it('FRAMED - should successfully register effectParameterChange', async () => {
      await framedPlatformMock.initializeWithContext('sidePanel');

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      video.registerForVideoEffect(() => Promise.resolve());

      expect(framedPlatformMock.findMessageByFunc('registerHandler')).toBeNull();
      const messageForRegister = framedPlatformMock.findMessageByFunc('video.registerForVideoEffect');
      expect(messageForRegister).not.toBeNull();
      expect(messageForRegister.args?.length).toBe(0);
    });

    it('FRAMELESS - should successfully register effectParameterChange', async () => {
      await framelessPlatformMock.initializeWithContext('sidePanel');

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      video.registerForVideoEffect(() => Promise.resolve());

      expect(framelessPlatformMock.findMessageByFunc('registerHandler')).toBeNull();
      const messageForRegister = framelessPlatformMock.findMessageByFunc('video.registerForVideoEffect');
      expect(messageForRegister).not.toBeNull();
      expect(messageForRegister.args?.length).toBe(0);
    });

    it('FRAMED - should successfully invoke effectParameterChange handler', async () => {
      await framedPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      let returnedEffectId: string;
      let handlerInvoked = false;
      const videoEffectCallBack = (effectId: string): Promise<void> => {
        handlerInvoked = true;
        returnedEffectId = effectId;
        return Promise.resolve();
      };

      video.registerForVideoEffect(videoEffectCallBack);
      const effectId = 'sampleEffectId';
      framedPlatformMock.sendMessage('video.effectParameterChange', effectId);
      expect(returnedEffectId).toEqual(effectId);
      expect(handlerInvoked).toBeTruthy();
    });

    it('FRAMELESS - should successfully invoke effectParameterChange handler', async () => {
      await framelessPlatformMock.initializeWithContext(FrameContexts.sidePanel);
      let returnedEffectId: string;
      let handlerInvoked = false;
      const videoEffectCallBack = (effectId: string): Promise<void> => {
        handlerInvoked = true;
        returnedEffectId = effectId;
        return Promise.resolve();
      };

      video.registerForVideoEffect(videoEffectCallBack);
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

    let handlerInvoked;
    const invokeHanlderPromise = new Promise((resolve) => {
      handlerInvoked = resolve;
    });

    const videoEffectSuccessCallBack = (): Promise<void> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
          handlerInvoked();
        }, 0);
      });
    };
    const videoEffectFailedCallBack = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(video.EffectFailureReason.InvalidEffectId);
          handlerInvoked();
        }, 0);
      });
    };

    it('FRAMED - should invoke videoEffectReadiness handler on callback resolved', async () => {
      await framedPlatformMock.initializeWithContext(FrameContexts.sidePanel);

      video.registerForVideoEffect(videoEffectSuccessCallBack);
      const effectId = 'sampleEffectId';
      framedPlatformMock.sendMessage('video.effectParameterChange', effectId);
      await invokeHanlderPromise;
      await new Promise((resolve) => setTimeout(resolve, 0));
      const messageForRegister = framedPlatformMock.findMessageByFunc('video.videoEffectReadiness');
      expect(messageForRegister).not.toBeNull();
      expect(messageForRegister?.args?.length).toBe(2);
      expect(messageForRegister?.args).toEqual([true, effectId]);
    });

    it('FRAMELESS - should invoke videoEffectReadiness handler on callback resolved', async () => {
      await framelessPlatformMock.initializeWithContext(FrameContexts.sidePanel);

      video.registerForVideoEffect(videoEffectSuccessCallBack);
      const effectId = 'sampleEffectId';
      framelessPlatformMock.respondToMessage({
        data: {
          func: 'video.effectParameterChange',
          args: [effectId],
        },
      } as DOMMessageEvent);
      await invokeHanlderPromise;
      await new Promise((resolve) => setTimeout(resolve, 0));
      const messageForRegister = framelessPlatformMock.findMessageByFunc('video.videoEffectReadiness');
      expect(messageForRegister).not.toBeNull();
      expect(messageForRegister?.args?.length).toBe(2);
      expect(messageForRegister?.args).toEqual([true, effectId]);
    });

    it('FRAMED - should invoke videoEffectReadiness handler on callback rejects', async () => {
      await framedPlatformMock.initializeWithContext(FrameContexts.sidePanel);

      video.registerForVideoEffect(videoEffectFailedCallBack);
      const effectId = 'sampleEffectId';
      framedPlatformMock.sendMessage('video.effectParameterChange', effectId);
      await invokeHanlderPromise;
      await new Promise((resolve) => setTimeout(resolve, 0));
      const messageForRegister = framedPlatformMock.findMessageByFunc('video.videoEffectReadiness');
      expect(messageForRegister).not.toBeNull();
      expect(messageForRegister?.args?.length).toBe(3);
      expect(messageForRegister?.args).toEqual([false, effectId, 'InvalidEffectId']);
    });

    it('FRAMELESS - should invoke videoEffectReadiness handler on callback rejects', async () => {
      await framelessPlatformMock.initializeWithContext(FrameContexts.sidePanel);

      video.registerForVideoEffect(videoEffectFailedCallBack);
      const effectId = 'sampleEffectId';
      framelessPlatformMock.respondToMessage({
        data: {
          func: 'video.effectParameterChange',
          args: [effectId],
        },
      } as DOMMessageEvent);
      await invokeHanlderPromise;
      await new Promise((resolve) => setTimeout(resolve, 0));
      const messageForRegister = framelessPlatformMock.findMessageByFunc('video.videoEffectReadiness');
      expect(messageForRegister).not.toBeNull();
      expect(messageForRegister?.args?.length).toBe(3);
      expect(messageForRegister?.args).toEqual([false, effectId, 'InvalidEffectId']);
    });
  });
});
