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
  export type VideoFrameCallback = (
    frame: VideoFrameData,
    notifyVideoFrameProcessed: () => void,
    notifyError: (errorMessage: string) => void,
  ) => void;

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
   * Register to read the video frames in Permissions section
   * @beta
   * @param frameCallback - The callback to invoke when registerForVideoFrame has completed
   * @param config - VideoFrameConfig to customize generated video frame parameters
   */
  export function registerForVideoFrame(frameCallback: VideoFrameCallback, config: VideoFrameConfig): void {
    ensureInitialized(runtime, FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    registerHandler(
      'video.newVideoFrame',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (videoFrame: any) => {
        if (videoFrame) {
          // The host may pass the VideoFrame with the old definition which has `data` instead of `videoFrameBuffer`
          const videoFrameData = {
            ...videoFrame,
            videoFrameBuffer: videoFrame.videoFrameBuffer || videoFrame.data,
          } as VideoFrameData;
          const timestamp = videoFrameData.timestamp;
          frameCallback(
            videoFrameData,
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
   * Checks if video capability is supported by the host
   * @beta
   * @returns boolean to represent whether the video capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   *
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.video ? true : false;
  }

  /**
   * @beta
   * Namespace to get video frames from a media stream.
   * When the host supports this capability, developer should call {@link mediaStream.registerForVideoFrame} to get the video frames instead of {@link registerForVideoFrame} to get the video frames, callback of {@link registerForVideoFrame} will be ignored when the host supports this capability.
   */
  export namespace mediaStream {
    /**
     * @beta
     * Checks if video.mediaStream capability is supported by the host
     * @returns boolean to represent whether the video.medisStream capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     *
     */
    export function isSupported(): boolean {
      return ensureInitialized(runtime) && isTextureStreamAvailable() && !!runtime.supports.video?.mediaStream;
    }

    function isTextureStreamAvailable(): boolean {
      return (
        typeof window !== 'undefined' &&
        !!(window['chrome']?.webview?.getTextureStream && window['chrome']?.webview?.registerTextureStream)
      );
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
    export type VideoFrameCallback = (receivedVideoFrame: MediaStreamFrameData) => Promise<VideoFrame>;

    type MediaStreamInfo = {
      streamId: string;
    };

    /**
     * @beta
     * Register to read the video frames from the media stream provided by the host.
     * @param frameCallback - The callback to invoke when recieve a video frame from the media stream.
     * @example
     * ```typescript
     * video.mediaStream.registerForVideoFrame(async (receivedVideoFrame) => {
     *  const { videoFrame } = receivedVideoFrame;
     *  try {
     *    return await processVideoFrame(videoFrame);
     *  } catch (error) {
     *   throw error;
     *  }
     * });
     * ```
     */
    export function registerForVideoFrame(frameCallback: VideoFrameCallback): void {
      ensureInitialized(runtime, FrameContexts.sidePanel);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

      registerHandler('video.startVideoExtensibilityVideoStream', async (mediaStreamInfo: MediaStreamInfo) => {
        // when a new streamId is ready:
        const { streamId } = mediaStreamInfo;
        const videoTrack = await getInputVideoTrack(streamId);
        const generator = createProcessedStreamGenerator(videoTrack, frameCallback);
        // register the video track with processed frames back to the stream:
        typeof window !== 'undefined' && window['chrome']?.webview?.registerTextureStream(streamId, generator);
      });

      sendMessageToParent('video.registerForVideoFrame', [
        {
          format: VideoFrameFormat.NV12,
        },
      ]);
    }

    /**
     * Get the video track from the media stream gotten from chrome.webview.getTextureStream(streamId).
     */
    async function getInputVideoTrack(streamId: string): Promise<MediaStreamVideoTrack> {
      if (typeof window === 'undefined') {
        throw errorNotSupportedOnPlatform;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const chrome = window['chrome'] as any;
      try {
        const mediaStream = await chrome.webview.getTextureStream(streamId);
        const tracks = mediaStream.getVideoTracks();
        if (tracks.length === 0) {
          throw new Error(`No video track in stream ${streamId}`);
        }
        return tracks[0];
      } catch (error) {
        const errorMsg = `Failed to get video track from stream ${streamId}, error: ${error}`;
        notifyError(errorMsg);
        throw new Error(errorMsg);
      }
    }

    /**
     * The function to create a processed video track from the original video track.
     * It reads frames from the video track and pipes them to the video frame callback to process the frames.
     * The processed frames are then enqueued to the generator.
     * The generator can be registered back to the media stream so that the host can get the processed frames.
     */
    function createProcessedStreamGenerator(
      videoTrack: MediaStreamVideoTrack,
      videoFrameCallback: VideoFrameCallback,
    ): MediaStreamTrack {
      const processor = new MediaStreamTrackProcessor({ track: videoTrack });
      const source = processor.readable;
      const generator = new MediaStreamTrackGenerator({ kind: 'video' });
      const sink = generator.writable;

      source
        .pipeThrough(
          new TransformStream({
            async transform(originalFrame, controller) {
              const timestamp = originalFrame.timestamp;
              if (timestamp !== null) {
                try {
                  const frameProcessedByApp = await videoFrameCallback({ videoFrame: originalFrame });
                  // the current typescript version(4.6.4) dosn't support webcodecs API fully, we have to do type conversion here.
                  const processedFrame = new VideoFrame(frameProcessedByApp as unknown as CanvasImageSource, {
                    // we need the timestamp to be unchanged from the oirginal frame, so we explicitly set it here.
                    timestamp: timestamp,
                  });
                  controller.enqueue(processedFrame);
                  originalFrame.close();
                  frameProcessedByApp.close();
                } catch (error) {
                  originalFrame.close();
                  notifyError(error);
                }
              } else {
                notifyError('timestamp of the original video frame is null');
              }
            },
          }),
        )
        .pipeTo(sink);
      return generator;
    }
  }
} //end of video namespace
