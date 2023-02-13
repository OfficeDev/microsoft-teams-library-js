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
  export type VideoFrameCallback = (
    frame: VideoFrameData,
    notifyVideoFrameProcessed: () => void,
    notifyError: (errorMessage: string) => void,
  ) => void;

  /**
   * Video effect change call back function definition
   * @beta
   */
  export type VideoEffectCallBack = (effectId: string | undefined) => void;

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
      (videoFrame: VideoFrameData) => {
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
   * Register the video effect callback, host uses this to notify the video extension the new video effect will by applied
   * @beta
   * @param callback - The VideoEffectCallback to invoke when registerForVideoEffect has completed
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

  export namespace MediaStream {
    export function isSupported(): boolean {
      return video.isSupported() && textureStreamAvailable() && runtime.supports.videoMediaStream;
    }

    
    function textureStreamAvailable(): boolean {
      return !!(window['chrome']?.webview?.getTextureStream && window['chrome']?.webview?.registerTextureStream);
    }

    export type ReceivedVideoFrame = {
      videoFrame: VideoFrame;
    }

    /**
     * Video effect change call back function definition.
     * The video app should resolve the promise to notify a successfully processed video frame.
     * The video app should reject the promise to notify a failure.
     */
    export type VideoFrameCallback = (receivedVideoFrame: ReceivedVideoFrame) => Promise<VideoFrame>;

    type MediaStreamInfo = {
      streamId: string;
    };

    export function registerForVideoFrame(frameCallback: VideoFrameCallback): void {
      ensureInitialized(runtime, FrameContexts.sidePanel);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

      try {
        registerHandler('video.startVideoExtensibilityVideoStream', async (mediaStreamInfo: MediaStreamInfo) => {
          // when a new streamId is ready:
          const { streamId } = mediaStreamInfo;
          const videoTrack = await getInputVideoTrack(streamId);
          const generator = createProcessedStreamGenerator(videoTrack, frameCallback);
          window['chrome']?.webview?.registerTextureStream(streamId, generator);
        })
      } catch (error) {
        // throw error;
      }
      
    }

    async function getInputVideoTrack(streamId: string): Promise<MediaStreamVideoTrack> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const chrome = window['chrome'] as any;
      const mediaStream = await chrome.webview.getTextureStream(streamId);
      
      return mediaStream.getVideoTracks()[0];
    }

    function createProcessedStreamGenerator(
      videoTrack: MediaStreamVideoTrack,
      invokeCallback: VideoFrameCallback,
    ): MediaStreamTrack {
      const processor = new MediaStreamTrackProcessor({ track: videoTrack as MediaStreamVideoTrack });
      const source = processor.readable;
      const generator = new MediaStreamTrackGenerator({ kind: 'video' });
      const sink = generator.writable;
  
      source
        .pipeThrough(
          new TransformStream({
            async transform(receivedFrame, controller) {
              const timestamp = receivedFrame.timestamp;
  
              if (timestamp !== null) {
                invokeCallback({videoFrame: receivedFrame})
                  .then(async (frameProcessedByApp) => {
                    //console.log('receved processed video frame', videoFrame);
                    const buffer = new ArrayBuffer(frameProcessedByApp.allocationSize());
                    await frameProcessedByApp.copyTo(buffer);
                    const processedFrame = new VideoFrame(buffer, {
                      codedHeight: frameProcessedByApp.codedHeight,
                      codedWidth: frameProcessedByApp.codedWidth,
                      format: frameProcessedByApp.format,
                      timestamp: timestamp,
                    });
                    controller.enqueue(processedFrame);
                    receivedFrame.close();
                    frameProcessedByApp.close();
  
                  })
                  .catch((error) => {
                    console.log(`debug: error in generator: ${error}`);
                    notifyError(error);
                  });
              }
            },
          }),
        )
        .pipeTo(sink);
      return generator;
    }

  }
} //end of video namespace
