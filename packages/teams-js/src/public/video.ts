import CancelablePromise, { cancelable } from 'cancelable-promise';
import { sendMessageToParent } from '../internal/communication';
import { registerHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { runtime } from './runtime';

/**
 * Namespace to video extensibility of the SDK
 * @beta
 */
export namespace video {
  let effectChangingPromise: CancelablePromise<void> = CancelablePromise.resolve();
  let previousEffect: string | undefined = undefined;
  let activeEffect: string | undefined = undefined;
  let videoEffectChangedHandler: VideoEffectChangedHandler | null = null;

  /**
   * Represents a video frame
   * @beta
   */
  export interface VideoFrame {
    /**
     * Video frame width
     */
    width: number;
    /**
     * Video frame height
     */
    height: number;
    /**
     * Video frame buffer
     */
    data: Uint8ClampedArray;
    /**
     * NV12 luma stride, valid only when video frame format is NV12
     */
    lumaStride?: number;
    /**
     * NV12 chroma stride, valid only when video frame format is NV12
     */
    chromaStride?: number;
    /**
     * RGB stride, valid only when video frame format is RGB
     */
    stride?: number;
  }

  /**
   * Video frame format enum, currently only support NV12
   * @beta
   */
  export enum VideoFrameFormat {
    NV12,
  }

  /**
   * Video frame configuration supplied to the host to customize the generated video frame parameters, like format
   * @beta
   */
  export interface VideoFrameConfig {
    /**
     * Video format
     */
    format: VideoFrameFormat;
  }

  /**
   * Video effect change type enum
   * @beta
   */
  export enum EffectChangeType {
    /**
     * current video effect changed
     */
    EffectChanged,
    /**
     * disable the video effect
     */
    EffectDisabled,
  }

  /**
   * @deprecated
   * As of 2.0.0, please use {@link video.VideoFrameProcessor} instead.
   *
   * Video frame call back function definition
   * @beta
   */
  export type VideoFrameCallback = (
    frame: VideoFrame,
    notifyVideoFrameProcessed: () => void,
    notifyError: (errorMessage: string) => void,
  ) => void;

  /**
   * Video frame handler function definition.
   *
   * @param frame - the {@link video.VideoFrame} to process.
   * @param effectId - the effect id to use while processing.
   *
   * @see {@link video.registerVideoFrameProcessor}
   *
   * @beta
   */
  export type VideoFrameProcessor = (frame: VideoFrame, effectId: string | undefined) => Promise<void> | void;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link video.VideoEffectChangedHandler} instead.
   *
   * Video effect change call back function definition
   * @beta
   */
  export type VideoEffectCallBack = (effectId: string | undefined) => void;

  /**
   * Video effect changing hanlder function definition.
   *
   * @param currentEffectId - the effectId that is currently being used.
   * @param newEffectId - the effectId that user wants to change to.
   *
   * @see {@link video.registerVideoEffectChangingHandler}
   *
   * @beta
   */
  export type VideoEffectChangingHandler = (
    currentEffectId: string | undefined,
    newEffectId: string,
  ) => Promise<void> | void;

  /**
   * Video effect changed handler function definition.
   *
   * @param previousEffectId - the effectId that was previously active.
   * @param currentEffectId - the effectId that is currently being used.
   *
   * @see {@link video.registerVideoEffectChangedHandler}
   */
  export type VideoEffectChangedHandler = (
    previousEffectId: string | undefined,
    currentEffectId: string | undefined,
  ) => void;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link video.registerVideoFrameProcessor} instead.
   *
   * Register to read the video frames in Permissions section
   * @beta
   * @param frameCallback - The callback to invoke when registerForVideoFrame has completed
   * @param config - VideoFrameConfig to customize generated video frame parameters
   */
  export function registerForVideoFrame(frameCallback: VideoFrameCallback, config: VideoFrameConfig): void {
    ensureInitialized(FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    registerHandler('video.newVideoFrame', (videoFrame: VideoFrame) => {
      if (videoFrame !== undefined) {
        frameCallback(videoFrame, notifyVideoFrameProcessed, notifyError);
      }
    });
    sendMessageToParent('video.registerForVideoFrame', [config]);
  }

  /**
   * Register video frame processor

   * @param frameProcessor - The {@link video.VideoFrameProcessor} to register.
   * @param config - {@link video.VideoFrameConfig} to customize generated video frame parameters.
   * 
   * @remarks
   * The video app can process the given {@link video.VideoFrame} either synchronously or asynchronously.
   * If {@param frameProcessor} returns a PromiseLike, we will wait for it to settle before further processing,
   * otherwise we will regard the {@param frameProcessor} has finished its processing synchronously and proceed.
   * 
   * The video app should process the given {@link video.VideoFrame} with the provided {@link video.VideoFrameProcessor effectId} 
   * 
   * Video API gurantees that when an effect change occurs, it first calls
   * {@link video.VideoEffectChangedHandler}. The effectId passed to {@link video.VideoFrameProcessor}
   * remains unchanged until the return vlaue of {@link video.VideoEffectChangedHandler} settles.
   * 
   * @beta
   */
  export function registerVideoFrameProcessor(frameProcessor: VideoFrameProcessor, config: VideoFrameConfig): void {
    ensureInitialized(FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    registerHandler('video.newVideoFrame', (videoFrame: VideoFrame) => {
      if (videoFrame !== undefined) {
        try {
          const maybePromise = frameProcessor(videoFrame, activeEffect);
          if (typeof maybePromise === 'object' && typeof maybePromise.then === 'function') {
            maybePromise.then(notifyVideoFrameProcessed, notifyError).finally(() => {
              if (previousEffect !== activeEffect) {
                videoEffectChangedHandler(previousEffect, activeEffect);
                previousEffect = activeEffect;
              }
            });
          } else {
            notifyVideoFrameProcessed();
            if (previousEffect !== activeEffect) {
              videoEffectChangedHandler(previousEffect, activeEffect);
              previousEffect = activeEffect;
            }
          }
        } catch (e) {
          notifyError(e);
        }
      }
    });

    // [Discussion]: should we introduce new event here?
    sendMessageToParent('video.registerForVideoFrame', [config]);
  }

  /**
   * Video extension should call this to notify host client that the current selected effect parameter changed.
   * If it's pre-meeting, host client will call videoEffectCallback immediately then use the videoEffect.
   * If it's the in-meeting scenario, we will call videoEffectCallback when apply button clicked.
   * @beta
   * @param effectChangeType - the effect change type.
   * @param effectId - Newly selected effect id.
   */
  export function notifySelectedVideoEffectChanged(
    effectChangeType: EffectChangeType,
    effectId: string | undefined,
  ): void {
    ensureInitialized(FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    sendMessageToParent('video.videoEffectChanged', [effectChangeType, effectId]);
  }

  /**
   * @deprecated
   * As of 2.0.0, please use {@link video.registerVideoEffectChangingHandler} instead.
   *
   * Register the video effect callback, host client uses this to notify the video extension the new video effect will by applied
   * @beta
   * @param callback - The VideoEffectCallback to invoke when registerForVideoEffect has completed
   */
  export function registerForVideoEffect(callback: VideoEffectCallBack): void {
    ensureInitialized(FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    registerHandler('video.effectParameterChange', callback);
  }

  /**
   * Register the video effect changed handler, host client uses this to notify the video extension that a new video effect will
   * be applied.
   * @param handler
   *
   * @remarks
   * `handler` will be called when the user picks a new effect and it should prepare any necessary resource that
   * is required to process future video frames with that new effect.
   *
   * If `handler` returns a PromiseLike, host client will wait for its settlement, and the `effectId` to be passed to
   * {@link video.videoFrameProcessor} remains unchanged until the returned PromiseLike settles.
   *
   * This handler will not be called when the user clears existing effect (e.g. effectId === undefined).
   * In that case, {@link video.VideoEffectChangedHandler} will be called directly.
   *
   * @beta
   */
  export function registerVideoEffectChangingHandler(handler: VideoEffectChangingHandler): void {
    ensureInitialized(FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    registerHandler('video.effectParameterChange', (effectId: string | undefined) => {
      effectChangingPromise.cancel();
      if (effectId === undefined) {
        activeEffect = undefined;
      } else {
        const p = handler(previousEffect, effectId);
        if (typeof p === 'object' && typeof p.then === 'function') {
          effectChangingPromise = cancelable(p);
          effectChangingPromise.then(() => {
            previousEffect = activeEffect;
            activeEffect = effectId;
          });
        } else {
          previousEffect = activeEffect;
          activeEffect = effectId;
        }
      }
    });
  }

  /**
   * Register the video effect changed handler, host client uses this to notify the video extension that a new video effect will
   * be applied.
   * @param handler
   *
   * @remarks
   * In case of switching to a new video effect, {@link video.VideoEffectChangingHandler} will be called first,
   * and then after its return value resolves, {@link video.VideoFrameProcessor} will start being called with the new effectId.
   * `handler` is called after the {@link video.VideoFrameProcessor} is called with the new effectId and settled.
   *
   * @beta
   */
  export function registerVideoEffectChangedHandler(handler: VideoEffectChangedHandler): void {
    ensureInitialized(FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    videoEffectChangedHandler = handler;
  }

  /**
   * Sending notification to host client finished the video frame processing, now host client can render this video frame
   * or pass the video frame to next one in video pipeline
   * @beta
   */
  function notifyVideoFrameProcessed(): void {
    sendMessageToParent('video.videoFrameProcessed');
  }

  /**
   * Sending error notification to host client
   * @beta
   * @param error - The error that will be sent to the host
   */
  function notifyError(error: any): void {
    sendMessageToParent('video.notifyError', [
      error instanceof Error ? error.message : 'toString' in error ? error.toString() : 'unknown error',
    ]);
  }

  /**
   * Checks if video capability is supported by the host
   * @beta
   * @returns true if the video capability is enabled in runtime.supports.video and
   * false if it is disabled
   */
  export function isSupported(): boolean {
    return runtime.supports.video ? true : false;
  }
} //end of video namespace
