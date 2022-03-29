import { sendAndHandleSdkError, sendMessageToParentAsync } from '../internal/communication';
import { mediaAPISupportVersion } from '../internal/constants';
import { ensureInitialized, isCurrentSDKVersionAtLeast } from '../internal/internalAPIs';
import {
  throwExceptionIfMediaCallIsNotSupportedOnMobile,
  validateSelectMediaInputs,
  validateViewImagesInput,
} from '../internal/mediaUtil';
import { callCallbackWithErrorOrResultFromPromiseAndReturnPromise, InputFunction } from '../internal/utils';
import { FrameContexts, MediaType } from './constants';
import { ErrorCode, ImageProps, ImageUri, SdkError } from './interfaces';
import { media } from './media';
import { runtime } from './runtime';

export namespace cameraDevice {
  export interface ImageInputs {
    mediaType: MediaType.Image;
    maxMediaCount: number;
    imageProps?: ImageProps;
  }

  export function selectImages(imageInputs: ImageInputs): Promise<media.Media[]> {
    ensureInitialized(FrameContexts.content, FrameContexts.task);

    // Probably should clean this up, no reason to use this structure anymore
    const wrappedFunction: InputFunction<media.Media[]> = () =>
      new Promise<[SdkError, media.Media[]]>(resolve => {
        if (!isCurrentSDKVersionAtLeast(mediaAPISupportVersion)) {
          throw { errorCode: ErrorCode.OLD_PLATFORM };
        }
        throwExceptionIfMediaCallIsNotSupportedOnMobile(imageInputs);

        if (!validateSelectMediaInputs(imageInputs)) {
          throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
        }

        const params = [imageInputs];
        // What comes back from native at attachments would just be objects and will be missing getMedia method on them.
        resolve(sendMessageToParentAsync<[SdkError, media.Media[]]>('selectMedia', params));
      }).then(([err, localAttachments]: [SdkError, media.Media[]]) => {
        // Media Attachments are final response to selectMedia
        if (!localAttachments) {
          throw err;
        }
        const mediaArray: media.Media[] = [];
        for (const attachment of localAttachments) {
          mediaArray.push(new media.Media(attachment));
        }
        return mediaArray;
      });

    return callCallbackWithErrorOrResultFromPromiseAndReturnPromise<media.Media[]>(wrappedFunction);
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
}
