import { displayCaptureAPISupportVersion } from '../internal/constants';
import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized, isAPISupportedByPlatform } from '../internal/internalAPIs';
import { FrameContexts, SdkError, ErrorCode } from '../public';

export namespace displayCapture {
  export interface Size {
    width: number;
    height: number;
  }

  export enum DisplayCaptureType {
    screen,
    window,
  }

  export interface DisplayCaptureOptions {
    /**
     * An array of Strings that lists the types of desktop sources to be captured.
     * Available types are `screen` and `window`.
     */
    types: DisplayCaptureType[];
    /**
     * The size that the media source thumbnail should be scaled to.
     * Default is 150 x 150.
     * Set width or height to 0 when you do not need the thumbnails.This will save the processing time required for capturing the content of each window and screen.
     */
    thumbnailSize?: Size;
    /**
     * Set to true to enable fetching window icons. The default value is false. When false the appIcon property of the sources return null. Same if a source has the type screen.
     */
    fetchWindowIcons?: boolean;
  }

  export type DataUrl = string;

  export interface DisplayCapturerSource {
    // Docs: https://electronjs.org/docs/api/structures/desktop-capturer-source

    /**
     * An icon image of the application that owns the window or null if the source has
     * a type screen. The size of the icon is not known in advance and depends on what
     * the application provides.
     */
    appIcon: DataUrl;
    /**
     * A unique identifier that will correspond to the `id` of the matching Display
     * returned by the Screen API. On some platforms, this is equivalent to the `XX`
     * portion of the `id` field above and on others it will differ. It will be an
     * empty string if not available.
     */
    display_id: string;
    /**
     * The identifier of a window or screen that can be used as a `chromeMediaSourceId`
     * constraint when calling [`navigator.webkitGetUserMedia`]. The format of the
     * identifier will be `window:XX:YY` or `screen:ZZ:0`. XX is the windowID/handle.
     * YY is 1 for the current process, and 0 for all others. ZZ is a sequential number
     * that represents the screen, and it does not equal to the index in the source's
     * name.
     */
    id: string;
    /**
     * A screen source will be named either `Entire Screen` or `Screen <index>`, while
     * the name of a window source will match the window title.
     */
    name: string;
    /**
     * A thumbnail image in dataUrl. **Note:** There is no guarantee that the size of the
     * thumbnail is the same as the `thumbnailSize` specified in the `options` passed
     * to `displayCapturer.getSources`. The actual size depends on the scale of the
     * screen or window.
     */
    thumbnail: DataUrl;
  }

  /**
   * Fetches current user coordinates or allows user to choose location on map
   * @param callback Callback to invoke when current user location is fetched
   */
  export function getSources(
    options: DisplayCaptureOptions,
    callback: (error: SdkError, sources?: DisplayCapturerSource[]) => void,
  ): void {
    if (!callback) {
      throw new Error('[displayCapture.getSources] Callback cannot be null');
    }
    ensureInitialized(FrameContexts.content);

    if (!isAPISupportedByPlatform(displayCaptureAPISupportVersion)) {
      const oldPlatformError: SdkError = { errorCode: ErrorCode.OLD_PLATFORM };
      callback(oldPlatformError, undefined);
      return;
    }
    if (!options) {
      const invalidInput: SdkError = { errorCode: ErrorCode.INVALID_ARGUMENTS };
      callback(invalidInput, undefined);
      return;
    }
    sendMessageToParent('displayCapture.getSources', [options], callback);
  }
}
