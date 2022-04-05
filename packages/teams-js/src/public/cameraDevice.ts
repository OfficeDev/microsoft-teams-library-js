import { sendAndHandleSdkError, sendMessageToParentAsync } from '../internal/communication';
import { mediaAPISupportVersion } from '../internal/constants';
import { ensureInitialized, isCurrentSDKVersionAtLeast } from '../internal/internalAPIs';
import { validateViewImagesInput } from '../internal/mediaUtil';
import { FrameContexts, ImageOutputFormats, MediaType, Source } from './constants';
import { ErrorCode, ImageProps, ImageUri, SdkError } from './interfaces';
// We should not be importing this class. Should make an interface for this (the function on media isn't needed and has been replaced with mediaChunking.getMediaAsBlob)
import { media } from './media';
import { runtime } from './runtime';

export namespace cameraDevice {
  export interface ImageInputs {
    mediaType: MediaType.Image;
    maxMediaCount: number;
    imageProps?: ImageProps;
  }

  // used to capture one or more images from camera, gallery, or both. Lets app decide whether or not user can switch between front and back camera
  export function captureImages(count: number, sources?: Source[], cameraSwitcher?: boolean): Promise<media.Media[]> {
    const imageProps: ImageProps = {};
    if (sources) {
      imageProps.sources = sources;
    }
    if (cameraSwitcher) {
      imageProps.cameraSwitcher = cameraSwitcher;
    }
    imageProps.ink = false;
    imageProps.textSticker = false;
    const imageInputs: ImageInputs = { mediaType: MediaType.Image, maxMediaCount: count, imageProps };
    return sendMessageToParentAsync<[SdkError, media.Media[]]>('selectMedia', [imageInputs]).then(
      ([err, localAttachments]: [SdkError, media.Media[]]) => {
        if (!localAttachments) {
          throw err;
        }

        return localAttachments;
      },
    );
  }

  /**
   * View images using native image viewer
   *
   * @param uriList - list of URIs for images to be viewed - can be content URI or server URL. Supports up to 10 Images in a single call
   * @returns A promise resolved when the viewing action is completed or rejected with an @see SdkError
   */
  export function viewImages(uriList: ImageUri[]): Promise<void> {
    ensureInitialized(FrameContexts.content, FrameContexts.task);

    return new Promise<void>(resolve => {
      if (!isCurrentSDKVersionAtLeast(mediaAPISupportVersion)) {
        throw { errorCode: ErrorCode.OLD_PLATFORM };
      }
      if (!validateViewImagesInput(uriList)) {
        throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
      }

      resolve(sendAndHandleSdkError('viewImages', uriList));
    });
  }

  export function hasPermission(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      resolve(sendAndHandleSdkError('cameraDevice.hasPermission'));
    });
  }

  // This should not trigger the "refresh the app scenario" because this is for setting things up
  // for use through teamsjs-sdk 2.0. If the user DOES refresh the app after calling this the iframe
  // would have the new allow parameters, but only the AppPermissions dialog should trigger the
  // "ask the user to refresh" flow
  export function requestPermission(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      resolve(sendAndHandleSdkError('cameraDevice.requestPermission'));
    });
  }

  export function isSupported(): boolean {
    return runtime.supports.cameraDevice ? true : false;
  }

  export namespace augment {
    export interface ModifyImageProps {
      /**
       * Optional; indicate if inking on the selected Image is allowed or not
       * Default value is true
       */
      allowUserInking?: boolean;

      /**
       * Optional; indicate if putting text stickers on the selected Image is allowed or not
       * Default value is true
       */
      allowUserTextStickers?: boolean;

      /**
       * Optional; indicate if image filtering mode is enabled on the selected image
       * Default value is false
       */
      enableFilter?: boolean;
    }

    // used to capture one or more images from camera, gallery, or both. Lets app decide whether or not user can switch between front and back camera
    export function captureImages(
      count: number,
      sources?: Source[],
      cameraSwitcher?: boolean,
      modifyImageProps?: ModifyImageProps,
    ): Promise<media.Media[]> {
      let imageProps: ImageProps = {};

      if (modifyImageProps) {
        imageProps = modifyImageProps;
      }

      if (sources) {
        imageProps.sources = sources;
      }

      if (cameraSwitcher) {
        imageProps.cameraSwitcher = cameraSwitcher;
      }

      const imageInputs: ImageInputs = { mediaType: MediaType.Image, maxMediaCount: count, imageProps };
      return sendMessageToParentAsync<[SdkError, media.Media[]]>('selectMedia', [imageInputs]).then(
        ([err, localAttachments]: [SdkError, media.Media[]]) => {
          if (!localAttachments) {
            throw err;
          }

          return localAttachments;
        },
      );
    }

    export function isSupported(): boolean {
      return runtime.supports.cameraDevice.augment ? true : false;
    }
  }

  export namespace convert {
    // used to capture one or more images from camera, gallery, or both. Lets app decide whether or not user can switch between front and back camera
    export function captureImagesAsPdf(
      count: number,
      sources?: Source[],
      cameraSwitcher?: boolean,
    ): Promise<media.Media[]> {
      const imageProps: ImageProps = { imageOutputFormats: [ImageOutputFormats.PDF] };

      if (sources) {
        imageProps.sources = sources;
      }

      if (cameraSwitcher) {
        imageProps.cameraSwitcher = cameraSwitcher;
      }

      const imageInputs: ImageInputs = { mediaType: MediaType.Image, maxMediaCount: count, imageProps };
      return sendMessageToParentAsync<[SdkError, media.Media[]]>('selectMedia', [imageInputs]).then(
        ([err, localAttachments]: [SdkError, media.Media[]]) => {
          if (!localAttachments) {
            throw err;
          }

          return localAttachments;
        },
      );
    }

    export function isSupported(): boolean {
      return runtime.supports.cameraDevice.convert ? true : false;
    }
  }
}
