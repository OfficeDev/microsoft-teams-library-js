import { sendAndHandleSdkError, sendMessageToParentAsync } from '../internal/communication';
import { mediaAPISupportVersion, nonFullScreenVideoModeAPISupportVersion } from '../internal/constants';
import {
  ensureInitialized,
  isCurrentSDKVersionAtLeast,
  throwExceptionIfMobileApiIsNotSupported,
} from '../internal/internalAPIs';
import {
  isVideoControllerRegistered,
  throwExceptionIfMediaCallIsNotSupportedOnMobile,
  validateSelectMediaInputs,
} from '../internal/mediaUtil';
import {
  callCallbackWithErrorOrResultFromPromiseAndReturnPromise,
  callCallbackWithSdkErrorFromPromiseAndReturnPromise,
  InputFunction,
} from '../internal/utils';
import { FrameContexts, MediaControllerEvent, MediaType } from './constants';
import { ErrorCode, ImageProps, SdkError, VideoProps } from './interfaces';
import { media } from './media';
import { runtime } from './runtime';

export namespace videoDevice {
  /**
   * Input parameter supplied to the select Media API
   */
  export interface VideoInputs {
    /**
     * Only one media type can be selected at a time
     */
    mediaType: MediaType.Video;

    /**
     * max limit of media allowed to be selected in one go, current max limit is 10 set by office lens.
     */
    maxMediaCount: number;

    /**
     * Additional properties for customization of select media - Video in mobile devices
     */
    videoProps?: VideoProps;
  }

  export interface VideoAndImageInputs {
    /**
     * Only one media type can be selected at a time
     */
    mediaType: MediaType.VideoAndImage;

    /**
     * max limit of media allowed to be selected in one go, current max limit is 10 set by office lens.
     */
    maxMediaCount: number;

    /**
     * Additional properties for customization of select media - VideoAndImage in mobile devices
     */
    videoAndImageProps?: ImageProps & VideoProps;
  }

  /**
   * Callback which will register your app to listen to lifecycle events during the video capture flow
   */
  export interface VideoControllerCallback {
    onRecordingStarted(): void;
    onRecordingStopped?(): void;
  }

  /**
   * @hidden
   * Hide from docs
   * --------
   * Interface with relevant info to send communication from the app to the host client
   */
  interface MediaControllerParam {
    /**
     * List of team information
     */
    mediaType: MediaType;

    /**
     * List of team information
     */
    mediaControllerEvent: MediaControllerEvent;
  }

  /**
   * @hidden
   * Hide from docs
   * --------
   * Base class which holds the callback and notifies events to the host client
   */
  abstract class MediaController<T> {
    protected controllerCallback: T;

    public constructor(controllerCallback: T) {
      this.controllerCallback = controllerCallback;
    }

    protected abstract getMediaType(): MediaType;

    /**
     * @hidden
     * Hide from docs
     * --------
     * This function will be implemented by the respective media class which holds the logic
     * of specific events that needs to be notified to the app.
     * @param mediaEvent indicates the event signed by the host client to the app
     */
    protected abstract notifyEventToApp(mediaEvent: MediaControllerEvent): void;

    /**
     * @hidden
     * Hide from docs
     * --------
     *
     * Function to notify the host client to programatically control the experience
     * @param mediaEvent indicates what the event that needs to be signaled to the host client
     * @returns A promise resolved promise
     */
    protected notifyEventToHost(mediaEvent: MediaControllerEvent): Promise<void>;
    /**
     * @hidden
     * Hide from docs
     * --------
     *
     * @deprecated
     * As of 2.0.0-beta.3, please use {@link audioVisualDevice.MediaController.notifyEventToHost media.MediaController.notifyEventToHost(mediaEvent: MediaControllerEvent): Promise\<void\>} instead.
     *
     * Function to notify the host client to programatically control the experience
     * @param mediaEvent indicates what the event that needs to be signaled to the host client
     * Optional; @param callback is used to send app if host client has successfully handled the notification event or not
     */
    protected notifyEventToHost(mediaEvent: MediaControllerEvent, callback?: (err?: SdkError) => void): void;
    protected notifyEventToHost(mediaEvent: MediaControllerEvent, callback?: (err?: SdkError) => void): Promise<void> {
      ensureInitialized(FrameContexts.content, FrameContexts.task);

      try {
        throwExceptionIfMobileApiIsNotSupported(nonFullScreenVideoModeAPISupportVersion);
      } catch (err) {
        const wrappedRejectedErrorFn: InputFunction<void> = () => Promise.reject(err);

        return callCallbackWithSdkErrorFromPromiseAndReturnPromise(wrappedRejectedErrorFn, callback);
      }

      const params: MediaControllerParam = {
        mediaType: this.getMediaType(),
        mediaControllerEvent: mediaEvent,
      };

      const wrappedFunction = (): Promise<void> =>
        new Promise(resolve => resolve(sendAndHandleSdkError('media.controller', [params])));

      return callCallbackWithSdkErrorFromPromiseAndReturnPromise(wrappedFunction, callback);
    }

