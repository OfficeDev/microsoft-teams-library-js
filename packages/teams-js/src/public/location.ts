import { sendMessageToParent } from '../internal/communication';
import { locationAPIsRequiredVersion } from '../internal/constants';
import { ensureInitialized, isCurrentSDKVersionAtLeast } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { ErrorCode, SdkError } from './interfaces';
import { runtime } from './runtime';

/**
 * @deprecated
 * As of 2.1.0, please use geoLocation namespace.
 *
 * Namespace to interact with the location module-specific part of the SDK.
 */
export namespace location {
  /** Get location callback function type */
  type getLocationCallbackFunctionType = (error: SdkError, location: Location) => void;
  /** Show location callback function type */
  type showLocationCallbackFunctionType = (error: SdkError, status: boolean) => void;

  /**
   * @deprecated
   * Data Structure to set the location properties in getLocation call.
   */
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

  /**
   * @deprecated
   * Data struture to represent the location information
   */
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
   * @deprecated
   * As of 2.1.0, please use one of the following functions:
   * - {@link geoLocation.getCurrentLocation geoLocation.getCurrentLocation(): Promise\<Location\>} to get the current location.
   * - {@link geoLocation.map.chooseLocation geoLocation.map.chooseLocation(): Promise\<Location\>} to choose location on map.
   *
   * Fetches user location
   * @param props {@link LocationProps} - Specifying how the location request is handled
   * @param callback - Callback to invoke when current user location is fetched
   */
  export function getLocation(props: LocationProps, callback: getLocationCallbackFunctionType): void {
    if (!callback) {
      throw new Error('[location.getLocation] Callback cannot be null');
    }

    ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);

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
   * As of 2.1.0, please use {@link geoLocation.map.showLocation geoLocation.map.showLocation(location: Location): Promise\<void\>} instead.
   *
   * Shows the location on map corresponding to the given coordinates
   *
   * @param location - Location to be shown on the map
   * @param callback - Callback to invoke when the location is opened on map
   */
  export function showLocation(location: Location, callback: showLocationCallbackFunctionType): void {
    if (!callback) {
      throw new Error('[location.showLocation] Callback cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
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

  /**
   * @deprecated
   * As of 2.1.0, please use geoLocation namespace, and use {@link geoLocation.isSupported geoLocation.isSupported: boolean} to check if geoLocation is supported.
   *
   * Checks if Location capability is supported by the host
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   *
   * @returns boolean to represent whether Location is supported
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.location ? true : false;
  }
}
