import { sendAndHandleSdkError } from '../../internal/communication';
import { ensureInitialized } from '../../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../../internal/telemetry';
import { errorNotSupportedOnPlatform, FrameContexts } from '../constants';
import { DevicePermission } from '../interfaces';
import { runtime } from '../runtime';
import * as map from './map';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const geoLocationTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * Data struture to represent the location information
 *
 * @beta
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
      Accuracy describes the maximum distance in meters from the captured coordinates to the possible actual location
      @remarks
      This property is only in scope for mobile
      */
  accuracy?: number;
  /**
      Time stamp when the location was captured
      */
  timestamp?: number;
}
/**
 * Fetches current user coordinates
 * @returns Promise that will resolve with {@link geoLocation.Location} object or reject with an error. Function can also throw a NOT_SUPPORTED_ON_PLATFORM error
 *
 * @beta
 */
export function getCurrentLocation(): Promise<Location> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return sendAndHandleSdkError(
    getApiVersionTag(geoLocationTelemetryVersionNumber, ApiName.GeoLocation_GetCurrentLocation),
    'location.getLocation',
    {
      allowChooseLocation: false,
      showMap: false,
    },
  );
}

/**
 * Checks whether or not location has user permission
 *
 * @returns Promise that will resolve with true if the user had granted the app permission to location information, or with false otherwise,
 * In case of an error, promise will reject with the error. Function can also throw a NOT_SUPPORTED_ON_PLATFORM error
 *
 * @beta
 */
export function hasPermission(): Promise<boolean> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  const permissions: DevicePermission = DevicePermission.GeoLocation;

  return new Promise<boolean>((resolve) => {
    resolve(
      sendAndHandleSdkError(
        getApiVersionTag(geoLocationTelemetryVersionNumber, ApiName.GeoLocation_HasPermission),
        'permissions.has',
        permissions,
      ),
    );
  });
}

/**
 * Requests user permission for location
 *
 * @returns true if the user consented permission for location, false otherwise
 * @returns Promise that will resolve with true if the user consented permission for location, or with false otherwise,
 * In case of an error, promise will reject with the error. Function can also throw a NOT_SUPPORTED_ON_PLATFORM error
 *
 * @beta
 */
export function requestPermission(): Promise<boolean> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  const permissions: DevicePermission = DevicePermission.GeoLocation;

  return new Promise<boolean>((resolve) => {
    resolve(
      sendAndHandleSdkError(
        getApiVersionTag(geoLocationTelemetryVersionNumber, ApiName.GeoLocation_RequestPermission),
        'permissions.request',
        permissions,
      ),
    );
  });
}

/**
 * Checks if geoLocation capability is supported by the host
 * @returns boolean to represent whether geoLocation is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @beta
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.geoLocation && runtime.supports.permissions ? true : false;
}

export { map };
