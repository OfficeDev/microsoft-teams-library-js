import { sendAndHandleSdkError, sendMessageToParentAsync } from '../internal/communication';
import { mediaAPISupportVersion } from '../internal/constants';
import { ensureInitialized, isCurrentSDKVersionAtLeast } from '../internal/internalAPIs';
import { validateSelectMediaInputs } from '../internal/mediaUtil';
import { callCallbackWithErrorOrResultFromPromiseAndReturnPromise, InputFunction } from '../internal/utils';
import { FrameContexts, MediaType } from './constants';
import { ErrorCode, SdkError } from './interfaces';
import { media } from './media';
import { runtime } from './runtime';

export namespace audio {
  /**
   * Input parameter supplied to the select Media API
   */
  export interface AudioInputs {
    /**
     * Only one media type can be selected at a time
     */
    mediaType: MediaType.Audio;

    /**
     * max limit of media allowed to be selected in one go, current max limit is 10 set by office lens.
     */
    maxMediaCount: number;

    /**
     * Additional properties for audio capture flows.
     */
    audioProps?: AudioProps;
  }

  /**
   *  All properties in AudioProps are optional and have default values in the platform
   */
  export interface AudioProps {
    /**
     * Optional; the maximum duration in minutes after which the recording should terminate automatically
     * Default value is defined by the platform serving the API.
     */
    maxDuration?: number;
  }

  export function selectAudio(audioInput: AudioInputs): Promise<media.Media[]> {
    ensureInitialized(FrameContexts.content, FrameContexts.task);

    // Probably should clean this up, no reason to use this structure anymore
    const wrappedFunction: InputFunction<media.Media[]> = () =>
      new Promise<[SdkError, media.Media[]]>(resolve => {
        if (!isCurrentSDKVersionAtLeast(mediaAPISupportVersion)) {
          throw { errorCode: ErrorCode.OLD_PLATFORM };
        }

        if (!validateSelectMediaInputs(audioInput)) {
          throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
        }

        const params = [audioInput];
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

  export function hasPermission(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      resolve(sendAndHandleSdkError('audioDevice.hasPermission'));
    });
  }

  // This should not trigger the "refresh the app scenario" because this is for setting things up
  // for use through teamsjs-sdk 2.0. If the user DOES refresh the app after calling this the iframe
  // would have the new allow parameters, but only the AppPermissions dialog should trigger the
  // "ask the user to refresh" flow
  export function requestPermission(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      resolve(sendAndHandleSdkError('audioDevice.requestPermission'));
    });
  }

  export function isSupported(): boolean {
    return runtime.supports.media.audio ? true : false;
  }
}
