/**
 * Module to interact with the location on map module-specific part of the SDK.
 *
 * @beta
 * @module
 */

import { sendAndHandleSdkError } from '../../internal/communication';
import { ensureInitialized } from '../../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../../internal/telemetry';
import { errorNotSupportedOnPlatform, FrameContexts } from '../constants';
import { ErrorCode } from '../interfaces';
import { runtime } from '../runtime';
import { Location } from './geoLocation';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const geoLocationTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * Allows user to choose location on map
 *
 * @returns Promise that will resolve with {@link geoLocation.Location} object chosen by the user or reject with an error. Function can also throw a NOT_SUPPORTED_ON_PLATFORM error
 *
 * @beta
 */
export function chooseLocation(): Promise<Location> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return sendAndHandleSdkError(
    getApiVersionTag(geoLocationTelemetryVersionNumber, ApiName.GeoLocation_Map_ChooseLocation),
    'location.getLocation',
    {
      allowChooseLocation: true,
      showMap: true,
    },
  );
}

/**
 * Shows the location on map corresponding to the given coordinates
 *
 * @param location - Location to be shown on the map
 * @returns Promise that resolves when the location dialog has been closed or reject with an error. Function can also throw a NOT_SUPPORTED_ON_PLATFORM error
 *
 * @beta
 */
export function showLocation(location: Location): Promise<void> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  if (!location) {
    throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
  }
  return sendAndHandleSdkError(
    getApiVersionTag(geoLocationTelemetryVersionNumber, ApiName.GeoLocation_ShowLocation),
    'location.showLocation',
    location,
  );
}

/**
 * Checks if geoLocation.map capability is supported by the host
 * @returns boolean to represent whether geoLocation.map is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @beta
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) &&
    runtime.supports.geoLocation &&
    runtime.supports.geoLocation.map &&
    runtime.supports.permissions
    ? true
    : false;
}
