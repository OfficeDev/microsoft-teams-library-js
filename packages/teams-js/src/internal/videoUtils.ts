import { videoEx } from '../private/videoEx';
import { errorNotSupportedOnPlatform } from '../public/constants';
import { video } from '../public/video';
import { sendMessageToParent } from './communication';
import { registerHandler } from './handlers';
import { inServerSideRenderingEnvironment, ssrSafeWindow } from './utils';
import {
  AllowSharedBufferSource,
  PlaneLayout,
  VideoFrameBufferInit,
  VideoFrameCopyToOptions,
  VideoFrameInit,
  VideoPixelFormat,
} from './VideoFrameTypes';
import { VideoPerformanceMonitor } from './videoPerformanceMonitor';

/**
 * @hidden
 * Align with the W3C spec: https://www.w3.org/TR/webcodecs/
 */
interface VideoFrame {
  /**
   * The width of the VideoFrame in pixels, potentially including non-visible padding, and prior to
   * considering potential ratio adjustments.
   */
  readonly codedWidth: number;
  /**
   * The height of the VideoFrame in pixels, potentially including non-visible padding, and prior to
   * considering potential ratio adjustments.
   */
  readonly codedHeight: number;
  /**
   * The pixel format of the VideoFrame.
   */
  readonly format: VideoPixelFormat | null;
  /**
   * An integer indicating the timestamp of the video in microseconds.
   */
  readonly timestamp: number;
  /**
   * Clears all states and releases the reference to the media resource
   */
  close(): void;
  /**
   * Copies the contents of the VideoFrame to an ArrayBuffer
   * @param destination An ArrayBuffer, a TypedArray, or a DataView to copy to.
   * @param options An object containing rect - the rectangle of pixels to copy from the VideoFrame.
   */
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
  videoPerformanceMonitor?: VideoPerformanceMonitor,
): Promise<void> {
  const generator = createProcessedStreamGeneratorWithoutSource();
  !inServerSideRenderingEnvironment() && window['chrome']?.webview?.registerTextureStream(streamId, generator);
  pipeVideoSourceToGenerator(
    await getInputVideoTrack(streamId, notifyError, videoPerformanceMonitor),
    new DefaultTransformer(notifyError, videoFrameHandler),
    generator.writable,
  );
}

/**
 * @hidden
 * Create a MediaStreamTrack from the media stream with the given streamId and processed by videoFrameHandler.
 * The videoFrameHandler will receive metadata of the video frame.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export async function processMediaStreamWithMetadata(
  streamId: string,
  videoFrameHandler: videoEx.VideoFrameHandler,
  notifyError: (string) => void,
  videoPerformanceMonitor?: VideoPerformanceMonitor,
): Promise<void> {
  const generator = createProcessedStreamGeneratorWithoutSource();
  !inServerSideRenderingEnvironment() && window['chrome']?.webview?.registerTextureStream(streamId, generator);
  pipeVideoSourceToGenerator(
    await getInputVideoTrack(streamId, notifyError, videoPerformanceMonitor),
    new TransformerWithMetadata(notifyError, videoFrameHandler),
    generator.writable,
  );
}

/**
 * Get the video track from the media stream gotten from chrome.webview.getTextureStream(streamId).
 */