    /**
     * Function to programatically stop the ongoing media event
     *
     * @returns A resolved promise
     * */
    public stop(): Promise<void>;
    /**
     *
     * Function to programatically stop the ongoing media event
     *
     * @deprecated
     * As of 2.0.0-beta.3, please use {@link audioVisualDevice.MediaController.stop media.MediaController.stop(): Promise\<void\>} instead.
     *
     * Optional; @param callback is used to send app if host client has successfully stopped the event or not
     */
    public stop(callback?: (err?: SdkError) => void): void;
    public stop(callback?: (err?: SdkError) => void): Promise<void> {
      return Promise.resolve(this.notifyEventToHost(MediaControllerEvent.StopRecording, callback));
    }
  }

  /**
   * VideoController class is used to communicate between the app and the host client during the video capture flow
   */
  export class VideoController extends MediaController<VideoControllerCallback> {
    protected getMediaType(): MediaType {
      return MediaType.Video;
    }

    public notifyEventToApp(mediaEvent: MediaControllerEvent): void {
      switch (mediaEvent) {
        case MediaControllerEvent.StartRecording:
          this.controllerCallback.onRecordingStarted();
          break;
        // TODO - Should discuss whether this function should be required
        case MediaControllerEvent.StopRecording:
          this.controllerCallback.onRecordingStopped && this.controllerCallback.onRecordingStopped();
          break;
      }
    }
  }

  // This is very similar to selectImage and selectAudio, other than the MediaControllerEvent parts
  // I can't decide if it's worth it to merge this into a single shared function that is more confusing
  // to read or keep this out as a "related but different" function
  export function selectMediaContainingVideo(mediaInputs: VideoInputs | VideoAndImageInputs): Promise<media.Media[]> {
    ensureInitialized(FrameContexts.content, FrameContexts.task);

    const wrappedFunction: InputFunction<media.Media[]> = () =>
      new Promise<[SdkError, media.Media[], MediaControllerEvent]>(resolve => {
        if (!isCurrentSDKVersionAtLeast(mediaAPISupportVersion)) {
          throw { errorCode: ErrorCode.OLD_PLATFORM };
        }
        throwExceptionIfMediaCallIsNotSupportedOnMobile(mediaInputs);

        if (!validateSelectMediaInputs(mediaInputs)) {
          throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
        }

        const params = [mediaInputs];
        // What comes back from native at attachments would just be objects and will be missing getMedia method on them.
        resolve(sendMessageToParentAsync<[SdkError, media.Media[], MediaControllerEvent]>('selectMedia', params));
      }).then(([err, localAttachments, mediaEvent]: [SdkError, media.Media[], MediaControllerEvent]) => {
        // MediaControllerEvent response is used to notify the app about events and is a partial response to selectMedia
        if (mediaEvent) {
          if (isVideoControllerRegistered(mediaInputs)) {
            const videoController: VideoController = (mediaInputs as VideoInputs)
              ? (mediaInputs as VideoInputs).videoProps?.videoController
              : (mediaInputs as VideoAndImageInputs).videoAndImageProps?.videoController;
            videoController.notifyEventToApp(mediaEvent);
          }
          return [];
        }

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
      resolve(sendAndHandleSdkError('videoDevice.hasPermission'));
    });
  }

  // This should not trigger the "refresh the app scenario" because this is for setting things up
  // for use through teamsjs-sdk 2.0. If the user DOES refresh the app after calling this the iframe
  // would have the new allow parameters, but only the AppPermissions dialog should trigger the
  // "ask the user to refresh" flow
  export function requestPermission(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      resolve(sendAndHandleSdkError('videoDevice.requestPermission'));
    });
  }

  export function isSupported(): boolean {
    return runtime.supports.videoDevice ? true : false;
  }
}
