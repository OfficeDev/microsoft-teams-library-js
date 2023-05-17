/**
 * @beta
 * @hidden
 * Align with the W3C spec: https://www.w3.org/TR/webcodecs/
 */
export type VideoPixelFormat = 'BGRA' | 'BGRX' | 'I420' | 'I420A' | 'I422' | 'I444' | 'NV12' | 'RGBA' | 'RGBX';

/**
 * @beta
 * @hidden
 * Align with the W3C spec: https://www.w3.org/TR/webcodecs/
 */
export type AllowSharedBufferSource = ArrayBuffer | ArrayBufferView;

/**
 * @beta
 * @hidden
 * Align with the W3C spec: https://www.w3.org/TR/webcodecs/
 */
export type AlphaOption = 'discard' | 'keep';

/**
 * @beta
 * @hidden
 * Align with the W3C spec: https://www.w3.org/TR/webcodecs/
 */
export interface PlaneLayout {
  /**
   * The offset in bytes where the given plane begins within a BufferSource.
   */
  offset: number;
  /**
   * The number of bytes, including padding, used by each row of the plane within a BufferSource.
   */
  stride: number;
}

/**
 * @beta
 * @hidden
 * Align with the W3C spec: https://www.w3.org/TR/webcodecs/
 */
export interface VideoFrameCopyToOptions {
  /**
   * The PlaneLayout for each plane in VideoFrame
   */
  layout?: PlaneLayout[] | undefined;
  /**
   * A DOMRectInit describing the rectangle of pixels to copy from the VideoFrame
   */
  rect?: DOMRectInit | undefined;
}

/**
 * @beta
 * @hidden
 * Align with the W3C spec: https://www.w3.org/TR/webcodecs/
 */
export interface VideoFrameInit {
  alpha?: AlphaOption | undefined;
  displayHeight?: number | undefined;
  displayWidth?: number | undefined;
  duration?: number | undefined;
  timestamp?: number | undefined;
  visibleRect?: DOMRectInit | undefined;
}

/**
 * @beta
 * @hidden
 * Align with the W3C spec: https://www.w3.org/TR/webcodecs/
 */
export interface VideoFrameBufferInit {
  codedHeight: number;
  codedWidth: number;
  colorSpace?: VideoColorSpaceInit | undefined;
  displayHeight?: number | undefined;
  displayWidth?: number | undefined;
  duration?: number | undefined;
  format: VideoPixelFormat;
  layout?: PlaneLayout[] | undefined;
  timestamp: number;
  visibleRect?: DOMRectInit | undefined;
}
