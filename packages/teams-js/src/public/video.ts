import { sendMessageToParent } from '../internal/communication';
import { registerHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { processMediaStream } from '../internal/mediaStreamUtils';
import {
  AllowSharedBufferSource,
  PlaneLayout,
  VideoFrameCopyToOptions,
  VideoPixelFormat,
} from '../internal/VideoFrameTypes';
import { inServerSideRenderingEnvironment } from '../private/inServerSideRenderingEnvironment';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { runtime } from './runtime';

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
    /**
     * Returns the height of the VideoFrame in pixels, potentially including non-visible padding, and prior to considering potential ratio adjustments.
     */
    readonly codedHeight: number;
    /**
     * Returns a DOMRectReadOnly with the width and height matching codedWidth and codedHeight.
     */
    readonly codedRect: DOMRectReadOnly | null;
    /**
     * Returns the width of the VideoFrame in pixels, potentially including non-visible padding, and prior to considering potential ratio adjustments.
     */
    readonly codedWidth: number;
    /**
     * Returns a VideoColorSpace object.
     */
    readonly colorSpace: VideoColorSpace;
    /**
     * Returns the height of the VideoFrame when displayed after applying aspect ratio adjustments.
     */
    readonly displayHeight: number;
    /**
     * Returns the width of the VideoFrame when displayed after applying aspect ratio adjustments.
     */
    readonly displayWidth: number;
    /**
     * Returns an integer indicating the duration of the video in microseconds.
     */
    readonly duration: number | null;
    /**
     * Returns the pixel format of the VideoFrame.
     */
    readonly format: VideoPixelFormat | null;
    /**
     * Returns an integer indicating the timestamp of the video in microseconds.
     */
    readonly timestamp: number | null;
    /**
     * Returns a DOMRectReadOnly describing the visible rectangle of pixels for this VideoFrame.
     */
    readonly visibleRect: DOMRectReadOnly | null;
    /**
     * Returns the number of bytes required to hold the VideoFrame as filtered by options passed into the method.
     */
    allocationSize(options?: VideoFrameCopyToOptions): number;
    /**
     * Creates a new VideoFrame object with reference to the same media resource as the original.
     */
    clone(): VideoFrame;
    /**
     * Clears all states and releases the reference to the media resource.
     */
    close(): void;
    /**
     * Copies the contents of the VideoFrame to an ArrayBuffer.
     */
    copyTo(destination: AllowSharedBufferSource, options?: VideoFrameCopyToOptions): Promise<PlaneLayout[]>;
  }

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
    NV12 = 'NV12',
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
    EffectChanged = 'EffectChanged',
    /**
     * Disable the video effect
     */
    EffectDisabled = 'EffectDisabled',
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

  /**
   * @beta
   * Callbacks and configuration supplied to the host to process the video frames.
   */
  export type VideoFrameCallbackOptions = {
    /**
     * Callback function to process the video frames extracted from a media stream.
     */
    mediaStreamCallback: MediaStreamCallback;
    /**
     * Callback function to process the video frames shared by the host.
     */
    sharedFrameCallback: SharedFrameCallback;
    /**
     * Video frame configuration supplied to the host to customize the generated video frame parameters, like format
     */
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

  type MediaStreamInfo = {
    streamId: string;
  };

  /**
   * Register to read the video frames in Permissions section
   * @beta
   * @param option - Callbacks and configuration to process the video frames. A host may support either {@link MediaStreamCallback} or {@link SharedFrameCallback}, but not both.
   * To ensure the video effect works on all supported hosts, the video app should provide both {@link MediaStreamCallback} and {@link SharedFrameCallback}.
   * The host will choose the appropriate callback based on the host's capability.
   *
   * @example
   * ```typescript
   * video.registerForVideoFrame({
   *   mediaStreamCallback: async (receivedVideoFrame) => {
   *     const originalFrame = receivedVideoFrame.videoFrame;
   *     try {
   *       const processedFrame = await processFrame(originalFrame);
   *       return processedFrame;
   *     } catch (e) {
   *       throw e;
   *     }
   *   },
   *   sharedFrameCallback: (
   *     frame: VideoFrameData,
   *     notifyVideoFrameProcessed: notifyVideoFrameProcessedFunctionType,
   *     notifyError: notifyErrorFunctionType
   *     ) => {
   *       try {
   *         processFrameInplace(frame);
   *         notifyVideoFrameProcessed();
   *       } catch (e) {
   *         notifyError(e);
   *       }
   *     },
   *   config: {
   *     format: video.VideoPixelFormat.NV12,
   *   }
   * });
   * ```
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

  function registerForMediaStream(mediaStreamCallback: MediaStreamCallback): void {
    ensureInitialized(runtime, FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    registerHandler('video.startVideoExtensibilityVideoStream', async (mediaStreamInfo: MediaStreamInfo) => {
      // when a new streamId is ready:
      const { streamId } = mediaStreamInfo;
      const generator = await processMediaStream(streamId, mediaStreamCallback, notifyError);
      // register the video track with processed frames back to the stream:
      !inServerSideRenderingEnvironment() && window['chrome']?.webview?.registerTextureStream(streamId, generator);
    });

    sendMessageToParent('video.mediaStream.registerForVideoFrame', [
      {
        format: VideoFrameFormat.NV12,
      },
    ]);
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