async function getInputVideoTrack(
  streamId: string,
  notifyError: (string) => void,
  videoPerformanceMonitor?: VideoPerformanceMonitor,
): Promise<MediaStreamTrack> {
  if (inServerSideRenderingEnvironment()) {
    throw errorNotSupportedOnPlatform;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chrome = ssrSafeWindow()['chrome'] as any;
  try {
    videoPerformanceMonitor?.reportGettingTextureStream(streamId);
    const mediaStream = await chrome.webview.getTextureStream(streamId);
    const tracks = mediaStream.getVideoTracks();
    if (tracks.length === 0) {
      throw new Error(`No video track in stream ${streamId}`);
    }
    videoPerformanceMonitor?.reportTextureStreamAcquired();
    return tracks[0];
  } catch (error) {
    const errorMsg = `Failed to get video track from stream ${streamId}, error: ${error}`;
    notifyError(errorMsg);
    throw new Error(`Internal error: can't get video track from stream ${streamId}`);
  }
}

/**
 * The function to create a MediaStreamTrack generator.
 * The generator can then get the processed frames as media stream source.
 * The generator can be registered back to the media stream so that the host can get the processed frames.
 */
function createProcessedStreamGeneratorWithoutSource(): MediaStreamTrack & { writable: WritableStream } {
  if (inServerSideRenderingEnvironment()) {
    throw errorNotSupportedOnPlatform;
  }
  const MediaStreamTrackGenerator = window['MediaStreamTrackGenerator'];
  if (!MediaStreamTrackGenerator) {
    throw errorNotSupportedOnPlatform;
  }
  return new MediaStreamTrackGenerator({ kind: 'video' });
}

/**
 * The function to create a processed video track from the original video track.
 * It reads frames from the video track and pipes them to the video frame callback to process the frames.
 * The processed frames are then enqueued to the generator.
 */
function pipeVideoSourceToGenerator(
  videoTrack: unknown,
  transformer: TransformerWithMetadata | DefaultTransformer,
  sink: WritableStream,
): void {
  const MediaStreamTrackProcessor = ssrSafeWindow()['MediaStreamTrackProcessor'];
  const processor = new MediaStreamTrackProcessor({ track: videoTrack });
  const source = processor.readable;

  source.pipeThrough(new TransformStream(transformer)).pipeTo(sink);
}

/**
 * @hidden
 * Error messages during video frame transformation.
 */
enum VideoFrameTransformErrors {
  TimestampIsNull = 'timestamp of the original video frame is null',
  UnsupportedVideoFramePixelFormat = 'Unsupported video frame pixel format',
}

class DefaultTransformer {
  public constructor(private notifyError: (string) => void, private videoFrameHandler: video.VideoFrameHandler) {}

  public transform = async (originalFrame, controller): Promise<void> => {
    const timestamp = originalFrame.timestamp;
    if (timestamp !== null) {
      try {
        const frameProcessedByApp = await this.videoFrameHandler({ videoFrame: originalFrame });
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
        this.notifyError(error);
      }
    } else {
      this.notifyError(VideoFrameTransformErrors.TimestampIsNull);
    }
  };
}

/**
 * @hidden
 * Utility class to parse the header of a one-texture-input texture.
 */
class OneTextureHeader {
  private readonly headerDataView: Uint32Array;
  // Identifier for the texture layout, which is the 4-byte ASCII string "oti1" hardcoded by the host
  // (oti1 stands for "one texture input version 1")
  private readonly ONE_TEXTURE_INPUT_ID = 0x6f746931;
  private readonly INVALID_HEADER_ERROR = 'Invalid video frame header';
  private readonly UNSUPPORTED_LAYOUT_ERROR = 'Unsupported texture layout';
  public constructor(private readonly headerBuffer: ArrayBuffer, private readonly notifyError: (string) => void) {
    this.headerDataView = new Uint32Array(headerBuffer);
    // headerDataView will contain the following data:
    // 0: oneTextureLayoutId
    // 1: version
    // 2: frameRowOffset
    // 3: frameFormat
    // 4: frameWidth
    // 5: frameHeight
    // 6: multiStreamHeaderRowOffset
    // 7: multiStreamCount
    if (this.headerDataView.length < 8) {
      this.notifyError(this.INVALID_HEADER_ERROR);
      throw new Error(this.INVALID_HEADER_ERROR);
    }
    // ensure the texture layout is supported
    if (this.headerDataView[0] !== this.ONE_TEXTURE_INPUT_ID) {
      this.notifyError(this.UNSUPPORTED_LAYOUT_ERROR);
      throw new Error(this.UNSUPPORTED_LAYOUT_ERROR);
    }
  }

  public get oneTextureLayoutId(): number {
    return this.headerDataView[0];
  }

  public get version(): number {
    return this.headerDataView[1];
  }

  public get frameRowOffset(): number {
    return this.headerDataView[2];
  }

  public get frameFormat(): number {
    return this.headerDataView[3];
  }

  public get frameWidth(): number {
    return this.headerDataView[4];
  }

  public get frameHeight(): number {
    return this.headerDataView[5];
  }

  public get multiStreamHeaderRowOffset(): number {
    return this.headerDataView[6];
  }

  public get multiStreamCount(): number {
    return this.headerDataView[7];
  }
}

/**
 * @hidden
 * Utility class to parse the metadata of a one-texture-input texture.
 */
class OneTextureMetadata {
  private readonly metadataMap: Map<number, Uint8Array> = new Map();
  // Stream id for audio inference metadata, which is the 4-byte ASCII string "1dia" hardcoded by the host
  // (1dia stands for "audio inference data version 1")
  private readonly AUDIO_INFERENCE_RESULT_STREAM_ID = 0x31646961;
  public constructor(metadataBuffer: ArrayBuffer, streamCount: number) {
    const metadataDataView = new Uint32Array(metadataBuffer);
    for (let i = 0, index = 0; i < streamCount; i++) {
      const streamId = metadataDataView[index++];
      const streamDataOffset = metadataDataView[index++];
      const streamDataSize = metadataDataView[index++];
      const streamData = new Uint8Array(metadataBuffer, streamDataOffset, streamDataSize);
      this.metadataMap.set(streamId, streamData);
    }
  }

  public get audioInferenceResult(): Uint8Array | undefined {
    return this.metadataMap.get(this.AUDIO_INFERENCE_RESULT_STREAM_ID);
  }
}

class TransformerWithMetadata {
  private shouldDiscardAudioInferenceResult = false;

  public constructor(private notifyError: (string) => void, private videoFrameHandler: videoEx.VideoFrameHandler) {
    registerHandler(
      'video.mediaStream.audioInferenceDiscardStatusChange',
      ({ discardAudioInferenceResult }: { discardAudioInferenceResult: boolean }) => {
        this.shouldDiscardAudioInferenceResult = discardAudioInferenceResult;
      },
    );
  }

  public transform = async (originalFrame, controller): Promise<void> => {
    const timestamp = originalFrame.timestamp;
    if (timestamp !== null) {
      try {
        const { videoFrame, metadata: { audioInferenceResult } = {} } = await this.extractVideoFrameAndMetadata(
          originalFrame,
        );
        const frameProcessedByApp = await this.videoFrameHandler({ videoFrame, audioInferenceResult });
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
        this.notifyError(error);
      }
    } else {
      this.notifyError(VideoFrameTransformErrors.TimestampIsNull);
    }
  };

  /**
   * @hidden
   * Extract video frame and metadata from the given texture.
   * The given texure should be in NV12 format and the layout of the texture should be:
   * | Texture layout        |
   * | :---                  |
   * | Header                |
   * | Real video frame data |
   * | Metadata              |
   *
   * The header data is in the first two rows with the following format:
   * | oneTextureLayoutId | version | frameRowOffset | frameFormat | frameWidth | frameHeight | multiStreamHeaderRowOffset | multiStreamCount | ...   |
   * |    :---:           | :---:   | :---:          |  :---:      |  :---:     |  :---:      |  :---:                     |  :---:           | :---: |
   * | 4 bytes            | 4 bytes | 4 bytes        | 4 bytes     | 4 bytes    | 4 bytes     | 4 bytes                    | 4 bytes          | ...   |
   *
   * After header, it comes with the real video frame data.
   * At the end of the texture, it comes with the metadata. The metadata section can contain multiple types of metadata.
   * Each type of metadata is called a stream. The section is in the following format:
   * | stream1.id | stream1.dataOffset | stream1.dataSize | stream2.id | stream2.dataOffset | stream2.dataSize | ... | stream1.data | stream2.data | ... |
   * | :---:      | :---:              | :---:            |  :---:     |  :---:             |  :---:           |:---:|  :---:       | :---:        |:---:|
   * | 4 bytes    | 4 bytes            | 4 bytes          | 4 bytes    | 4 bytes            | 4 bytes          | ... | ...          | ...          | ... |
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  private extractVideoFrameAndMetadata = async (
    texture: VideoFrame,
  ): Promise<{ videoFrame: VideoFrame; metadata: { audioInferenceResult?: Uint8Array } }> => {
    if (inServerSideRenderingEnvironment()) {
      throw errorNotSupportedOnPlatform;
    }
    if (texture.format !== 'NV12') {
      this.notifyError(VideoFrameTransformErrors.UnsupportedVideoFramePixelFormat);
      throw new Error(VideoFrameTransformErrors.UnsupportedVideoFramePixelFormat);
    }

    // The rectangle of pixels to copy from the texture. The first two rows are the header.
    const headerRect = { x: 0, y: 0, width: texture.codedWidth, height: 2 };
    // allocate buffer for the header
    // The texture is in NV12 format (https://learn.microsoft.com/en-us/windows/win32/medfound/recommended-8-bit-yuv-formats-for-video-rendering#nv12).
    // NV12 has one luma "luminance" plane Y and one UV plane with U and V values interleaved.
    // In NV12, chroma planes (blue and red) are subsampled in both the horizontal and vertical dimensions by a factor of 2.
    // So for a 2×2 group of pixels, you have 4 Y samples and 1 U and 1 V sample, each sample being 1 byte.
    // for a 10×10 NV12 frame: there are 100 Y samples followed by 25 U and 25 V samples interleaved.
    // The graphical representation of the memory layout of a 2×2 NV12 frame is as follows:
    // | Y0 | Y1 | Y2 | Y3 | U0 | V0 |
    // The number of pixels of the header is (headerRect.width * headerRect.height), so the number of bytes of the header is
    // (the size of the Y plane + the size of the UV plane)
    // which is (headerRect.width * headerRect.height) + (headerRect.width * headerRect.height) / 2
    //            = (headerRect.width * headerRect.height * 3) / 2
    const headerBuffer = new ArrayBuffer((headerRect.width * headerRect.height * 3) / 2);
    await texture.copyTo(headerBuffer, { rect: headerRect });
    const header = new OneTextureHeader(headerBuffer, this.notifyError);

    // The rectangle of pixels to copy from the texture. Metadata are at the bottom.
    const metadataRect = {
      x: 0,
      y: header.multiStreamHeaderRowOffset,
      width: texture.codedWidth,
      height: texture.codedHeight - header.multiStreamHeaderRowOffset,
    };
    // Allocate buffer for the metadata. The number of pixels of the metadata section is
    // (metadataRect.width * metadataRect.height), so the number of bytes of the metadata section is
    // (the size of the Y plane + the size of the UV plane), which is
    // (metadataRect.width * metadataRect.height) + (metadataRect.width * metadataRect.height) / 2
    //   = (metadataRect.width * metadataRect.height * 3) / 2
    const metadataBuffer = new ArrayBuffer((metadataRect.width * metadataRect.height * 3) / 2);
    await texture.copyTo(metadataBuffer, { rect: metadataRect });
    const metadata = new OneTextureMetadata(metadataBuffer, header.multiStreamCount);
    return {
      videoFrame: new VideoFrame(texture as unknown as CanvasImageSource, {
        timestamp: texture.timestamp,
        visibleRect: {
          x: 0,
          y: header.frameRowOffset,
          width: header.frameWidth,
          height: header.frameHeight,
        },
      }) as VideoFrame,
      metadata: {
        audioInferenceResult: this.shouldDiscardAudioInferenceResult ? undefined : metadata.audioInferenceResult,
      },
    };
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
export function createEffectParameterChangeCallback(
  callback: VideoEffectCallBack,
  videoPerformanceMonitor?: VideoPerformanceMonitor,
) {
  return (effectId: string | undefined, effectParam?: string): void => {
    videoPerformanceMonitor?.reportApplyingVideoEffect(effectId || '', effectParam);

    callback(effectId, effectParam)
      .then(() => {
        videoPerformanceMonitor?.reportVideoEffectChanged(effectId || '', effectParam);
        sendMessageToParent('video.videoEffectReadiness', [true, effectId, undefined, effectParam]);
      })
      .catch((reason) => {
        const validReason =
          reason in video.EffectFailureReason ? reason : video.EffectFailureReason.InitializationFailure;
        sendMessageToParent('video.videoEffectReadiness', [false, effectId, validReason, effectParam]);
      });
  };
}

export { VideoEffectCallBack as DefaultVideoEffectCallBack };
