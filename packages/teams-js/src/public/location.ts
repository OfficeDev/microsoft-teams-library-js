import { sendAndHandleSdkError as sendAndHandleError } from '../internal/communication';
import { locationAPIsRequiredVersion } from '../internal/constants';
import { ensureInitialized, isCurrentSDKVersionAtLeast } from '../internal/internalAPIs';
import {
  callCallbackWithErrorOrBooleanFromPromiseAndReturnPromise,
  callCallbackWithErrorOrResultFromPromiseAndReturnPromise,
} from '../internal/utils';
import { FrameContexts } from './constants';
import { ErrorCode, SdkError } from './interfaces';
import { runtime } from './runtime';
/**
 * @alpha
 */
export namespace location {
  export interface LocationProps {
    /**
    whether user can alter location or not
    if false, user will be shown current location 
    and wouldn't be allowed to alter it
    */
    allowChooseLocation: boolean;
    /**
     * @deprecated
     * whether selected location should be shown to user on map or not.
     * If allowChooseLocation is true, this parameter will be ignored by platform.
     * If allowChooseLocation is false, and this parameter is not provided, default
     * value will be false.
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

  function getLocationHelper(props: LocationProps): Promise<Location> {
    return new Promise<Location>(resolve => {
      if (!isCurrentSDKVersionAtLeast(locationAPIsRequiredVersion)) {
        throw { errorCode: ErrorCode.OLD_PLATFORM };
      }
      if (!props) {
        throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
      }
      resolve(sendAndHandleError('location.getLocation', props));
    });
  }

  export function getCurrentLocation(): Promise<Location> {
    ensureInitialized(FrameContexts.content, FrameContexts.task);
    return getLocationHelper({ allowChooseLocation: false });
  }

  export function hasPermission(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      resolve(sendAndHandleError('location.hasPermission'));
    });
  }

  // Not intended to be checked in, but an example of how permissions might be used
  export async function permissionExample(): Promise<void> {
    hasPermission().then(alreadyHadPermission => {
      if (!alreadyHadPermission) {
        requestPermission().then(permissionStatus => {
          if (permissionStatus) {
            alert('Use function that required permission');
          } else {
            alert('User was asked to grant permission and refused');
          }
        });
      } else {
        alert('User has previously granted permission, call function that required permission');
      }
    });
  }

  // This should not trigger the "refresh the app scenario" because this is for setting things up
  // for use through teamsjs-sdk 2.0. If the user DOES refresh the app after calling this the iframe
  // would have the new allow parameters, but only the AppPermissions dialog should trigger the
  // "ask the user to refresh" flow
  export function requestPermission(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      resolve(sendAndHandleError('location.requestPermission'));
    });
  }

  export function isSupported(): boolean {
    return runtime.supports.location ? true : false;
  }

  export namespace map {
    /**
     * @deprecated
     * As of 2.0.0-beta.1, please use {@link locationNEW.getCurrentLocation locationNEW.getCurrentLocation(): Promise\<Location\>},
     * {@link locationNEW.map.chooseLocation locationNEW.map.chooseLocation(): Promise\<Location\>}, or
     * {@link locationNEW.map.showLocation locationNEW.map.showLocation(location: Location): Promise\<void\>} instead.
     * @param props {@link LocationProps} - Specifying how the location request is handled
     * @param callback - Callback to invoke when current user location is fetched
     */
    export function getLocation(props: LocationProps, callback: (error: SdkError, location: Location) => void): void {
      ensureInitialized(FrameContexts.content, FrameContexts.task);
      callCallbackWithErrorOrResultFromPromiseAndReturnPromise<Location>(getLocationHelper, callback, props).finally();
    }

    // User chooses a location using a map control
    export function chooseLocation(): Promise<Location> {
      ensureInitialized(FrameContexts.content, FrameContexts.task);
      return getLocationHelper({ allowChooseLocation: true });
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
     * As of 2.0.0-beta.1, please use {@link location.showLocation location.showLocation(location: Location): Promise\<void\>} instead.
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
        resolve(sendAndHandleError('location.showLocation', location));
      });
    }

    export function isSupported(): boolean {
      return runtime.supports.location.map ? true : false;
    }
  }
}
