import { inServerSideRenderingEnvironment } from '../private/inServerSideRenderingEnvironment';
import { videoEx } from '../private/videoEx';
import { errorNotSupportedOnPlatform } from '../public/constants';
import { video } from '../public/video';
import { sendMessageToParent } from './communication';
import { registerHandler } from './handlers';
import {
  AllowSharedBufferSource,
  PlaneLayout,
  VideoFrameBufferInit,
  VideoFrameCopyToOptions,
  VideoFrameInit,
  VideoPixelFormat,
} from './VideoFrameTypes';

interface VideoFrame {
  readonly codedWidth: number;
  readonly codedHeight: number;
  readonly format: VideoPixelFormat | null;
  readonly timestamp: number;
  close(): void;
  copyTo(destination: AllowSharedBufferSource, options?: VideoFrameCopyToOptions): Promise<PlaneLayout[]>;
}

/**
 * @hidden
 */
// eslint-disable-next-line strict-null-checks/all
declare const VideoFrame: {
  prototype: video.VideoFrame;
  new (source: CanvasImageSource, init?: VideoFrameInit): video.VideoFrame;
  new (data: AllowSharedBufferSource, init: VideoFrameBufferInit): video.VideoFrame;
};

/**
 * @hidden
 * Create a MediaStreamTrack from the media stream with the given streamId and processed by videoFrameHandler.
 */
export async function processMediaStream(
  streamId: string,
  videoFrameHandler: video.VideoFrameHandler,
  notifyError: (string) => void,
): Promise<MediaStreamTrack> {
  return createProcessedStreamGenerator(
    await getInputVideoTrack(streamId, notifyError),
    videoFrameHandler,
    notifyError,
  );
}

/**
 * @hidden
 * Create a MediaStreamTrack from the media stream with the given streamId and processed by videoFrameHandler.
 */
export async function processMediaStreamWithMetadata(
  streamId: string,
  videoFrameHandler: videoEx.VideoFrameHandler,
  notifyError: (string) => void,
): Promise<MediaStreamTrack> {
  return createProcessedStreamGeneratorWithMetadata(
    await getInputVideoTrack(streamId, notifyError),
    videoFrameHandler,
    notifyError,
  );
}

/**
 * Get the video track from the media stream gotten from chrome.webview.getTextureStream(streamId).
 */
async function getInputVideoTrack(streamId: string, notifyError: (string) => void): Promise<MediaStreamTrack> {
  if (inServerSideRenderingEnvironment()) {
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
    throw new Error(`Internal error: can't get video track from stream ${streamId}`);
  }
}

/**
 * The function to create a processed video track from the original video track.
 * It reads frames from the video track and pipes them to the video frame callback to process the frames.
 * The processed frames are then enqueued to the generator.
 * The generator can be registered back to the media stream so that the host can get the processed frames.
 */
