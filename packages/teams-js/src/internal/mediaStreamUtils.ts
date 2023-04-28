import { inServerSideRenderingEnvironment } from '../private/inServerSideRenderingEnvironment';
import { errorNotSupportedOnPlatform } from '../public/constants';
import { video } from '../public/video';
import { AllowSharedBufferSource, VideoFrameBufferInit, VideoFrameInit } from './VideoFrameTypes';

/**
 * VideoFrame definition, align with the W3C spec: https://www.w3.org/TR/webcodecs/
 */
// eslint-disable-next-line strict-null-checks/all
declare const VideoFrame: {
  prototype: video.VideoFrame;
  new (source: CanvasImageSource, init?: VideoFrameInit): video.VideoFrame;
  new (data: AllowSharedBufferSource, init: VideoFrameBufferInit): video.VideoFrame;
};

/**
 * @hidden
 * Create a MediaStreamTrack from the media stream with the given streamId and processed by mediaStreamCallback.
 */
export async function processMediaStream(
  streamId: string,
  mediaStreamCallback: video.MediaStreamCallback,
  notifyError: (string) => void,
): Promise<MediaStreamTrack> {
  return createProcessedStreamGenerator(
    await getInputVideoTrack(streamId, notifyError),
    mediaStreamCallback,
    notifyError,
  );
}

/**
 * Get the video track from the media stream gotten from chrome.webview.getTextureStream(streamId).
 */
async function getInputVideoTrack(streamId: string, notifyError: (string) => void): Promise<unknown> {
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
  videoTrack: unknown,
  mediaStreamCallback: video.MediaStreamCallback,
  notifyError: (string) => void,
): MediaStreamTrack {
  const MediaStreamTrackProcessor = !inServerSideRenderingEnvironment() && window['MediaStreamTrackProcessor'];
  const processor = new MediaStreamTrackProcessor({ track: videoTrack });
  const source = processor.readable;
  const MediaStreamTrackGenerator = !inServerSideRenderingEnvironment() && window['MediaStreamTrackGenerator'];
  const generator = new MediaStreamTrackGenerator({ kind: 'video' });
  const sink = generator.writable;

  source
    .pipeThrough(
      new TransformStream({
        async transform(originalFrame, controller) {
          const timestamp = originalFrame.timestamp;
          if (timestamp !== null) {
            try {
              const frameProcessedByApp = await mediaStreamCallback({ videoFrame: originalFrame });
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
