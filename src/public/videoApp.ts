import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from './constants';
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
    /**
     * Optional; person mask bufer
     */
    personMask?: Uint8ClampedArray;
  }

  /**
   * Video frame format enum
   */
  export enum VideoFrameFormat {
    RGB,
    NV12,
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
    public registerForVideoFrame(frameCallback: VideoFrameCallback, format: VideoFrameFormat): void {
      ensureInitialized(FrameContexts.sidePanel, FrameContexts.meetingStage, FrameContexts.stage);
      this.videoFrameCallback = frameCallback;
      this.setupConnection();
      sendMessageToParent('videoApp.sendMessagePortToMainWindow', [format]);
    }

    /**
     * VideoApp extension should call this to notify Teams Client current selected effect parameter changed.
     * If it's pre-meeting, Teams client will call videoEffectCallback immediately then use the videoEffect.
     * in-meeting scenario, we will call videoEffectCallback when apply button clicked.
     */
    public notifySelectedVideoEffectChanged(effectChangeType: EffectChangeType): void {
      ensureInitialized(FrameContexts.sidePanel, FrameContexts.meetingStage, FrameContexts.stage);
      sendMessageToParent('videoApp.videoEffectChanged', [effectChangeType]);
    }

    /**
     * Register the video effect callback, Teams client uses this to notify the videoApp extension the new video effect will by applied.
     */
    public registerForVideoEffect(callback: VideoEffectCallBack): void {
      ensureInitialized(FrameContexts.sidePanel, FrameContexts.meetingStage, FrameContexts.stage);
      this.videoEffectCallback = callback;
      sendMessageToParent('videoApp.registerForVideoEffect');
    }

    /**
     * Message handler
     */
    private receiveMessage(event: MessageEvent): void {
      ensureInitialized(FrameContexts.content, FrameContexts.task);
      const type = event.data.type;
      if (type === 'videoApp.newVideoFrame' && this.videoFrameCallback != null) {
        const videoFrame = event.data.videoFrame as VideoFrame;
        this.videoFrameCallback(videoFrame, this.notifyVideoFrameProcessed.bind(this), this.notifyError.bind(this));
      } else if (type === 'videoApp.effectParameterChange' && this.videoEffectCallback != null) {
        this.videoEffectCallback('');
      } else {
        console.log('Unsupported message type' + type);
      }
    }

    /**
     * Setup the connection between videoApp and Teams, they use postMessage function to communicate
     */
    private setupConnection(): void {
      ensureInitialized(FrameContexts.sidePanel, FrameContexts.meetingStage, FrameContexts.stage);
      window.addEventListener('message', this.receiveMessage.bind(this), false);
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

  export function registerForVideoFrame(frameCallback: VideoFrameCallback, format: VideoFrameFormat): void {
    videoApp.registerForVideoFrame(frameCallback, format);
  }

  export function notifySelectedVideoEffectChanged(effectChangeType: EffectChangeType): void {
    videoApp.notifySelectedVideoEffectChanged(effectChangeType);
  }

  export function registerForVideoEffect(callback: VideoEffectCallBack): void {
    videoApp.registerForVideoEffect(callback);
  }
} //end of video namespace
