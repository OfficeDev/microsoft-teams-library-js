import { sendAndHandleSdkError as sendAndHandleError } from '../internal/communication';
import { locationAPIsRequiredVersion } from '../internal/constants';
import { ensureInitialized, isCurrentSDKVersionAtLeast } from '../internal/internalAPIs';
import {
  callCallbackWithErrorOrBooleanFromPromiseAndReturnPromise,
  callCallbackWithErrorOrResultFromPromiseAndReturnPromise,
} from '../internal/utils';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { ErrorCode, SdkError } from './interfaces';
import { runtime } from './runtime';

export namespace location {
  export interface LocationProps {
    /**
    whether user can alter location or not
    if false, user will be shown current location 
    and wouldn't be allowed to alter it
    */
    allowChooseLocation: boolean;
    /**
    whether selected location should be shown to user on map or not.
    If allowChooseLocation is true, this parameter will be ignored by platform.
    If allowChooseLocation is false, and this parameter is not provided, default 
    value will be false.
    */
    showMap?: boolean;
  }

  export interface Location {
    /**
    Latitude of the location
    */
    latitude: number;
    /**
    Longitude of the location
    */
    longitude: number;
    /**
    Accuracy of the coordinates captured
    */
    accuracy?: number;
    /**
    Time stamp when the location was captured
    */
    timestamp?: number;
  }

  /**
   * Fetches current user coordinates or allows user to choose location on map
   *
   * @param props {@link LocationProps} - Specifying how the location request is handled
   * @returns Promise that will be fulfilled when the operation has completed
   */
  export function getLocation(props: LocationProps): Promise<Location>;
  /**
   * @deprecated
   * As of 2.0.0, please use {@link location.getLocation location.getLocation(props: LocationProps): Promise\<Location\>} instead.
   * @param props {@link LocationProps} - Specifying how the location request is handled
   * @param callback - Callback to invoke when current user location is fetched
   */
  export function getLocation(props: LocationProps, callback: (error: SdkError, location: Location) => void): void;
  export function getLocation(
    props: LocationProps,
    callback?: (error: SdkError, location: Location) => void,
  ): Promise<Location> {
    ensureInitialized(FrameContexts.content, FrameContexts.task);

    return callCallbackWithErrorOrResultFromPromiseAndReturnPromise<Location>(getLocationHelper, callback, props);
  }

  function getLocationHelper(props: LocationProps): Promise<Location> {
    return new Promise<Location>(resolve => {
      if (!isCurrentSDKVersionAtLeast(locationAPIsRequiredVersion)) {
        throw { errorCode: ErrorCode.OLD_PLATFORM };
      }
      if (!props) {
        throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
      }
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      resolve(sendAndHandleError('location.getLocation', props));
    });
  }

  /**
   * Shows the location on map corresponding to the given coordinates
   *
   * @param location {@link Location} - which needs to be shown on map
   * @returns Promise that will be fulfilled when the operation has completed
   */
  export function showLocation(location: Location): Promise<void>;
  /**
   * @deprecated
   * As of 2.0.0, please use {@link location.showLocation location.showLocation(location: Location): Promise\<void\>} instead.
   * Shows the location on map corresponding to the given coordinates
   * @param location {@link Location} - which needs to be shown on map
   * @param callback - Callback to invoke when the location is opened on map
   */
  export function showLocation(location: Location, callback: (error: SdkError, status: boolean) => void): void;
  export function showLocation(
    location: Location,
    callback?: (error: SdkError, status: boolean) => void,
  ): Promise<void> {
    ensureInitialized(FrameContexts.content, FrameContexts.task);
    return callCallbackWithErrorOrBooleanFromPromiseAndReturnPromise<void>(showLocationHelper, callback, location);
  }

  export function showLocationHelper(location: Location): Promise<void> {
    return new Promise<void>(resolve => {
      if (!isCurrentSDKVersionAtLeast(locationAPIsRequiredVersion)) {
        throw { errorCode: ErrorCode.OLD_PLATFORM };
      }
      if (!location) {
        throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
      }
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      resolve(sendAndHandleError('location.showLocation', location));
    });
  }

  export function isSupported(): boolean {
    return runtime.supports.location ? true : false;
  }
}
