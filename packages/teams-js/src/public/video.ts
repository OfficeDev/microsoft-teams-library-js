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
          const newVideoFrame = new globalThis.VideoFrame(videoFrame.data, {
            timestamp,
            format: 'NV12',
            codedWidth: videoFrame.width,
            codedHeight: videoFrame.height,
          });

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

    /**
     * Notify error when processing the video frame
     */
    notifyProcessingError: (errorLevel: ErrorLevel, errorMessage?: string) => void;
  }

  type IPCInfoT2 = {
    streamId: string;
  };

  function convertVideoFrame(frame: globalThis.VideoFrame): VideoFrame {
    const buffer = new ArrayBuffer(frame.allocationSize());
    frame.copyTo(buffer);
    return {
      width: frame.codedWidth,
      height: frame.codedHeight,
      data: new Uint8ClampedArray(buffer),
      timestamp: frame.timestamp,
    };
  }

  export const registerForVideoFrameV2: (frameCallback: VideoFrameCallbackV2) => void = (() => {
    const processedStream = new MediaStream();

    return (frameCallback: VideoFrameCallbackV2) =>
      registerHandler('video.startVideoExtensibilityVideoStream', async (ipcInfo: IPCInfoT2) => {
        // when a new streamId is ready:
        const { streamId } = ipcInfo;
        console.log('video.startVideoExtensibilityVideoStream', streamId);
        // todo: error handling
        const videoTrack = await getInputVideoTrack(streamId);
        console.log('videoTrack', videoTrack);
        const generator = createProcessedStreamGenerator(videoTrack, frameCallback);

        processedStream.getTracks().forEach((track) => {
          track.stop();
          processedStream.removeTrack(track);
        });
        processedStream.addTrack(generator);
        // TODO: remove when code ready:
        drawCanvas('processed', processedStream);
        //chrome.webview.postTextureStream(generator);
        //chrome.webview.registerTextureStream(streamId, generator);
      });
  })();

  function videoFrameToFrame(videoFrame: VideoFrame, timestamp: number): globalThis.VideoFrame {
    const frame = new globalThis.VideoFrame(videoFrame.data.buffer, {
      format: 'NV12',
      timestamp: timestamp,
      codedWidth: videoFrame.width,
      codedHeight: videoFrame.height,
    });
    return frame;
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
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true }); // chrome.webview.getTextureStream(streamId);
    // TODO: remove when code ready:
    drawCanvas('origin', mediaStream);

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
      console.log(`${name} fps: ${count / 10}`);
      calculator[name].count = 0;
      calculator[name].lastTime = now;
    }
  }

  function createProcessedStreamGenerator(
    videoTrack: MediaStreamVideoTrack,
    frameCallback: VideoFrameCallbackV2,
  ): MediaStreamTrack {
    const processor = new MediaStreamTrackProcessor({ track: videoTrack as MediaStreamVideoTrack });
    const source = processor.readable;
    const generator = new MediaStreamTrackGenerator({ kind: 'video' });
    const sink = generator.writable;

    source
      .pipeThrough(
        new TransformStream({
          async transform(receivedFrame, controller) {
            calculateFPS('receivedFrame');
            const timestamp = receivedFrame.timestamp;

            if (timestamp !== null) {
              //console.log('got frame', frame.timestamp, frame.codedHeight, frame.codedWidth, frame.allocationSize());
              frameCallback({
                frame: receivedFrame,
              })
                .then((frameProcessedByApp) => {
                  calculateFPS('processedFrame');
                  receivedFrame.close();
                  //console.log('receved processed video frame', videoFrame);
                  const buffer = new ArrayBuffer(frameProcessedByApp.allocationSize());
                  frameProcessedByApp.copyTo(buffer);
                  const processedFrame = new globalThis.VideoFrame(buffer, {
                    codedHeight: frameProcessedByApp.codedHeight,
                    codedWidth: frameProcessedByApp.codedWidth,
                    // TODO: how to check format and convert when needed?
                    format: frameProcessedByApp.format,
                    timestamp: timestamp,
                  });
                  controller.enqueue(processedFrame);
                  frameProcessedByApp.close();

                  // TODO: timestamp is wrong, video.VideoFrame.timestamp is not the same as globalThis.VideoFrame.timestamp
                  notifyVideoFrameProcessed(timestamp);
                })
                .catch((error) => {
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
   * get video stream in Permissions section
   * @beta
   */
  export function getVideoStream(config: VideoFrameConfig): Promise<MediaStreamResponse> {
    ensureInitialized(FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    window.addEventListener('metadataprocessed', (metadata) => {
      // timestamp => {[key: string]: ArrayBuffer}
      console.log(metadata);
    });

    sendMessageToParent('video.getVideoStream', [config]);

    // When getTextureStream is available, we will use it to get the video stream
    // otherwise, wrap video frames to a MediaStream
    return new Promise((resolve) => {
      registerHandler(
        // new event here
        'video.startVideoExtensibilityVideoStream',
        async (ipcInfo: IPCInfoT2) => {
          if (ipcInfo) {
            const { streamId } = ipcInfo;
            console.log('video.startVideoExtensibilityVideoStream', streamId);
            // todo: error handling
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const chrome = window['chrome'] as any;
            console.log('getting video stream: ', streamId);
            const mediaStream = await chrome.webview.getTextureStream(streamId); // navigator.mediaDevices.getUserMedia({ video: true });
            console.log('got video stream: ', mediaStream);
            const mediaStreamResponse: MediaStreamResponse = {
              mediaStream,
              registerOutputStreamTrack: (outputStreamTrack: MediaStreamVideoTrack) => {
                console.log('registering output stream track: ', outputStreamTrack);
                let frames = 0;
                let startTime = 0;

                // TODO: calculate fps
                //window.chrome.webview.registerTextureStream(streamId, outputStreamTrack);
                const processor = new MediaStreamTrackProcessor({ track: outputStreamTrack });
                const generator = new MediaStreamTrackGenerator({ kind: 'video' });
                const source = processor.readable;
                const sink = generator.writable;
                source
                  .pipeThrough(
                    new TransformStream({
                      async transform(frame, controller) {
                        frames++;
                        if (frame.timestamp - startTime > 1000 * 10000) {
                          console.log(`Received fPS: ${frames}, tab active: ${document.hasFocus()}`);
                          frames = 0;
                          startTime = frame.timestamp;
                        }
                        controller.enqueue(frame);
                      },
                    }),
                  )
                  .pipeTo(sink);
              },
              getVideoFrameMetaData: (timestamp: number) => {
                // TODO: add getVideoFrameMetaData: how does the metadata get to the host?
                //return getVideoFrameMetaData(timestamp);
                console.log('getVideoFrameMetaData', timestamp);
                return null;
              },
              notifyProcessingError: (errorLevel: ErrorLevel, errorMessage?: string) => {
                console.log(errorMessage);
                notifyError(errorLevel);
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
