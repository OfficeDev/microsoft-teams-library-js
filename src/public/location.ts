import { GlobalVars } from '../internal/globalVars';
import { SdkError, ErrorCode } from './interfaces';
import { ensureInitialized, sendMessageRequestToParent, isAPISupportedByPlatform } from '../internal/internalAPIs';
import { frameContexts } from '../internal/constants';

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
  If allowChooseLocation is false, and this paramater is not provided, default 
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
 * @param callback Callback to invoke when current user location is fetched
 */
export function getLocation(props: LocationProps, callback: (error: SdkError, location: Location) => void): void {
  if (!callback) {
    throw new Error('[getLocation] Callback cannot be null');
  }
  ensureInitialized(frameContexts.content, frameContexts.task);

  if (!isAPISupportedByPlatform('1.7.0')) {
    const oldPlatformError: SdkError = { errorCode: ErrorCode.OLD_PLATFORM };
    callback(oldPlatformError, undefined);
    return;
  }

  const messageId = sendMessageRequestToParent('getLocation', [props]);
  GlobalVars.callbacks[messageId] = callback;
}

/**
 * Shows the location on map corresponding to the given coordinates
 * @param location {@link Location} which needs to be shown on map
 * @param callback Callback to invoke when the location is opened on map
 */
export function showLocation(location: Location, callback: (error: SdkError, status: boolean) => void): void {
  if (!callback) {
    throw new Error('[showLocation] Callback cannot be null');
  }
  ensureInitialized(frameContexts.content, frameContexts.task);

  if (!isAPISupportedByPlatform('1.7.0')) {
    const oldPlatformError: SdkError = { errorCode: ErrorCode.OLD_PLATFORM };
    callback(oldPlatformError, undefined);
    return;
  }

  const messageId = sendMessageRequestToParent('showLocation', [location]);
  GlobalVars.callbacks[messageId] = callback;
}
