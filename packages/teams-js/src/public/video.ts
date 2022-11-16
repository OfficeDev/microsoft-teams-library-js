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
    frame: VideoFrame,
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
    ensureInitialized(FrameContexts.sidePanel);
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
   * MediaStream response
   */
  export interface MediaStreamResponse {
    // getTextureStream: ({streamId: string}) => Promise<MediaStream>;
    /**
     * The raw unprocessed MediaStream
     */
    mediaStream: MediaStream;
    // registerTextureStream: ({streamId: string, outputStreamTrack: MediaStreamTrack}) => Promise<void>;
    /**
     * register the processed track to te media stream
     */
    registerOutputStreamTrack: (outputStreamTrack: MediaStreamTrack) => void;

    /**
     * Get metadata of the video frame calulated by the native modules
     */
    getVideoFrameMetaData: (timestamp: number) => { [key: string]: ArrayBuffer };
  }

  type IPCInfoT2 = {
    streamId: string;
  };

  /**
   * get video stream in Permissions section
   * @beta
   */
  export function getVideoStream(config: VideoFrameConfig): Promise<MediaStreamResponse> {
    ensureInitialized(FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    return new Promise((resolve, reject) => {
      registerHandler(
        'video.startVideoExtensibilityVideoStream',
        async (ipcInfo: IPCInfoT2) => {
          if (ipcInfo) {
            const { streamId } = ipcInfo;
            const mediaStream = await window.chrome.webview.getTextureStream(streamId);
            const mediaStreamResponse: MediaStreamResponse = {
              mediaStream,
              registerOutputStreamTrack: (outputStreamTrack: MediaStreamTrack) => {
                // TODO: calculate fps
                window.chrome.webview.registerTextureStream(streamId, outputStreamTrack);
              },
              getVideoFrameMetaData: (timestamp: number) => {
                // TODO: add getVideoFrameMetaData: how does the metadata get to the host?
                return getVideoFrameMetaData(timestamp);
              },
            };
            resolve(mediaStreamResponse);
          }
        },
        false,
      );
    });
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
    ensureInitialized(FrameContexts.sidePanel);
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
    ensureInitialized(FrameContexts.sidePanel);
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
    ensureInitialized();
    return runtime.supports.video ? true : false;
  }
} //end of video namespace
