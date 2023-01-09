/* eslint-disable @typescript-eslint/no-unused-vars */
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
    frame: VideoFrame,
    notifyVideoFrameProcessed: () => void,
    notifyError: (errorMessage: string) => void,
  ) => void;

  export type RecievedVideoFrame = {
    frame: globalThis.VideoFrame;
  };

  /**
   * Video effect change call back function definition.
   * The video app should resolve the promise to notify a successfully processed video frame.
   * The video app should reject the promise to notify a failure.
   */
  export type VideoFrameCallbackV2 = (receivedVideoFrame: RecievedVideoFrame) => Promise<globalThis.VideoFrame>;

  /**
   * Video effect change call back function definition
   * @beta
   */
  export type VideoEffectCallBack = (effectId: string | undefined) => void;

  export enum ErrorLevel {
    /**
     * Error level warning
     */
    WARN = 'WARN',

    /**
     * Error level fatal, the video app will be terminated after this error
     */
    FATAL = 'FATAL',
  }

  /**
   * MediaStream response
   */
  type IPCInfoT2 = {
    streamId: string;
  };

  const invokeCallbackForReceivedFrame = async (
    callback: VideoFrameCallbackV2,
    frame: globalThis.VideoFrame,
  ): Promise<globalThis.VideoFrame> => {
    const processedFrame = await callback({ frame });
    if (frame.format === processedFrame.format) {
      return processedFrame;
    } else {
      throw new Error(`Format doesn't match, expected: ${frame.format}, actual: ${processedFrame.format}`);
    }
  };

  export const registerForVideoFrameV2: (frameCallback: VideoFrameCallbackV2, config: VideoFrameConfig) => void =
    registerForVideoFrameFuncGenerator<VideoFrameCallbackV2>(
      (callback) => (frame: globalThis.VideoFrame) => invokeCallbackForReceivedFrame(callback, frame),
      (callback, config) => async (videoFrame: VideoFrame, timestamp?: number) => {
        const frame = videoFrameToFrame(config.format, videoFrame, timestamp || Date.now());
        const processedFrame = await invokeCallbackForReceivedFrame(callback, frame);
        await writeToVideoFrame(processedFrame, videoFrame);
        frame.close();
        processedFrame.close();
        notifyVideoFrameProcessed(timestamp);
      },
    );

  /**
   * Register to read the video frames in Permissions section
   * @beta
   * @param frameCallback - The callback to invoke when registerForVideoFrame has completed
   * @param config - VideoFrameConfig to customize generated video frame parameters
   */
  export const registerForVideoFrame: (frameCallback: VideoFrameCallback, config: VideoFrameConfig) => void =
    registerForVideoFrameFuncGenerator<VideoFrameCallback>(
      (callback) => async (frame: globalThis.VideoFrame) => {
        const timestamp = frame.timestamp;
        const newFrame = {
          height: frame.codedHeight,
          width: frame.codedWidth,
          data: new Uint8ClampedArray(new ArrayBuffer(frame.allocationSize())),
        };
        await writeToVideoFrame(frame, newFrame);
        callback(
          newFrame,
          () => {
            // do nothing, there is no need to notifyVideoFrameProcessed
          },
          notifyError,
        );
        frame.close();
        return videoFrameToFrame(frame.format, newFrame, timestamp || Date.now());
      },
      (callback, config) => async (videoFrame: VideoFrame, timestamp?: number) => {
        callback(
          videoFrame,
          () => {
            notifyVideoFrameProcessed(timestamp);
          },
          notifyError,
        );
      },
    );

  function registerForVideoFrameFuncGenerator<T extends VideoFrameCallback | VideoFrameCallbackV2>(
    invokeCallbackForVideoStream: (callback: T) => (frame: globalThis.VideoFrame) => Promise<globalThis.VideoFrame>,
    invokeCallbackForVideoFrame: (
      callback: T,
      config: VideoFrameConfig,
    ) => (frame: VideoFrame, timestamp?: number) => Promise<void>,
  ): (callback: T, config: VideoFrameConfig) => void {
    const processedStream = new MediaStream();

    return (frameCallback: T, config: VideoFrameConfig) => {
      ensureInitialized(FrameContexts.sidePanel);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

      if (textureStreamAvailable()) {
        try {
          const callbackForVideoStream = invokeCallbackForVideoStream(frameCallback);
          registerHandler('video.startVideoExtensibilityVideoStream', async (ipcInfo: IPCInfoT2) => {
            // when a new streamId is ready:
            const { streamId } = ipcInfo;
            console.log('video.startVideoExtensibilityVideoStream', streamId);
            // todo: error handling
            const videoTrack = await getInputVideoTrack(streamId);
            console.log('videoTrack', videoTrack);
            const generator = createProcessedStreamGenerator(videoTrack, callbackForVideoStream);
            // processedStream.getTracks().forEach((track) => {
            //   track.stop();
            //   processedStream.removeTrack(track);
            // });
            // processedStream.addTrack(generator);
            // TODO: remove when code ready:
            //drawCanvas('processed', processedStream);
            //chrome.webview.postTextureStream(generator);
            window['chrome']?.webview?.registerTextureStream(streamId, generator);
            //drawCanvas('textureStream', await window['chrome']?.webview?.getTextureStream('streamId'));
          });
        } catch (e) {
          console.error(`debug: Error in registerForVideoFrameFuncGenerator: ${e}`);
        }
      } else {
        const callbackForVideoFrame = invokeCallbackForVideoFrame(frameCallback, config);
        registerHandler(
          'video.newVideoFrame',
          async (videoFrame: VideoFrame) => {
            if (videoFrame) {
              const timestamp = videoFrame.timestamp;
              await callbackForVideoFrame(videoFrame, timestamp);
            }
          },
          false,
        );
      }
      sendMessageToParent('video.registerForVideoFrame', [config]);
    };
  }

  function textureStreamAvailable(): boolean {
    return !!(window['chrome']?.webview?.getTextureStream && window['chrome']?.webview?.registerTextureStream);
  }

  function videoFrameToFrame(
    format: globalThis.VideoPixelFormat | null,
    videoFrame: VideoFrame,
    timestamp: number,
  ): globalThis.VideoFrame {
    const frame = new globalThis.VideoFrame(videoFrame.data.slice().buffer, {
      format,
      timestamp: timestamp,
      codedWidth: videoFrame.width,
      codedHeight: videoFrame.height,
    });
    return frame;
  }

  async function writeToVideoFrame(frame: globalThis.VideoFrame, videoFrame: VideoFrame): Promise<void> {
    const buffer = new ArrayBuffer(frame.allocationSize());
    await frame.copyTo(buffer);
    const newData = new Uint8ClampedArray(buffer);
    for (let i = 0; i < videoFrame.data.length; i++) {
      videoFrame.data[i] = newData[i];
    }
  }

  function drawCanvas(canvasName: string, stream: MediaStream): void {
    const video = document.createElement('video');
    video.title = canvasName;
    video.width = 480;
    video.height = 360;
    document.body.appendChild(video);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    video.srcObject = stream;
    video.play();
  }

  async function getInputVideoTrack(streamId: string): Promise<MediaStreamVideoTrack> {
    // TODO: switch to chrome.webview.getTextureStream(streamId) when it is available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chrome = window['chrome'] as any;
    console.log('getting video stream: ', streamId);
    const mediaStream = await chrome.webview.getTextureStream(streamId); // navigator.mediaDevices.getUserMedia({ video: true });
    // TODO: remove when code ready:
    //drawCanvas('origin', mediaStream);

    return mediaStream.getVideoTracks()[0];
  }

  const calculator = {};
  function calculateFPS(name: string): void {
    if (!calculator[name]) {
      calculator[name] = {
        count: 0,
        lastTime: Date.now(),
      };
    }
    const now = Date.now();
    const { count, lastTime } = calculator[name];
    calculator[name].count = count + 1;
    if (now - lastTime > 10000) {
      //console.log(`${name} fps: ${count / 10}`);
      calculator[name].count = 0;
      calculator[name].lastTime = now;
    }
  }

  let start = 0;
  let frameCount = 0;
  function startProcessingAFrame(): void {
    if (start === 0) {
      start = Date.now();
    }
  }
  function stopProcessingAFrame(): void {
    frameCount++;
    const now = Date.now();
    if (now - start > 10000) {
      console.log('processing fps: ', frameCount / 10);
      start = 0;
      frameCount = 0;
    }
  }
  function createProcessedStreamGenerator(
    videoTrack: MediaStreamVideoTrack,
    invokeCallback: (frame: globalThis.VideoFrame) => Promise<globalThis.VideoFrame>,
  ): MediaStreamTrack {
    const processor = new MediaStreamTrackProcessor({ track: videoTrack as MediaStreamVideoTrack });
    const source = processor.readable;
    const generator = new MediaStreamTrackGenerator({ kind: 'video' });
    const sink = generator.writable;

    source
      .pipeThrough(
        new TransformStream({
          async transform(receivedFrame, controller) {
            startProcessingAFrame();
            calculateFPS('receivedFrame');
            const timestamp = receivedFrame.timestamp;

            if (timestamp !== null) {
              invokeCallback(receivedFrame)
                .then(async (frameProcessedByApp) => {
                  calculateFPS('processedFrame');
                  //console.log('receved processed video frame', videoFrame);
                  const buffer = new ArrayBuffer(frameProcessedByApp.allocationSize());
                  await frameProcessedByApp.copyTo(buffer);
                  const processedFrame = new globalThis.VideoFrame(buffer, {
                    codedHeight: frameProcessedByApp.codedHeight,
                    codedWidth: frameProcessedByApp.codedWidth,
                    format: frameProcessedByApp.format,
                    timestamp: timestamp,
                  });
                  controller.enqueue(processedFrame);
                  receivedFrame.close();
                  frameProcessedByApp.close();

                  stopProcessingAFrame();
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
