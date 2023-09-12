/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as uuid from 'uuid';

import { GlobalVars } from '../internal/globalVars';
import { minAdaptiveCardVersion } from '../public/constants';
import { AdaptiveCardVersion, SdkError } from '../public/interfaces';
import { pages } from '../public/pages';
import { validOrigins } from './constants';
import { getLogger } from './telemetry';

/**
 * @param pattern - reference pattern
 * @param host - candidate string
 * @returns returns true if host matches pre-know valid pattern
 *
 * @example
 *    validateHostAgainstPattern('*.teams.microsoft.com', 'subdomain.teams.microsoft.com') returns true
 *    validateHostAgainstPattern('teams.microsoft.com', 'team.microsoft.com') returns false
 *
 * @internal
 * Limited to Microsoft-internal use
 */
function validateHostAgainstPattern(pattern: string, host: string): boolean {
  if (pattern.substring(0, 2) === '*.') {
    const suffix = pattern.substring(1);
    if (
      host.length > suffix.length &&
      host.split('.').length === suffix.split('.').length &&
      host.substring(host.length - suffix.length) === suffix
    ) {
      return true;
    }
  } else if (pattern === host) {
    return true;
  }
  return false;
}

const validateOriginLogger = getLogger('validateOrigin');

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function validateOrigin(messageOrigin: URL): boolean {
  // Check whether the url is in the pre-known allowlist or supplied by user
  if (!isValidHttpsURL(messageOrigin)) {
    validateOriginLogger(
      'Origin %s is invalid because it is not using https protocol. Protocol being used: %s',
      messageOrigin,
      messageOrigin.protocol,
    );
    return false;
  }
  const messageOriginHost = messageOrigin.host;

  if (validOrigins.some((pattern) => validateHostAgainstPattern(pattern, messageOriginHost))) {
    return true;
  }

  for (const domainOrPattern of GlobalVars.additionalValidOrigins) {
    const pattern = domainOrPattern.substring(0, 8) === 'https://' ? domainOrPattern.substring(8) : domainOrPattern;
    if (validateHostAgainstPattern(pattern, messageOriginHost)) {
      return true;
    }
  }

  validateOriginLogger(
    'Origin %s is invalid because it is not an origin approved by this library or included in the call to app.initialize.\nOrigins approved by this library: %o\nOrigins included in app.initialize: %o',
    messageOrigin,
    validOrigins,
    GlobalVars.additionalValidOrigins,
  );
  return false;
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function getGenericOnCompleteHandler(errorMessage?: string): (success: boolean, reason?: string) => void {
  return (success: boolean, reason: string): void => {
    if (!success) {
      throw new Error(errorMessage ? errorMessage : reason);
    }
  };
}

/**
 * @hidden
 * Compares SDK versions.
 *
 * @param v1 - first version
 * @param v2 - second version
 * @returns NaN in case inputs are not in right format
 *         -1 if v1 < v2
 *          1 if v1 > v2
 *          0 otherwise
 * @example
 *    compareSDKVersions('1.2', '1.2.0') returns 0
 *    compareSDKVersions('1.2a', '1.2b') returns NaN
 *    compareSDKVersions('1.2', '1.3') returns -1
 *    compareSDKVersions('2.0', '1.3.2') returns 1
 *    compareSDKVersions('2.0', 2.0) returns NaN
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function compareSDKVersions(v1: string, v2: string): number {
  if (typeof v1 !== 'string' || typeof v2 !== 'string') {
    return NaN;
  }

  const v1parts = v1.split('.');
  const v2parts = v2.split('.');

  function isValidPart(x: string): boolean {
    // input has to have one or more digits
    // For ex - returns true for '11', false for '1a1', false for 'a', false for '2b'
    return /^\d+$/.test(x);
  }

  if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
    return NaN;
  }

  // Make length of both parts equal
  while (v1parts.length < v2parts.length) {
    v1parts.push('0');
  }
  while (v2parts.length < v1parts.length) {
    v2parts.push('0');
  }

  for (let i = 0; i < v1parts.length; ++i) {
    if (Number(v1parts[i]) == Number(v2parts[i])) {
      continue;
    } else if (Number(v1parts[i]) > Number(v2parts[i])) {
      return 1;
    } else {
      return -1;
    }
  }
  return 0;
}

/**
 * @hidden
 * Generates a GUID
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function generateGUID(): string {
  return uuid.v4();
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function deepFreeze<T extends object>(obj: T): T {
  Object.keys(obj).forEach((prop) => {
    if (typeof obj[prop] === 'object') {
      deepFreeze(obj[prop]);
    }
  });
  return Object.freeze(obj);
}

/**
 * @hidden
 * The following type definitions will be used in the
 * utility functions below, which help in transforming the
 * promises to support callbacks for backward compatibility
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export type ErrorResultCallback<T> = (err?: SdkError, result?: T) => void;
export type ErrorResultNullCallback<T> = (err: SdkError | null, result: T | null) => void;
export type ErrorBooleanResultCallback = (err?: SdkError, result?: boolean) => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InputFunction<T> = (...args: any[]) => Promise<T>;
export type ResultCallback<T> = (result?: T) => void;
export type SdkErrorCallback = ResultCallback<SdkError | null>;

/**
 * This utility function is used when the result of the promise is same as the result in the callback.
 * @param funcHelper
 * @param callback
 * @param args
 * @returns
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function callCallbackWithErrorOrResultFromPromiseAndReturnPromise<T>(
  funcHelper: InputFunction<T>,
  callback?: ErrorResultCallback<T>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
): Promise<T> {
  const p = funcHelper(...args);
  p.then((result: T) => {
    if (callback) {
      callback(undefined, result);
    }
  }).catch((e: SdkError) => {
    if (callback) {
      callback(e);
    }
  });
  return p;
}

/**
 * This utility function is used when the return type of the promise is usually void and
 * the result in the callback is a boolean type (true for success and false for error)
 * @param funcHelper
 * @param callback
 * @param args
 * @returns
 * @internal
 * Limited to Microsoft-internal use
 */
export function callCallbackWithErrorOrBooleanFromPromiseAndReturnPromise<T>(
  funcHelper: InputFunction<T>,
  callback?: ErrorBooleanResultCallback,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
): Promise<T> {
  const p = funcHelper(...args);
  p.then(() => {
    if (callback) {
      callback(undefined, true);
    }
  }).catch((e: SdkError) => {
    if (callback) {
      callback(e, false);
    }
  });
  return p;
}

/**
 * This utility function is called when the callback has only Error/SdkError as the primary argument.
 * @param funcHelper
 * @param callback
 * @param args
 * @returns
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function callCallbackWithSdkErrorFromPromiseAndReturnPromise<T>(
  funcHelper: InputFunction<T>,
  callback?: SdkErrorCallback,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
): Promise<T> {
  const p = funcHelper(...args);
  p.then(() => {
    if (callback) {
      callback(null);
    }
  }).catch((e: SdkError) => {
    if (callback) {
      callback(e);
    }
  });
  return p;
}

/**
 * This utility function is used when the result of the promise is same as the result in the callback.
 * @param funcHelper
 * @param callback
 * @param args
 * @returns
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise<T>(
  funcHelper: InputFunction<T>,
  callback?: ErrorResultNullCallback<T>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
): Promise<T> {
  const p = funcHelper(...args);
  p.then((result: T) => {
    if (callback) {
      callback(null, result);
    }
  }).catch((e: SdkError) => {
    if (callback) {
      callback(e, null);
    }
  });
  return p;
}

/**
 * A helper function to add a timeout to an asynchronous operation.
 *
 * @param action Action to wrap the timeout around
 * @param timeoutInMs Timeout period in milliseconds
 * @param timeoutError Error to reject the promise with if timeout elapses before the action completed
 * @returns A promise which resolves to the result of provided action or rejects with a provided timeout error
 * if the initial action didn't complete within provided timeout.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function runWithTimeout<TResult, TError>(
  action: () => Promise<TResult>,
  timeoutInMs: number,
  timeoutError: TError,
): Promise<TResult> {
  return new Promise((resolve, reject) => {
    const timeoutHandle = setTimeout(reject, timeoutInMs, timeoutError);
    action()
      .then((result) => {
        clearTimeout(timeoutHandle);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutHandle);
        reject(error);
      });
  });
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function createTeamsAppLink(params: pages.NavigateToAppParams): string {
  const url = new URL(
    'https://teams.microsoft.com/l/entity/' +
      encodeURIComponent(params.appId) +
      '/' +
      encodeURIComponent(params.pageId),
  );

  if (params.webUrl) {
    url.searchParams.append('webUrl', params.webUrl);
  }
  if (params.channelId || params.subPageId) {
    url.searchParams.append('context', JSON.stringify({ channelId: params.channelId, subEntityId: params.subPageId }));
  }
  return url.toString();
}

/**
 * @hidden
 * Checks if the Adaptive Card schema version is supported by the host.
 * @param hostAdaptiveCardSchemaVersion Host's supported Adaptive Card version in the runtime.
 *
 * @returns true if the Adaptive Card Version is not supported and false if it is supported.
 */
export function isHostAdaptiveCardSchemaVersionUnsupported(
  hostAdaptiveCardSchemaVersion: AdaptiveCardVersion,
): boolean {
  const versionCheck = compareSDKVersions(
    `${hostAdaptiveCardSchemaVersion.majorVersion}.${hostAdaptiveCardSchemaVersion.minorVersion}`,
    `${minAdaptiveCardVersion.majorVersion}.${minAdaptiveCardVersion.minorVersion}`,
  );
  if (versionCheck >= 0) {
    return false;
  } else {
    return true;
  }
}

/**
 * @hidden
 * Checks if a URL is a HTTPS protocol based URL.
 * @param url URL to be validated.
 *
 * @returns true if the URL is an https URL.
 */
export function isValidHttpsURL(url: URL): boolean {
  return url.protocol === 'https:';
}

/**
 * Convert base64 string to blob
 * @param base64Data string respresenting the content
 * @param contentType Mimetype
 * @returns Promise
 */
export function base64ToBlob(mimeType: string, base64String: string): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    if (!mimeType) {
      reject('MimeType cannot be null or empty.');
    }
    if (!base64String) {
      reject('Base64 string cannot be null or empty.');
    }
    const byteCharacters = atob(base64String);
    /**
     * For images we need to convert binary data to image to achieve that:
     *   1. A new Uint8Array is created with a length equal to the length of byteCharacters.
     *      The byteCharacters is a string representing the base64 data decoded using atob.
     *   2. Then loop iterates over each character in the byteCharacters string and assigns the
     *      corresponding character code to the corresponding index in the byteArray. The purpose
     *      of this loop is to convert the base64 string to a binary representation, as the Blob
     *      constructor expects binary data.
     */
    if (mimeType.startsWith('image/')) {
      const byteArray = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }
      resolve(new Blob([byteArray], { type: mimeType }));
    }
    resolve(new Blob([byteCharacters], { type: mimeType }));
  });
}

/**
 * Converts blob to base64 string.
 * @param blob Blob to convert to base64 string.
 */
export function getBase64StringFromBlob(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (blob.size === 0) {
      reject(new Error('Blob cannot be empty.'));
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        resolve(reader.result.toString().split(',')[1]);
      } else {
        reject(new Error('Failed to read the blob'));
      }
    };
    reader.onerror = () => {
      reject(reader.error);
    };
    reader.readAsDataURL(blob);
  });
}

/**
 *  Returns an SSR safe reference to the window object
 * @returns Window object reference
 */

export function ssrSafeWindow(): Window {
  if (!inServerSideRenderingEnvironment()) {
    return window;
  } else {
    // This should NEVER actually be written.
    // If you EVER see this error in ANY log file, something has gone horribly wrong and a bug needs to be filed.
    throw new Error('window object undefined at SSR check');
  }
}

/**
 * Checks if running in a Server Side Environment
 * @returns True if running in a Server Side Environment
 */
export function inServerSideRenderingEnvironment(): boolean {
  return typeof window === 'undefined';
}
