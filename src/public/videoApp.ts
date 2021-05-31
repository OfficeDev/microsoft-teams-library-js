import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from './constants';
import { registerHandler } from '../internal/handlers';
/**
 * Namespace to video extensibility of the SDK.
 *
 */
export namespace videoApp {
  /**
   * Represents a video frame.
   */
  export interface VideoFrame {
    /**
     * Video frame width.
     */
    width: number;
    /**
     * Video frame height.
     */
    height: number;
    /**
     * Video frame buffer
     */
    data: Uint8ClampedArray;
    /**
     * NV12 luma stride, valid only when video frame format is NV12
     */
    lumaStride: number;
    /**
     * NV12 chroma stride, valid only when video frame format is NV12
     */
    chromaStride: number;
    /**
     * RGB stride, valid only when video frame format is RGB
     */
    stride: number;
  }
  /**
   * Video frame format enum, currentlyl only support NV12
   */
  export enum VideoFrameFormat {
    NV12,
  }
  /**
   * Video frame configuration supplied to Teams to customize the generated video frame parameters, like format.
   */
  export interface VideoFrameConfig {
    /**
     * video format
     */
    format: VideoFrameFormat;
  }

  /**
   *  Video effect change type enum
   */
  export enum EffectChangeType {
    /**
     * current video effect changed.
     */
    EffectChanged,
    /**
     * disable the video effect
     */
    EffectDisabled,
  }

  /**
   *  Video frame call back funtion definition
   */
  type VideoFrameCallback = (
    frame: VideoFrame,
    notifyVideoFrameProcessed: () => void,
    notifyError: (errorMessage: string) => void,
  ) => void;

  /**
   *  Video effect change call back funtion definition
   */
  type VideoEffectCallBack = (effectName: string | undefined) => void;

  /**
   * VideoApp
   */
  class VideoApp {
    private videoFrameCallback: VideoFrameCallback;
    private videoEffectCallback: VideoEffectCallBack;
    /**
     * register to read the video frames in Permissions section.
     */
    public registerForVideoFrame(frameCallback: VideoFrameCallback, config: VideoFrameConfig): void {
      ensureInitialized(FrameContexts.sidePanel);
      this.videoFrameCallback = frameCallback;
      registerHandler('videoApp.newVideoFrame', (videoFrame: VideoFrame) => {
        if (this.videoFrameCallback !== null && videoFrame !== undefined) {
          this.videoFrameCallback(videoFrame, this.notifyVideoFrameProcessed.bind(this), this.notifyError.bind(this));
        }
      });
      registerHandler('videoApp.effectParameterChange', (effectId: string) => {
        if (this.videoEffectCallback !== undefined) {
          this.videoEffectCallback(effectId);
        }
      });
      sendMessageToParent('videoApp.registerForVideoFrame', [config]);
    }

    /**
     * VideoApp extension should call this to notify Teams Client current selected effect parameter changed.
     * If it's pre-meeting, Teams client will call videoEffectCallback immediately then use the videoEffect.
     * in-meeting scenario, we will call videoEffectCallback when apply button clicked.
     */
    public notifySelectedVideoEffectChanged(effectChangeType: EffectChangeType): void {
      ensureInitialized(FrameContexts.sidePanel);
      sendMessageToParent('videoApp.videoEffectChanged', [effectChangeType]);
    }

    /**
     * Register the video effect callback, Teams client uses this to notify the videoApp extension the new video effect will by applied.
     */
    public registerForVideoEffect(callback: VideoEffectCallBack): void {
      this.videoEffectCallback = callback;
    }

    /**
     * sending notification to Teams client finished the video frame processing, now Teams client can render this video frame
     * or pass the video frame to next one in video pipeline.
     */
    private notifyVideoFrameProcessed(): void {
      sendMessageToParent('videoApp.videoFrameProcessed');
    }

    /**
     * sending error notification to Teams client.
     */
    private notifyError(errorMessage: string): void {
      sendMessageToParent('videoApp.notifyError', [errorMessage]);
    }
  } // end of VideoApp

  const videoApp = new VideoApp();

  export function registerForVideoFrame(frameCallback: VideoFrameCallback, config: VideoFrameConfig): void {
    videoApp.registerForVideoFrame(frameCallback, config);
  }

  export function notifySelectedVideoEffectChanged(effectChangeType: EffectChangeType): void {
    videoApp.notifySelectedVideoEffectChanged(effectChangeType);
  }

  export function registerForVideoEffect(callback: VideoEffectCallBack): void {
    videoApp.registerForVideoEffect(callback);
  }
} //end of video namespace
