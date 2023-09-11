import { sendMessageToParent } from '../internal/communication';
import { registerHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { inServerSideRenderingEnvironment, ssrSafeWindow } from '../internal/utils';
import { VideoPerformanceMonitor } from '../internal/videoPerformanceMonitor';
import { createEffectParameterChangeCallback, processMediaStream } from '../internal/videoUtils';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { runtime } from './runtime';

/**
 * Namespace to video extensibility of the SDK
 * @beta
 */
export namespace video {
  const videoPerformanceMonitor = inServerSideRenderingEnvironment()
    ? undefined
    : new VideoPerformanceMonitor(sendMessageToParent);

  /** Notify video frame processed function type */
  type notifyVideoFrameProcessedFunctionType = () => void;
  /** Notify error function type */
  type notifyErrorFunctionType = (errorMessage: string) => void;

  /**
   * Represents a video frame
   * @beta
   */
  export interface VideoBufferData {
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
   * @beta
   * Video frame call back function definition
   * The callback will be called on every frame when running on the supported host.
   * We require the frame rate of the video to be at least 22fps for 720p, thus the callback should process a frame timely.
   * The video app should call `notifyVideoFrameProcessed` to notify a successfully processed video frame.
   * The video app should call `notifyError` to notify a failure. When the failures accumulate to a certain number, the host will see the app is "frozen" and ask the user to close it or not.
   */
  export type VideoBufferHandler = (
    videoBufferData: VideoBufferData,
    notifyVideoFrameProcessed: notifyVideoFrameProcessedFunctionType,
    notifyError: notifyErrorFunctionType,
  ) => void;

  /**
   * @beta
   * VideoFrame definition, align with the W3C spec: https://www.w3.org/TR/webcodecs/#videoframe-interface.
   * The current version of typescript doesn't have the definition of VideoFrame so we have to define it here.
   * At runtime it can be cast to VideoFrame directly: `(videoFrame as VideoFrame)`.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface VideoFrame {}

  /**
   * @beta
   * Video frame data extracted from the media stream. More properties may be added in the future.
   */
  export type VideoFrameData = {
    /**
     * The video frame from the media stream.
     */
    videoFrame: VideoFrame;
  };

  /**
   * @beta
   * Video frame call back function definition.
   * The callback will be called on every frame when running on the supported host.
   * We require the frame rate of the video to be at least 22fps for 720p, thus the callback should process a frame timely.
   * The video app should resolve the promise to notify a successfully processed video frame.
   * The video app should reject the promise to notify a failure. When the failures accumulate to a certain number, the host will see the app is "frozen" and ask the user to close it or not.
   */
  export type VideoFrameHandler = (receivedVideoFrame: VideoFrameData) => Promise<VideoFrame>;

  /**
   * @beta
   * Callbacks and configuration supplied to the host to process the video frames.
   */
  export type RegisterForVideoFrameParameters = {
    /**
     * Callback function to process the video frames extracted from a media stream.
     */
    videoFrameHandler: VideoFrameHandler;
    /**
     * Callback function to process the video frames shared by the host.
     */
    videoBufferHandler: VideoBufferHandler;
    /**
     * Video frame configuration supplied to the host to customize the generated video frame parameters, like format
     */
    config: VideoFrameConfig;
  };

  /**
   * Register callbacks to process the video frames if the host supports it.
   * @beta
   * @param parameters - Callbacks and configuration to process the video frames. A host may support either {@link VideoFrameHandler} or {@link VideoBufferHandler}, but not both.
   * To ensure the video effect works on all supported hosts, the video app must provide both {@link VideoFrameHandler} and {@link VideoBufferHandler}.
   * The host will choose the appropriate callback based on the host's capability.
   *
   * @example
   * ```typescript
   * video.registerForVideoFrame({
   *   videoFrameHandler: async (videoFrameData) => {
   *     const originalFrame = videoFrameData.videoFrame as VideoFrame;
   *     try {
   *       const processedFrame = await processFrame(originalFrame);
   *       return processedFrame;
   *     } catch (e) {
   *       throw e;
   *     }
   *   },
   *   videoBufferHandler: (
   *     bufferData: VideoBufferData,
   *     notifyVideoFrameProcessed: notifyVideoFrameProcessedFunctionType,
   *     notifyError: notifyErrorFunctionType
   *     ) => {
   *       try {
   *         processFrameInplace(bufferData);
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
  export function registerForVideoFrame(parameters: RegisterForVideoFrameParameters): void {
    ensureInitialized(runtime, FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    if (!parameters.videoFrameHandler || !parameters.videoBufferHandler) {
      throw new Error('Both videoFrameHandler and videoBufferHandler must be provided');
    }
    registerHandler(
      'video.setFrameProcessTimeLimit',
      (timeLimitInfo: { timeLimit: number }) =>
        videoPerformanceMonitor?.setFrameProcessTimeLimit(timeLimitInfo.timeLimit),
      false,
    );
    if (doesSupportMediaStream()) {
      registerForMediaStream(parameters.videoFrameHandler, parameters.config);
    } else if (doesSupportSharedFrame()) {
      registerForVideoBuffer(parameters.videoBufferHandler, parameters.config);
    } else {
      // should not happen if isSupported() is true
      throw errorNotSupportedOnPlatform;
    }
    videoPerformanceMonitor?.startMonitorSlowFrameProcessing();
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
    registerHandler(
      'video.effectParameterChange',
      createEffectParameterChangeCallback(callback, videoPerformanceMonitor),
      false,
    );
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
      /** A host should support either mediaStream or sharedFrame sub-capability to support the video capability */
      (!!runtime.supports.video.mediaStream || !!runtime.supports.video.sharedFrame)
    );
  }

  function registerForMediaStream(videoFrameHandler: VideoFrameHandler, config: VideoFrameConfig): void {
    ensureInitialized(runtime, FrameContexts.sidePanel);
    if (!isSupported() || !doesSupportMediaStream()) {
      throw errorNotSupportedOnPlatform;
    }

    registerHandler(
      'video.startVideoExtensibilityVideoStream',
      async (mediaStreamInfo: { streamId: string }) => {
        // when a new streamId is ready:
        const { streamId } = mediaStreamInfo;
        const monitoredVideoFrameHandler = createMonitoredVideoFrameHandler(videoFrameHandler, videoPerformanceMonitor);
        await processMediaStream(streamId, monitoredVideoFrameHandler, notifyError, videoPerformanceMonitor);
      },
      false,
    );

    sendMessageToParent('video.mediaStream.registerForVideoFrame', [config]);
  }

  function createMonitoredVideoFrameHandler(
    videoFrameHandler: VideoFrameHandler,
    videoPerformanceMonitor?: VideoPerformanceMonitor,
  ): VideoFrameHandler {
    return async (videoFrameData: VideoFrameData): Promise<VideoFrame> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const originalFrame = videoFrameData.videoFrame as any;
      videoPerformanceMonitor?.reportStartFrameProcessing(originalFrame.codedWidth, originalFrame.codedHeight);
      const processedFrame = await videoFrameHandler(videoFrameData);
      videoPerformanceMonitor?.reportFrameProcessed();
      return processedFrame;
    };
  }

  /**
   * Old video frame data structure, almost identical to the {@link VideoBufferData} except `videoFrameBuffer` is named as `data`.
   * Old host like the old Teams passes this data to the SDK. It will be deprecated in the future.
   */
  type LegacyVideoBufferData = Omit<VideoBufferData, 'videoFrameBuffer'> & {
    /**
     * Video frame buffer
     */
    data: Uint8ClampedArray;
  };

  function registerForVideoBuffer(videoBufferHandler: VideoBufferHandler, config: VideoFrameConfig): void {
    ensureInitialized(runtime, FrameContexts.sidePanel);
    if (!isSupported() || !doesSupportSharedFrame()) {
      throw errorNotSupportedOnPlatform;
    }

    registerHandler(
      'video.newVideoFrame',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (videoBufferData: VideoBufferData | LegacyVideoBufferData) => {
        if (videoBufferData) {
          const timestamp = videoBufferData.timestamp;
          videoPerformanceMonitor?.reportStartFrameProcessing(videoBufferData.width, videoBufferData.height);
          videoBufferHandler(
            normalizeVideoBufferData(videoBufferData),
            () => {
              videoPerformanceMonitor?.reportFrameProcessed();
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

  function normalizeVideoBufferData(videoBufferData: VideoBufferData | LegacyVideoBufferData): VideoBufferData {
    if ('videoFrameBuffer' in videoBufferData) {
      return videoBufferData;
    } else {
      // The host may pass the VideoFrame with the old definition which has `data` instead of `videoFrameBuffer`
      const { data, ...newVideoBufferData } = videoBufferData;
      return {
        ...newVideoBufferData,
        videoFrameBuffer: data,
      };
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
    return !!(
      ssrSafeWindow()['chrome']?.webview?.getTextureStream && ssrSafeWindow()['chrome']?.webview?.registerTextureStream
    );
  }

  function doesSupportSharedFrame(): boolean {
    return ensureInitialized(runtime, FrameContexts.sidePanel) && !!runtime.supports.video?.sharedFrame;
  }
} //end of video namespace
