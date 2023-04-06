import { sendMessageToParent } from '../internal/communication';
import { registerHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import { runtime } from '../public/runtime';
import { video } from '../public/video';

/**
 * @hidden
 * Extended video API
 * @beta
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export namespace videoEx {
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
  export interface VideoFrameConfig extends video.VideoFrameConfig {
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
  export interface VideoFrame extends video.VideoFrame {
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
   * @hidden
   * Video frame call back function
   * @beta
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export type VideoFrameCallback = (
    frame: VideoFrame,
    notifyVideoFrameProcessed: () => void,
    notifyError: (errorMessage: string) => void,
  ) => void;

  /**
   * @hidden
   * Register to process video frames
   * @beta
   *
   * @param frameCallback - The callback to invoke when registerForVideoFrame has completed
   * @param config - VideoFrameConfig to customize generated video frame parameters
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function registerForVideoFrame(frameCallback: VideoFrameCallback, config: VideoFrameConfig): void {
    ensureInitialized(runtime, FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    registerHandler(
      'video.newVideoFrame',
      (videoFrame: VideoFrame) => {
        if (videoFrame) {
          const timestamp = videoFrame.timestamp;
          frameCallback(
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
    effectChangeType: video.EffectChangeType,
    effectId: string | undefined,
    effectParam?: string,
  ): void {
    ensureInitialized(runtime, FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    sendMessageToParent('video.videoEffectChanged', [effectChangeType, effectId, effectParam]);
  }

  /**
   * @hidden
   * Video effect change call back function definition
   * @beta
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export type VideoEffectCallBack = (effectId: string | undefined, effectParam?: string) => void;

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
    registerHandler('video.effectParameterChange', callback, false);
    sendMessageToParent('video.registerForVideoEffect');
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
    if (!video.isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    sendMessageToParent('video.personalizedEffectsChanged', [effects]);
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
    return video.isSupported();
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
    sendMessageToParent('video.videoFrameProcessed', [timestamp]);
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
    sendMessageToParent('video.notifyError', [errorMessage, errorLevel]);
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
    if (!video.isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    notifyError(errorMessage, ErrorLevel.Fatal);
  }
}