function createProcessedStreamGenerator(
  videoTrack: unknown,
  videoFrameHandler: video.VideoFrameHandler,
  notifyError: (string) => void,
): MediaStreamTrack {
  if (inServerSideRenderingEnvironment()) {
    throw errorNotSupportedOnPlatform;
  }
  const MediaStreamTrackProcessor = window['MediaStreamTrackProcessor'];
  const processor = new MediaStreamTrackProcessor({ track: videoTrack });
  const source = processor.readable;
  const MediaStreamTrackGenerator = window['MediaStreamTrackGenerator'];
  const generator = new MediaStreamTrackGenerator({ kind: 'video' });
  const sink = generator.writable;

  source
    .pipeThrough(
      new TransformStream({
        async transform(originalFrame, controller) {
          const timestamp = originalFrame.timestamp;
          if (timestamp !== null) {
            try {
              const frameProcessedByApp = await videoFrameHandler({ videoFrame: originalFrame });
              // the current typescript version(4.6.4) dosn't support webcodecs API fully, we have to do type conversion here.
              const processedFrame = new VideoFrame(frameProcessedByApp as unknown as CanvasImageSource, {
                // we need the timestamp to be unchanged from the oirginal frame, so we explicitly set it here.
                timestamp: timestamp,
              });
              controller.enqueue(processedFrame);
              originalFrame.close();
              (frameProcessedByApp as VideoFrame).close();
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

/**
 * The function to create a processed video track from the original video track.
 * It reads frames from the video track and pipes them to the video frame callback to process the frames.
 * The processed frames are then enqueued to the generator.
 * The generator can be registered back to the media stream so that the host can get the processed frames.
 */
function createProcessedStreamGeneratorWithMetadata(
  videoTrack: unknown,
  videoFrameHandler: videoEx.VideoFrameHandler,
  notifyError: (string) => void,
): MediaStreamTrack {
  if (inServerSideRenderingEnvironment()) {
    throw errorNotSupportedOnPlatform;
  }
  const MediaStreamTrackProcessor = window['MediaStreamTrackProcessor'];
  const processor = new MediaStreamTrackProcessor({ track: videoTrack });
  const source = processor.readable;
  const MediaStreamTrackGenerator = window['MediaStreamTrackGenerator'];
  const generator = new MediaStreamTrackGenerator({ kind: 'video' });
  const sink = generator.writable;

  let shouldDiscardAudioInferenceResult = false;

  registerHandler(
    'video.mediaStream.audioInferenceDiscardStatusChange',
    ({ discardAudioInferenceResult }: { discardAudioInferenceResult: boolean }) => {
      console.log('discardAudioInferenceResult', discardAudioInferenceResult);
      shouldDiscardAudioInferenceResult = discardAudioInferenceResult;
    },
  );

  source
    .pipeThrough(
      new TransformStream({
        async transform(originalFrame, controller) {
          const timestamp = originalFrame.timestamp;
          if (timestamp !== null) {
            try {
              const { videoFrame, metadata: { audioInferenceResult } = {} } = await extractVideoFrameAndMetadata(
                originalFrame,
                shouldDiscardAudioInferenceResult,
                notifyError,
              );
              const frameProcessedByApp = await videoFrameHandler({ videoFrame, audioInferenceResult });
              // the current typescript version(4.6.4) dosn't support webcodecs API fully, we have to do type conversion here.
              const processedFrame = new VideoFrame(frameProcessedByApp as unknown as CanvasImageSource, {
                // we need the timestamp to be unchanged from the oirginal frame, so we explicitly set it here.
                timestamp: timestamp,
              });
              controller.enqueue(processedFrame);
              videoFrame.close();
              originalFrame.close();
              (frameProcessedByApp as VideoFrame).close();
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

/**
 * @hidden
 * Extract video frame and metadata from the given texture.
 */
async function extractVideoFrameAndMetadata(
  texture: VideoFrame,
  shouldDiscardAudioInferenceResult: boolean,
  notifyError: (string) => void,
): Promise<{ videoFrame: VideoFrame; metadata: { audioInferenceResult?: Uint8Array } }> {
  if (inServerSideRenderingEnvironment()) {
    throw errorNotSupportedOnPlatform;
  }

  if (texture.format !== 'NV12') {
    notifyError('Unsupported video frame format');
    throw new Error('Unsupported video frame format');
  }

  const awesomeDebuggingEnabled = localStorage.getItem('awesomeDebuggingEnabled');

  // The rectangle of pixels to copy from the texture
  const headerRect = { x: 0, y: 0, width: texture.codedWidth, height: 2 };
  const headerBuffer = new ArrayBuffer((headerRect.width * headerRect.height * 3) / 2);
  await texture.copyTo(headerBuffer, { rect: headerRect });
  const headerDataView = new Uint32Array(headerBuffer);
  // const [ oneTextureId, version, frameRowOffset, frameFormat, frameWidth, frameHeight, multiStreamHeaderRowOffset, multiStreamCount ] = headerDataView;
  if (awesomeDebuggingEnabled) {
    console.log(
      'OneTextureId:',
      headerDataView[0],
      'Version:',
      headerDataView[1],
      'FrameRowOffset:',
      headerDataView[2],
      'FrameFormat:',
      headerDataView[3],
      'FrameWidth:',
      headerDataView[4],
      'FrameHeight:',
      headerDataView[5],
      'MultiStreamHeaderRowOffset:',
      headerDataView[6],
      'MultiStreamCount:',
      headerDataView[7],
      // 'Timestamp:',
      // headerDataView[8],
    );
  }

  const metadataRect = {
    x: 0,
    y: headerDataView[6],
    width: texture.codedWidth,
    height: texture.codedHeight - headerDataView[6],
  };
  const metadataBuffer = new ArrayBuffer((metadataRect.width * metadataRect.height * 3) / 2);
  await texture.copyTo(metadataBuffer, { rect: metadataRect });
  const metadata = new Uint32Array(metadataBuffer);
  for (let i = 0, index = 0; i < headerDataView[7]; i++) {
    const streamId = metadata[index++];
    const streamDataOffset = metadata[index++];
    const streamDataSize = metadata[index++];
    const streamData = new Uint8Array(metadataBuffer, streamDataOffset, streamDataSize);
    if (awesomeDebuggingEnabled) {
      console.log(
        'streamId:',
        streamId,
        'streamDataOffset:',
        streamDataOffset,
        'streamDataSize:',
        streamDataSize,
        'streamData:',
        streamData,
      );
    }
  }

  if (shouldDiscardAudioInferenceResult && awesomeDebuggingEnabled) {
    console.log('audio inference dicarded');
  }

  return {
    videoFrame: new VideoFrame(texture as unknown as CanvasImageSource, {
      timestamp: texture.timestamp,
      visibleRect: { x: 0, y: headerDataView[2], width: headerDataView[4], height: headerDataView[5] },
    }) as VideoFrame,
    metadata: {},
  };
}

/**
 * @hidden
 * Video effect change call back function definition
 * @beta
 *
 * @internal
 * Limited to Microsoft-internal use
 */
type VideoEffectCallBack = (effectId: string | undefined, effectParam?: string) => Promise<void>;

/**
 * @hidden
 */
export function createEffectParameterChangeCallback(callback: VideoEffectCallBack) {
  return (effectId: string | undefined, effectParam?: string): void => {
    callback(effectId, effectParam)
      .then(() => {
        sendMessageToParent('video.videoEffectReadiness', [true, effectId]);
      })
      .catch((reason) => {
        const validReason =
          reason in video.EffectFailureReason ? reason : video.EffectFailureReason.InitializationFailure;
        sendMessageToParent('video.videoEffectReadiness', [false, effectId, validReason]);
      });
  };
}

export { VideoEffectCallBack as DefaultVideoEffectCallBack };
