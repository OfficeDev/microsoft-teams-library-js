import { inServerSideRenderingEnvironment } from '../private/inServerSideRenderingEnvironment';
import { videoEx } from '../private/videoEx';
import { errorNotSupportedOnPlatform } from '../public/constants';
import { video } from '../public/video';
import { sendMessageToParent } from './communication';
import { AllowSharedBufferSource, VideoFrameBufferInit, VideoFrameInit } from './VideoFrameTypes';

interface VideoFrame {
  close(): void;
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

  source
    .pipeThrough(
      new TransformStream({
        async transform(originalFrame, controller) {
          const timestamp = originalFrame.timestamp;
          if (timestamp !== null) {
            try {
              const { videoFrame, metadata: { audioInferenceResult } = {} } = extractVideoFrameAndMetadata(
                originalFrame,
                notifyError,
              );
              const frameProcessedByApp = await videoFrameHandler({ videoFrame, audioInferenceResult });
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
 * @hidden
 * Extract video frame and metadata from the given texture.
 */
function extractVideoFrameAndMetadata(
  texture: VideoFrame,
  notifyError: (string) => void,
): { videoFrame: VideoFrame; metadata: { audioInferenceResult?: Uint8Array } } {
  if (inServerSideRenderingEnvironment()) {
    throw errorNotSupportedOnPlatform;
  }
  if (texture === null) {
    notifyError('timestamp of the original video frame is null');
  }
  return { videoFrame: texture, metadata: {} };
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
