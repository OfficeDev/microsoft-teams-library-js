/**
 * @beta
 * Align with the W3C spec: https://www.w3.org/TR/webcodecs/
 */
export type VideoPixelFormat = 'BGRA' | 'BGRX' | 'I420' | 'I420A' | 'I422' | 'I444' | 'NV12' | 'RGBA' | 'RGBX';

/**
 * @beta
 * Align with the W3C spec: https://www.w3.org/TR/webcodecs/
 */
export type AllowSharedBufferSource = ArrayBuffer | ArrayBufferView;

/**
 * @beta
 * Align with the W3C spec: https://www.w3.org/TR/webcodecs/
 */

export type AlphaOption = 'discard' | 'keep';

/**
 * @beta
 * Align with the W3C spec: https://www.w3.org/TR/webcodecs/
 */
export interface PlaneLayout {
  offset: number;
  stride: number;
}

/**
 * @beta
 * Align with the W3C spec: https://www.w3.org/TR/webcodecs/
 */
export interface VideoFrameCopyToOptions {
  layout?: PlaneLayout[] | undefined;
  rect?: DOMRectInit | undefined;
}

/**
 * @beta
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
