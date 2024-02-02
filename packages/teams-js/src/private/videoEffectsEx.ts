import { sendMessageToParent } from '../internal/communication';
import { registerHandlerWithVersion } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { inServerSideRenderingEnvironment } from '../internal/utils';
import {
  createEffectParameterChangeCallback,
  DefaultVideoEffectCallBack as VideoEffectCallBack,
  processMediaStream,
  processMediaStreamWithMetadata,
} from '../internal/videoEffectsUtils';
import { VideoPerformanceMonitor } from '../internal/videoPerformanceMonitor';
import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import { runtime } from '../public/runtime';
import { videoEffects } from '../public/videoEffects';

/**
 * @hidden
 * Extended video API
 * @beta
 *
 * @internal
 * Limited to Microsoft-internal use
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const videoEffectsExTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

export namespace videoEffectsEx {
  export const frameProcessingTimeoutInMs = 2000;

  const videoPerformanceMonitor = inServerSideRenderingEnvironment()
    ? undefined
    : new VideoPerformanceMonitor(sendMessageToParent);
  /**
   * @hidden
   * Error level when notifying errors to the host, the host will decide what to do acording to the error level.
   * @beta
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export enum ErrorLevel {
    Fatal = 'fatal',
    Warn = 'warn',
  }
  /**
   * @hidden
   * Video frame configuration supplied to the host to customize the generated video frame parameters
   * @beta
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface VideoFrameConfig extends videoEffects.VideoFrameConfig {
    /**
     * @hidden
     * Flag to indicate use camera stream to synthesize video frame or not.
     * Default value is true.
     * @beta
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    requireCameraStream?: boolean;
    /**
     * @hidden
     * Machine learning model to run in the host to do audio inference for you
     * @beta
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    audioInferenceModel?: ArrayBuffer;
  }

  /**
   * @hidden
   * Represents a video frame
   * @beta
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface VideoBufferData extends videoEffects.VideoBufferData {
    /**
     * @hidden
     * The model output if you passed in an {@linkcode VideoFrameConfig.audioInferenceModel}
     * @beta
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    audioInferenceResult?: Uint8Array;
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

  /**
   * @hidden
   * The callback will be called on every frame when running on the supported host.
   * We require the frame rate of the video to be at least 22fps for 720p, thus the callback should process a frame timely.
   * The video app should call `notifyVideoFrameProcessed` to notify a successfully processed video frame.
   * The video app should call `notifyError` to notify a failure. When the failures accumulate to a certain number(determined by the host), the host will see the app is "frozen" and give the user the option to close the app.
   * @beta
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export type VideoBufferHandler = (
    videoBufferData: VideoBufferData,
    notifyVideoFrameProcessed: () => void,
    notifyError: (errorMessage: string) => void,
  ) => void;

  /**
   * @hidden
   * Video frame data extracted from the media stream. More properties may be added in the future.
   * @beta
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export type VideoFrameData = videoEffects.VideoFrameData & {
    /**
     * @hidden
     * The model output if you passed in an {@linkcode VideoFrameConfig.audioInferenceModel}
     * @beta
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    audioInferenceResult?: Uint8Array;
  };

  /**
   * @hidden
   * The callback will be called on every frame when running on the supported host.
   * We require the frame rate of the video to be at least 22fps for 720p, thus the callback should process a frame timely.
   * The video app should resolve the promise to notify a successfully processed video frame.
   * The video app should reject the promise to notify a failure. When the failures accumulate to a certain number(determined by the host), the host will see the app is "frozen" and give the user the option to close the app.
   * @beta
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export type VideoFrameHandler = (receivedVideoFrame: VideoFrameData) => Promise<videoEffects.VideoFrame>;

  /**
   * @hidden
   * @beta
   * Callbacks and configuration supplied to the host to process the video frames.
   * @internal
   * Limited to Microsoft-internal use
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
   * @hidden
   * Register to process video frames
   * @beta
   *
   * @param parameters - Callbacks and configuration to process the video frames. A host may support either {@link VideoFrameHandler} or {@link VideoBufferHandler}, but not both.
   * To ensure the video effect works on all supported hosts, the video app must provide both {@link VideoFrameHandler} and {@link VideoBufferHandler}.
   * The host will choose the appropriate callback based on the host's capability.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function registerForVideoFrame(parameters: RegisterForVideoFrameParameters): void {
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    if (!parameters.videoFrameHandler || !parameters.videoBufferHandler) {
      throw new Error('Both videoFrameHandler and videoBufferHandler must be provided');
    }

    if (ensureInitialized(runtime, FrameContexts.sidePanel)) {
      registerHandlerWithVersion(
        getApiVersionTag(
          videoEffectsExTelemetryVersionNumber,
          ApiName.VideoEffectsEx_RegisterSetFrameProcessTimeLimitHandler,
        ),
        'video.setFrameProcessTimeLimit',
        (timeLimit: number) => videoPerformanceMonitor?.setFrameProcessTimeLimit(timeLimit),
        false,
      );
      if (runtime.supports.video?.mediaStream) {
        registerHandlerWithVersion(
          getApiVersionTag(
            videoEffectsExTelemetryVersionNumber,
            ApiName.VideoEffectsEx_RegisterStartVideoExtensibilityVideoStreamHandler,
          ),
          'video.startVideoExtensibilityVideoStream',
          async (mediaStreamInfo: { streamId: string; metadataInTexture?: boolean }) => {
            const { streamId, metadataInTexture } = mediaStreamInfo;
            const handler = videoPerformanceMonitor
              ? createMonitoredVideoFrameHandler(parameters.videoFrameHandler, videoPerformanceMonitor)
              : parameters.videoFrameHandler;
            metadataInTexture
              ? await processMediaStreamWithMetadata(streamId, handler, notifyError, videoPerformanceMonitor)
              : await processMediaStream(streamId, handler, notifyError, videoPerformanceMonitor);
          },
          false,
        );
        sendMessageToParent(
          getApiVersionTag(
            videoEffectsExTelemetryVersionNumber,
            ApiName.VideoEffectsEx_MediaStream_RegisterForVideoFrame,
          ),
          'video.mediaStream.registerForVideoFrame',
          [parameters.config],
        );
      } else if (runtime.supports.video?.sharedFrame) {
        registerHandlerWithVersion(
          getApiVersionTag(videoEffectsExTelemetryVersionNumber, ApiName.VideoEffectsEx_RegisterNewVideoFrameHandler),
          'video.newVideoFrame',
          (videoBufferData: VideoBufferData | LegacyVideoBufferData) => {
            if (videoBufferData) {
              videoPerformanceMonitor?.reportStartFrameProcessing(videoBufferData.width, videoBufferData.height);
              const clearProcessingTimeout = createFrameProcessingTimeout();
              const timestamp = videoBufferData.timestamp;
              parameters.videoBufferHandler(
                normalizedVideoBufferData(videoBufferData),
                () => {
                  clearProcessingTimeout();
                  videoPerformanceMonitor?.reportFrameProcessed();
                  notifyVideoFrameProcessed(timestamp);
                },
                notifyError,
              );
            }
          },
          false,
        );
        sendMessageToParent(
          getApiVersionTag(videoEffectsExTelemetryVersionNumber, ApiName.VideoEffectsEx_RegisterForVideoFrame),
          'video.registerForVideoFrame',
          [parameters.config],
        );
      } else {
        // should not happen if isSupported() is true
        throw errorNotSupportedOnPlatform;
      }
      videoPerformanceMonitor?.startMonitorSlowFrameProcessing();
    }
  }

  function createFrameProcessingTimeout(): () => void {
    const frameProcessingTimer = setTimeout(() => {
      notifyError(`Frame not processed in ${frameProcessingTimeoutInMs}ms`, ErrorLevel.Warn);
    }, frameProcessingTimeoutInMs);

    return function clearTimer() {
      clearTimeout(frameProcessingTimer);
    };
  }

  function createMonitoredVideoFrameHandler(
    videoFrameHandler: VideoFrameHandler,
    videoPerformanceMonitor: VideoPerformanceMonitor,
  ): VideoFrameHandler {
    return async (receivedVideoFrame: VideoFrameData): Promise<videoEffects.VideoFrame> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const originalFrame = receivedVideoFrame.videoFrame as any;
      videoPerformanceMonitor.reportStartFrameProcessing(originalFrame.codedWidth, originalFrame.codedHeight);
      const clearProcessingTimeout = createFrameProcessingTimeout();
      const processedFrame = await videoFrameHandler(receivedVideoFrame);
      clearProcessingTimeout();
      videoPerformanceMonitor.reportFrameProcessed();
      return processedFrame;
    };
  }

  function normalizedVideoBufferData(videoBufferData: VideoBufferData | LegacyVideoBufferData): VideoBufferData {
    videoBufferData['videoFrameBuffer'] = videoBufferData['videoFrameBuffer'] || videoBufferData['data'];
    delete videoBufferData['data'];
    return videoBufferData as VideoBufferData;
  }

  /**
   * @hidden
   * Video extension should call this to notify host that the current selected effect parameter changed.
   * If it's pre-meeting, host will call videoEffectCallback immediately then use the videoEffect.
   * If it's the in-meeting scenario, we will call videoEffectCallback when apply button clicked.
   * @beta
   * @param effectChangeType - the effect change type.
   * @param effectId - Newly selected effect id. {@linkcode VideoEffectCallBack}
   * @param effectParam Variant for the newly selected effect. {@linkcode VideoEffectCallBack}
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function notifySelectedVideoEffectChanged(
    effectChangeType: videoEffects.EffectChangeType,
    effectId: string | undefined,
    effectParam?: string,
  ): void {
    ensureInitialized(runtime, FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    sendMessageToParent(
      getApiVersionTag(videoEffectsExTelemetryVersionNumber, ApiName.VideoEffectsEx_NotifySelectedVideoEffectChanged),
      'video.videoEffectChanged',
      [effectChangeType, effectId, effectParam],
    );
  }

  /**
   * @hidden
   * Register the video effect callback, host uses this to notify the video extension the new video effect will by applied
   * @beta
   * @param callback - The VideoEffectCallback to invoke when registerForVideoEffect has completed
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function registerForVideoEffect(callback: VideoEffectCallBack): void {
    ensureInitialized(runtime, FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    registerHandlerWithVersion(
      getApiVersionTag(
        videoEffectsExTelemetryVersionNumber,
        ApiName.VideoEffectsEx_RegisterEffectParameterChangeHandler,
      ),
      'video.effectParameterChange',
      createEffectParameterChangeCallback(callback, videoPerformanceMonitor),
      false,
    );
    sendMessageToParent(
      getApiVersionTag(videoEffectsExTelemetryVersionNumber, ApiName.VideoEffectsEx_RegisterForVideoEffect),
      'video.registerForVideoEffect',
    );
  }

  /**
   * @hidden
   * Personalized video effect
   * @beta
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface PersonalizedEffect {
    /**
     * Personalized effect id
     */
    id: string;
    /**
     * Display name
     */
    name: string;
    /**
     * Effect type defined by app
     */
    type: string;
    /**
     * Data URI of the thumbnail image content encoded in ASCII format using the base64 scheme
     */
    thumbnail: string;
  }

  /**
   * @hidden
   * Send personalized effects to Teams client
   * @beta
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function updatePersonalizedEffects(effects: PersonalizedEffect[]): void {
    ensureInitialized(runtime, FrameContexts.sidePanel);
    if (!videoEffects.isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    sendMessageToParent(
      getApiVersionTag(videoEffectsExTelemetryVersionNumber, ApiName.VideoEffectsEx_UpdatePersonalizedEffects),
      'video.personalizedEffectsChanged',
      [effects],
    );
  }

  /**
   * @hidden
   *
   * Checks if video capability is supported by the host
   * @beta
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   *
   * @returns boolean to represent whether the video capability is supported
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function isSupported(): boolean {
    ensureInitialized(runtime);
    return videoEffects.isSupported();
  }

  /**
   * @hidden
   * Sending notification to host finished the video frame processing, now host can render this video frame
   * or pass the video frame to next one in video pipeline
   * @beta
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  function notifyVideoFrameProcessed(timestamp?: number): void {
    sendMessageToParent(
      getApiVersionTag(videoEffectsExTelemetryVersionNumber, ApiName.VideoEffectsEx_NotifyVideoFrameProcessed),
      'video.videoFrameProcessed',
      [timestamp],
    );
  }

  /**
   * @hidden
   * Sending error notification to host
   * @beta
   * @param errorMessage - The error message that will be sent to the host
   * @param errorLevel - The error level that will be sent to the host
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  function notifyError(errorMessage: string, errorLevel: ErrorLevel = ErrorLevel.Warn): void {
    sendMessageToParent(
      getApiVersionTag(videoEffectsExTelemetryVersionNumber, ApiName.VideoEffectsEx_NotifyError),
      'video.notifyError',
      [errorMessage, errorLevel],
    );
  }

  /**
   * @hidden
   * Sending fatal error notification to host. Call this function only when your app meets fatal error and can't continue.
   * The host will stop the video pipeline and terminate this session, and optionally, show an error message to the user.
   * @beta
   * @param errorMessage - The error message that will be sent to the host
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function notifyFatalError(errorMessage: string): void {
    ensureInitialized(runtime);
    if (!videoEffects.isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    notifyError(errorMessage, ErrorLevel.Fatal);
  }
}
