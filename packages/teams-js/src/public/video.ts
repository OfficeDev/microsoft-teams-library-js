import { sendMessageToParent } from '../internal/communication';
import { registerHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { inServerSideRenderingEnvironment } from '../private/inServerSideRenderingEnvironment';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { runtime } from './runtime';
import {
  AllowSharedBufferSource,
  PlaneLayout,
  VideoFrameBufferInit,
  VideoFrameCopyToOptions,
  VideoFrameInit,
  VideoPixelFormat,
} from './VideoFrameTypes';

/**
 * Namespace to video extensibility of the SDK
 * @beta
 */
export namespace video {
  /** Notify video frame processed function type */
  type notifyVideoFrameProcessedFunctionType = () => void;
  /** Notify error function type */
  type notifyErrorFunctionType = (errorMessage: string) => void;

  /**
   * @beta
   * VideoFrame definition, align with the W3C spec: https://www.w3.org/TR/webcodecs/
   */
  export interface VideoFrame {
    readonly codedHeight: number;
    readonly codedRect: DOMRectReadOnly | null;
    readonly codedWidth: number;
    readonly colorSpace: VideoColorSpace;
    readonly displayHeight: number;
    readonly displayWidth: number;
    readonly duration: number | null;
    readonly format: VideoPixelFormat | null;
    readonly timestamp: number | null;
    readonly visibleRect: DOMRectReadOnly | null;
    allocationSize(options?: VideoFrameCopyToOptions): number;
    clone(): VideoFrame;
    close(): void;
    copyTo(destination: AllowSharedBufferSource, options?: VideoFrameCopyToOptions): Promise<PlaneLayout[]>;
  }

  /**
   * VideoFrame definition, align with the W3C spec: https://www.w3.org/TR/webcodecs/
   */
  // eslint-disable-next-line strict-null-checks/all
  declare const VideoFrame: {
    prototype: VideoFrame;
    new (source: CanvasImageSource, init?: VideoFrameInit): VideoFrame;
    new (data: AllowSharedBufferSource, init: VideoFrameBufferInit): VideoFrame;
  };

  /**
   * @beta
   * Video frame data extracted from the media stream. More properties may be added in the future.
   */
  export type MediaStreamFrameData = {
    /**
     * The video frame from the media stream.
     */
    videoFrame: VideoFrame;
  };

  /**
   * @beta
   * Video effect change call back function definition.
   * The video app should resolve the promise to notify a successfully processed video frame.
   * The video app should reject the promise to notify a failure.
   */
  export type MediaStreamCallback = (receivedVideoFrame: MediaStreamFrameData) => Promise<VideoFrame>;

  /**
   * Represents a video frame
   * @beta
   */
  export interface VideoFrameData {
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
    videoFrameBuffer: Uint8ClampedArray;
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
     * The time stamp of the current video frame
     */
    timestamp?: number;
  }

  /**
   * Video frame format enum, currently only support NV12
   * @beta
   */
  export enum VideoFrameFormat {
    /** Video format used for encoding and decoding YUV color data in video streaming and storage applications. */
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
     * Current video effect changed
     */
    EffectChanged,
    /**
     * Disable the video effect
     */
    EffectDisabled,
  }

  /**
   * Video frame call back function definition
   * @beta
   */
  export type SharedFrameCallback = (
    frame: VideoFrameData,
    notifyVideoFrameProcessed: notifyVideoFrameProcessedFunctionType,
    notifyError: notifyErrorFunctionType,
  ) => void;

  export type VideoFrameCallbackOptions = {
    mediaStreamCallback: MediaStreamCallback;
    sharedFrameCallback: SharedFrameCallback;
    config: VideoFrameConfig;
  };

  /**
   * Predefined failure reasons for preparing the selected video effect
   * @beta
   */
  export enum EffectFailureReason {
    /**
     * A wrong effect id is provide.
     * Use this reason when the effect id is not found or empty, this may indicate a mismatch between the app and its manifest or a bug of the host.
     */
    InvalidEffectId = 'InvalidEffectId',
    /**
     * The effect can't be initialized
     */
    InitializationFailure = 'InitializationFailure',
  }

  /**
   * Video effect change call back function definition
   * Return a Promise which will be resolved when the effect is prepared, or throw an {@link EffectFailureReason} on error.
   * @beta
   */
  export type VideoEffectCallback = (effectId: string | undefined) => Promise<void>;

  /**
   * TODO: update doc later
   * Register to read the video frames in Permissions section
   * @beta
   * @param videoBufferCallback - The callback to invoke when registerForVideoFrame has completed
   * @param config - VideoFrameConfig to customize generated video frame parameters
   */
  export function registerForVideoFrame(option: VideoFrameCallbackOptions): void {
    ensureInitialized(runtime, FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    if (doesSupportMediaStream()) {
      registerForMediaStream(option.mediaStreamCallback);
    } else if (doesSupportSharedFrame()) {
      registerForSharedFrame(option.sharedFrameCallback, option.config);
    } else {
      // should not happen if isSupported() is true
      throw errorNotSupportedOnPlatform;
    }
  }

  function doesSupportMediaStream(): boolean {
    return (
      ensureInitialized(runtime, FrameContexts.sidePanel) &&
      isTextureStreamAvailable() &&
      !!runtime.supports.video?.mediaStream
    );
  }

  function isTextureStreamAvailable(): boolean {
    return (
      !inServerSideRenderingEnvironment() &&
      !!(window['chrome']?.webview?.getTextureStream && window['chrome']?.webview?.registerTextureStream)
    );
  }

  function doesSupportSharedFrame(): boolean {
    return ensureInitialized(runtime, FrameContexts.sidePanel) && !!runtime.supports.video?.sharedFrame;
  }

  function registerForSharedFrame(videoBufferCallback: SharedFrameCallback, config: VideoFrameConfig): void {
    ensureInitialized(runtime, FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    registerHandler(
      'video.newVideoFrame',
      (videoFrame: VideoFrameData) => {
        if (videoFrame) {
          const timestamp = videoFrame.timestamp;
          videoBufferCallback(
            videoFrame,
            () => {
              notifyVideoFrameProcessed(timestamp);
            },
            notifyError,
          );
        }
      },
      false,
    );
    sendMessageToParent('video.registerForVideoFrame', [config]);
  }

  /**
   * Video extension should call this to notify host that the current selected effect parameter changed.
   * If it's pre-meeting, host will call videoEffectCallback immediately then use the videoEffect.
   * If it's the in-meeting scenario, we will call videoEffectCallback when apply button clicked.
   * @beta
   * @param effectChangeType - the effect change type.
   * @param effectId - Newly selected effect id.
   */
  export function notifySelectedVideoEffectChanged(
    effectChangeType: EffectChangeType,
    effectId: string | undefined,
  ): void {
    ensureInitialized(runtime, FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    sendMessageToParent('video.videoEffectChanged', [effectChangeType, effectId]);
  }

  /**
   * Register a callback to be notified when a new video effect is applied.
   * @beta
   * @param callback - Function to be called when new video effect is applied.
   */
  export function registerForVideoEffect(callback: VideoEffectCallback): void {
    ensureInitialized(runtime, FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    const effectParameterChangeHandler = (effectId: string | undefined): void => {
      callback(effectId)
        .then(() => {
          sendMessageToParent('video.videoEffectReadiness', [true, effectId]);
        })
        .catch((reason) => {
          const validReason = reason in EffectFailureReason ? reason : EffectFailureReason.InitializationFailure;
          sendMessageToParent('video.videoEffectReadiness', [false, effectId, validReason]);
        });
    };

    registerHandler('video.effectParameterChange', effectParameterChangeHandler, false);
    sendMessageToParent('video.registerForVideoEffect');
  }

  /**
   * Sending notification to host finished the video frame processing, now host can render this video frame
   * or pass the video frame to next one in video pipeline
   * @beta
   */
  function notifyVideoFrameProcessed(timestamp?: number): void {
    sendMessageToParent('video.videoFrameProcessed', [timestamp]);
  }

  /**
   * Sending error notification to host
   * @beta
   * @param errorMessage - The error message that will be sent to the host
   */
  function notifyError(errorMessage: string): void {
    sendMessageToParent('video.notifyError', [errorMessage]);
  }

  /**
   * Checks if video capability is supported by the host.
   * @beta
   * @returns boolean to represent whether the video capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   *
   */
  export function isSupported(): boolean {
    return (
      ensureInitialized(runtime) &&
      !!runtime.supports.video &&
      /** A host should support either mediaStream or sharedFrame subcapability to support the video capability */
      (!!runtime.supports.video.mediaStream || !!runtime.supports.video.sharedFrame)
    );
  }
} //end of video namespace
