import { sendAndHandleSdkError, sendMessageToParentAsync } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { validateSelectMediaInputs } from '../internal/mediaUtil';
import { callCallbackWithErrorOrResultFromPromiseAndReturnPromise, InputFunction } from '../internal/utils';
import { FrameContexts, MediaType, VideoMediaEvent } from './constants';
import { ErrorCode, ImageProps, MediaProps, SdkError } from './interfaces';
// We should not be importing this class. Should make an interface for this (the function on media isn't needed and has been replaced with mediaChunking.getMediaAsBlob)
import { media } from './media';
import { runtime } from './runtime';

export namespace videoDevice {
  /**
   * All properties in VideoProps are optional and have default values in the platform
   */
  export interface VideoProps extends MediaProps {
    /**
     * Optional; the maximum duration in seconds after which the recording should terminate automatically.
     * Default value is defined by the platform serving the API.
     */
    maxDuration?: number;

    /**
     * Optional; to determine if the video capturing flow needs to be launched
     * in Full Screen Mode (Lens implementation) or PictureInPicture Mode (Native implementation).
     * Default value is true, indicating video will always launch in Full Screen Mode via lens.
     */
    isFullScreenMode?: boolean;

    /**
     * Optional; controls the visibility of stop button in PictureInPicture Mode.
     * Default value is true, indicating the user will be able to stop the video.
     */
    isStopButtonVisible?: boolean;
  }

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
  export interface VideoEventCallbacks {
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
    mediaControllerEvent: VideoMediaEvent;
  }

  export function sendVideoMediaEventToHost(mediaEvent: VideoMediaEvent, mediaType: MediaType): Promise<void> {
    ensureInitialized(FrameContexts.content, FrameContexts.task);

    const params: MediaControllerParam = {
      mediaType,
      mediaControllerEvent: mediaEvent,
    };

    return sendAndHandleSdkError('media.controller', [params]);
  }

  // This probably won't do much good unless you call mediaChunking.getMediaAsBlob on the result
  export function selectMediaContainingVideo(
    mediaInputs: VideoInputs | VideoAndImageInputs,
    mediaEventCallback?: VideoEventCallbacks,
  ): Promise<media.Media[]> {
    ensureInitialized(FrameContexts.content, FrameContexts.task);

    const wrappedFunction: InputFunction<media.Media[]> = () =>
      new Promise<[SdkError, media.Media[], VideoMediaEvent]>(resolve => {
        if (!validateSelectMediaInputs(mediaInputs)) {
          throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
        }

        const params = [mediaInputs];
        // What comes back from native at attachments would just be objects and will be missing getMedia method on them.
        resolve(sendMessageToParentAsync<[SdkError, media.Media[], VideoMediaEvent]>('selectMedia', params));
      }).then(([err, localAttachments, mediaEvent]: [SdkError, media.Media[], VideoMediaEvent]) => {
        // MediaControllerEvent response is used to notify the app about events and is a partial response to selectMedia
        if (mediaEvent) {
          if (mediaEventCallback) {
            switch (mediaEvent) {
              case VideoMediaEvent.StartRecording:
                mediaEventCallback.onRecordingStarted();
                break;
              // TODO - Should discuss whether this function should be required
              case VideoMediaEvent.StopRecording:
                mediaEventCallback.onRecordingStopped && mediaEventCallback.onRecordingStopped();
                break;
            }
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
