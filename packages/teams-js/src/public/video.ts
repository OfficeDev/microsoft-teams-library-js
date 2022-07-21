import { sendMessageToParent } from '../internal/communication';
import { registerHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { runtime } from './runtime';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const NOOP = (): void => {};

/**
 * Namespace to video extensibility of the SDK
 * @beta
 */
export namespace video {
  let activeEffectId: string | undefined = undefined;
  let requestedEffectId: string | undefined = undefined;
  let unloadPreviousEffect: () => void = NOOP;
  let unloadActiveEffect: () => void = NOOP;

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
    /**
     * The ID of the effect that should be applied on this frame
     */
    effectId: string | undefined;
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
   * Video frame call back function definition
   * @beta
   */
  export type VideoFrameCallback = (
    frame: VideoFrame,
    notifyVideoFrameProcessed: () => void,
    notifyError: (errorMessage: string) => void,
  ) => void;

  /**
   * Video effect change call back function definition
   * @beta
   */
  export type VideoEffectCallBack = (effectId: string | undefined) => void | Promise<void> | Promise<() => void>;

  /**
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

    registerHandler('video.newVideoFrame', async (videoFrame: Omit<VideoFrame, 'effectId'>) => {
      if (videoFrame !== undefined) {
        frameCallback({ ...videoFrame, effectId: activeEffectId }, notifyVideoFrameProcessed, notifyError);
      }
    });
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
   * Register the video effect callback, host client uses this to notify the video extension the new video effect will by applied
   * @beta
   * @param callback - The VideoEffectCallback to invoke when registerForVideoEffect has completed
   */
  export function registerForVideoEffect(callback: VideoEffectCallBack): void {
    ensureInitialized(FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    registerHandler('video.effectParameterChange', async (effectId: string | undefined) => {
      requestedEffectId = effectId;
      const unload = await callback(effectId);
      const unloadFunction = typeof unload === 'function' ? unload : NOOP;
      if (requestedEffectId === effectId) {
        activeEffectId = effectId;
        requestedEffectId = undefined;
        unloadPreviousEffectIfNeeded();
        unloadPreviousEffect = unloadActiveEffect;
        unloadActiveEffect = unloadFunction;
      } else {
        unloadFunction();
      }
    });
  }

  /**
   * Sending notification to host client finished the video frame processing, now host client can render this video frame
   * or pass the video frame to next one in video pipeline
   * @beta
   */
  function notifyVideoFrameProcessed(): void {
    unloadPreviousEffectIfNeeded();
    sendMessageToParent('video.videoFrameProcessed');
  }

  /**
   * Sending error notification to host client
   * @beta
   * @param errorMessage - The error message that will be sent to the host
   */
  function notifyError(errorMessage: string): void {
    unloadPreviousEffectIfNeeded();
    sendMessageToParent('video.notifyError', [errorMessage]);
  }

  /**
   * Unloads previous effect if needed.
   */
  function unloadPreviousEffectIfNeeded(): void {
    if (unloadPreviousEffect !== NOOP) {
      unloadPreviousEffect();
      unloadPreviousEffect = NOOP;
    }
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
