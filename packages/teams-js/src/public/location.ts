import { sendAndHandleSdkError as sendAndHandleError } from '../internal/communication';
import { locationAPIsRequiredVersion } from '../internal/constants';
import { ensureInitialized, isCurrentSDKVersionAtLeast } from '../internal/internalAPIs';
import {
  callCallbackWithErrorOrBooleanFromPromiseAndReturnPromise,
  callCallbackWithErrorOrResultFromPromiseAndReturnPromise,
} from '../internal/utils';
import { FrameContexts } from './constants';
import { DevicePermission, DevicePermissionType, ErrorCode, SdkError } from './interfaces';
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
   * Fetches current user coordinates
   * @returns User's current location
   */
  export function getCurrentLocation(): Promise<Location> {
    ensureInitialized(FrameContexts.content, FrameContexts.task);
    return sendAndHandleError('location.getLocation', { allowChooseLocation: false, showMap: false });
  }

  export function hasPermission(): Promise<boolean> {
    const permissions: DevicePermission[] = [{ type: DevicePermissionType.GeoLocation }];

    return new Promise<boolean>(resolve => {
      resolve(sendAndHandleError('permission.has', permissions));
    });
  }

  // This should not trigger the "refresh the app scenario" because this is for setting things up
  // for use through teamsjs-sdk 2.0. If the user DOES refresh the app after calling this the iframe
  // would have the new allow parameters, but only the AppPermissions dialog should trigger the
  // "ask the user to refresh" flow
  export function requestPermission(): Promise<boolean> {
    const permissions: DevicePermission[] = [{ type: DevicePermissionType.GeoLocation }];

    return new Promise<boolean>(resolve => {
      resolve(sendAndHandleError('permission.request', permissions));
    });
  }

  // Example of how developer would use permissions functions
  // export async function permissionExample(): Promise<void> {
  //   hasPermission().then(alreadyHadPermission => {
  //     if (!alreadyHadPermission) {
  //       requestPermission().then(permissionStatus => {
  //         if (permissionStatus) {
  //           alert('Use function that required permission');
  //         } else {
  //           alert('User was asked to grant permission and refused');
  //         }
  //       });
  //     } else {
  //       alert('User has previously granted permission, call function that required permission');
  //     }
  //   });
  // }

  export function isSupported(): boolean {
    return runtime.supports.location ? true : false;
  }

  /**
   * IMPLEMENTATION NOTE: this should really just be "the unpromisified version of getLocation".
   * There's no reason to go from callback to promise back to callback in the "real" implementation
   * @deprecated
   * As of 2.0.0-beta.4, please use one of the following functions:
   * - {@link location.getCurrentLocation location.getCurrentLocation(): Promise\<Location\>}
   * - {@link location.map.chooseLocation location.map.chooseLocation(): Promise\<Location\>}
   * @param props {@link LocationProps} - Specifying how the location request is handled
   * @param callback - Callback to invoke when current user location is fetched
   */
  export function getLocation(props: LocationProps, callback: (error: SdkError, location: Location) => void): void {
    ensureInitialized(FrameContexts.content, FrameContexts.task);

    if (!isCurrentSDKVersionAtLeast(locationAPIsRequiredVersion)) {
      throw { errorCode: ErrorCode.OLD_PLATFORM };
    }
    if (!props) {
      throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
    }

    callCallbackWithErrorOrResultFromPromiseAndReturnPromise<Location>(getLocationHelper, callback, props);
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

  /**
   * IMPLEMENTATION NOTE: this should really just be "the unpromisified version of getLocation".
   * There's no reason to go from callback to promise back to callback in the "real" implementation
   * @deprecated
   * As of 2.0.0-beta.4, please use {@link location.map.showLocation location.map.showLocation(location: Location): Promise\<void\>} instead.
   * Shows the location on map corresponding to the given coordinates
   * @param location {@link Location} - which needs to be shown on map
   * @param callback - Callback to invoke when the location is opened on map
   */
  export function showLocation(location: Location, callback: (error: SdkError, status: boolean) => void): void {
    ensureInitialized(FrameContexts.content, FrameContexts.task);
    callCallbackWithErrorOrBooleanFromPromiseAndReturnPromise<void>(showLocationHelper, callback, location);
  }

  function showLocationHelper(location: Location): Promise<void> {
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

  export namespace map {
    /**
     * Allows user to choose location on map
     * @returns The location chosen by the user after closing the map
     */
    export function chooseLocation(): Promise<Location> {
      ensureInitialized(FrameContexts.content, FrameContexts.task);
      return sendAndHandleError('location.getLocation', { allowChooseLocation: true, showMap: true });
    }

    /**
     * Shows the location on map corresponding to the given coordinates
     * @param location {@link Location} - which needs to be shown on map
     * @returns Promise that resolves when the location dialog has been closed TODO VERIFY
     */
    export function showLocation(location: Location): Promise<void> {
      ensureInitialized(FrameContexts.content, FrameContexts.task);
      if (!location) {
        throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
      }
      return sendAndHandleError('location.showLocation', location);
    }

    export function isSupported(): boolean {
      return runtime.supports.location ? true : false;
    }
  }
}
