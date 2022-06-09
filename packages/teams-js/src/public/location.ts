import { sendAndHandleSdkError as sendAndHandleError, sendMessageToParent } from '../internal/communication';
import { locationAPIsRequiredVersion } from '../internal/constants';
import { ensureInitialized, isCurrentSDKVersionAtLeast } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { DevicePermission, ErrorCode, SdkError } from './interfaces';
import { runtime } from './runtime';

/**
 * namespace to get the user location
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
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    return sendAndHandleError('location.getLocation', { allowChooseLocation: false, showMap: false });
  }

  export function hasPermission(): Promise<boolean> {
    ensureInitialized(FrameContexts.content, FrameContexts.task);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    const permissions: DevicePermission = DevicePermission.GeoLocation;

    return new Promise<boolean>(resolve => {
      resolve(sendAndHandleError('permissions.has', permissions));
    });
  }

  export function requestPermission(): Promise<boolean> {
    ensureInitialized(FrameContexts.content, FrameContexts.task);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    const permissions: DevicePermission = DevicePermission.GeoLocation;

    return new Promise<boolean>(resolve => {
      resolve(sendAndHandleError('permissions.request', permissions));
    });
  }

  export function isSupported(): boolean {
    return runtime.supports.location ? true : false;
  }

  /**
   * @deprecated
   * As of 2.0.1, please use one of the following functions:
   * - {@link location.getCurrentLocation location.getCurrentLocation(): Promise\<Location\>}
   * - {@link location.map.chooseLocation location.map.chooseLocation(): Promise\<Location\>}
   *
   * @param props {@link LocationProps} - Specifying how the location request is handled
   * @param callback - Callback to invoke when current user location is fetched
   */
  export function getLocation(props: LocationProps, callback: (error: SdkError, location: Location) => void): void {
    if (!callback) {
      throw new Error('[location.getLocation] Callback cannot be null');
    }

    ensureInitialized(FrameContexts.content, FrameContexts.task);

    if (!isCurrentSDKVersionAtLeast(locationAPIsRequiredVersion)) {
      throw { errorCode: ErrorCode.OLD_PLATFORM };
    }
    if (!props) {
      throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
    }
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    sendMessageToParent('location.getLocation', [props], callback);
  }

  /**
   * @deprecated
   * As of 2.0.0-beta.4, please use {@link location.map.showLocation location.map.showLocation(location: Location): Promise\<void\>} instead.
   * Shows the location on map corresponding to the given coordinates
   * @param location {@link Location} - which needs to be shown on map
   * @param callback - Callback to invoke when the location is opened on map
   */
  export function showLocation(location: Location, callback: (error: SdkError, status: boolean) => void): void {
    if (!callback) {
      throw new Error('[location.showLocation] Callback cannot be null');
    }
    ensureInitialized(FrameContexts.content, FrameContexts.task);
    if (!isCurrentSDKVersionAtLeast(locationAPIsRequiredVersion)) {
      throw { errorCode: ErrorCode.OLD_PLATFORM };
    }
    if (!location) {
      throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
    }
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    sendMessageToParent('location.showLocation', [location], callback);
  }

  export namespace map {
    /**
     * Allows user to choose location on map
     * @returns The location chosen by the user after closing the map
     */
    export function chooseLocation(): Promise<Location> {
      ensureInitialized(FrameContexts.content, FrameContexts.task);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      return sendAndHandleError('location.getLocation', { allowChooseLocation: true, showMap: true });
    }

    /**
     * Shows the location on map corresponding to the given coordinates
     * @param location {@link Location} - which needs to be shown on map
     * @returns Promise that resolves when the location dialog has been closed
     */
    export function showLocation(location: Location): Promise<void> {
      ensureInitialized(FrameContexts.content, FrameContexts.task);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
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
