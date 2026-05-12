/**
 * Intune Mobile Application Management (MAM) policy APIs.
 *
 * These APIs allow MOS apps to query Intune MAM policy decisions
 * for UX purposes (e.g., disabling a "Save" button when the policy
 * disallows saving to a given location).
 *
 * Security note:
 * - These APIs are NOT a security boundary.
 * - All enforcement MUST happen in native HubSDK / host code paths.
 * - Policy values can change while the app is running; consumers should
 *   call policy APIs immediately before executing the related action.
 *
 * @beta
 * @module
 */

import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { runtime } from './runtime';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const intuneTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * Locations to which organizational data may be saved.
 * Equivalent to MAM SDK SaveLocation (Android) / IntuneMAMSaveLocation (iOS).
 */
export enum SaveLocation {
  /** OneDrive for Business */
  ONEDRIVE_FOR_BUSINESS = 'ONEDRIVE_FOR_BUSINESS',
  /** SharePoint */
  SHAREPOINT = 'SHAREPOINT',
  /** Box */
  BOX = 'BOX',
  /** Dropbox */
  DROPBOX = 'DROPBOX',
  /** Google Drive */
  GOOGLE_DRIVE = 'GOOGLE_DRIVE',
  /** Local device storage */
  LOCAL = 'LOCAL',
  /** Account document storage */
  ACCOUNT_DOCUMENT = 'ACCOUNT_DOCUMENT',
  /** Device photo library */
  PHOTO_LIBRARY = 'PHOTO_LIBRARY',
  /** Other / unrecognized location */
  OTHER = 'OTHER',
}

/**
 * Locations from which data may be opened/imported into the app.
 * Equivalent to MAM SDK OpenLocation (Android) / IntuneMAMOpenLocation (iOS).
 */
export enum OpenLocation {
  /** OneDrive for Business */
  ONEDRIVE_FOR_BUSINESS = 'ONEDRIVE_FOR_BUSINESS',
  /** SharePoint */
  SHAREPOINT = 'SHAREPOINT',
  /** Device camera */
  CAMERA = 'CAMERA',
  /** Local device storage */
  LOCAL = 'LOCAL',
  /** Account document storage */
  ACCOUNT_DOCUMENT = 'ACCOUNT_DOCUMENT',
  /** Device photo library */
  PHOTO_LIBRARY = 'PHOTO_LIBRARY',
  /** Other / unrecognized location */
  OTHER = 'OTHER',
}

/**
 * Checks whether saving organizational data to the specified location
 * is allowed by the current Intune MAM policy.
 *
 * This API is intended for app UX decisions only.
 * Native enforcement MUST be performed by HubSDK / host.
 *
 * @param saveLocation - The target save location to check against policy.
 * @returns true if saving to the location is allowed, false otherwise.
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @beta
 */
export async function isSaveToLocationAllowed(saveLocation: SaveLocation): Promise<boolean> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return sendAndHandleSdkError(
    getApiVersionTag(intuneTelemetryVersionNumber, ApiName.Intune_IsSaveToLocationAllowed),
    'intune.isSaveToLocationAllowed',
    saveLocation,
  );
}

/**
 * Checks whether opening/importing data from the specified location
 * is allowed by the current Intune MAM policy.
 *
 * This API is intended for app UX decisions only.
 * Native enforcement MUST be performed by HubSDK / host.
 *
 * @param openLocation - The source location to check against policy.
 * @returns true if opening from the location is allowed, false otherwise.
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @beta
 */
export async function isOpenFromLocationAllowed(openLocation: OpenLocation): Promise<boolean> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return sendAndHandleSdkError(
    getApiVersionTag(intuneTelemetryVersionNumber, ApiName.Intune_IsOpenFromLocationAllowed),
    'intune.isOpenFromLocationAllowed',
    openLocation,
  );
}

/**
 * Checks if the Intune MAM capability is supported by the host.
 * @returns boolean to represent whether the Intune capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @beta
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.intune ? true : false;
}
