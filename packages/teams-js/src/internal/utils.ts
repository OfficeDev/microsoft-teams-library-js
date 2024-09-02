/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Buffer } from 'buffer';
import * as uuid from 'uuid';

import { minAdaptiveCardVersion } from '../public/constants';
import { AdaptiveCardVersion, SdkError } from '../public/interfaces';
import { pages } from '../public/pages';

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
    if (obj[prop] === null || obj[prop] === undefined) {
      return;
    }
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
export function createTeamsAppLink(params: pages.AppNavigationParameters): string {
  const url = new URL(
    'https://teams.microsoft.com/l/entity/' +
      encodeURIComponent(params.appId.toString()) +
      '/' +
      encodeURIComponent(params.pageId),
  );

  if (params.webUrl) {
    url.searchParams.append('webUrl', params.webUrl.toString());
  }
  if (params.chatId || params.channelId || params.subPageId) {
    url.searchParams.append(
      'context',
      JSON.stringify({ chatId: params.chatId, channelId: params.channelId, subEntityId: params.subPageId }),
    );
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
      const byteCharacters = atob(base64String);
      const byteArray = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }
      resolve(new Blob([byteArray], { type: mimeType }));
    }
    const byteCharacters = Buffer.from(base64String, 'base64').toString();
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

/**
 * @param id The id to validate
 * @param errorToThrow Customized error to throw if the id is not valid
 *
 * @throws Error if id is not valid
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function validateId(id: string, errorToThrow?: Error): void {
  if (hasScriptTags(id) || !isIdLengthValid(id) || !isOpaque(id)) {
    throw errorToThrow || new Error('id is not valid.');
  }
}

export function validateUrl(url: URL, errorToThrow?: Error): void {
  const urlString = url.toString().toLocaleLowerCase();
  if (hasScriptTags(urlString)) {
    throw errorToThrow || new Error('Invalid Url');
  }
  if (urlString.length > 2048) {
    throw errorToThrow || new Error('Url exceeds the maximum size of 2048 characters');
  }
  if (!isValidHttpsURL(url)) {
    throw errorToThrow || new Error('Url should be a valid https url');
  }
}

/**
 * This function takes in a string that represents a full or relative path and returns a
 * fully qualified URL object.
 *
 * Currently this is accomplished by assigning the input string to an a tag and then retrieving
 * the a tag's href value. A side effect of doing this is that the string becomes a fully qualified
 * URL. This is probably not how I would choose to do this, but in order to not unintentionally
 * break something I've preseved the functionality here and just isolated the code to make it
 * easier to mock.
 *
 * @example
 *    `fullyQualifyUrlString('https://example.com')` returns `new URL('https://example.com')`
 *    `fullyQualifyUrlString('helloWorld')` returns `new URL('https://example.com/helloWorld')`
 *    `fullyQualifyUrlString('hello%20World')` returns `new URL('https://example.com/hello%20World')`
 *
 * @param fullOrRelativePath A string representing a full or relative URL.
 * @returns A fully qualified URL representing the input string.
 */
export function fullyQualifyUrlString(fullOrRelativePath: string): URL {
  const link = document.createElement('a');
  link.href = fullOrRelativePath;
  return new URL(link.href);
}

/**
 * Detects if there are any script tags in a given string, even if they are Uri encoded or encoded as HTML entities.
 * @param input string to test for script tags
 * @returns true if the input string contains a script tag, false otherwise
 */
export function hasScriptTags(input: string): boolean {
  const openingScriptTagRegex = /<script[^>]*>|&lt;script[^&]*&gt;|%3Cscript[^%]*%3E/gi;
  const closingScriptTagRegex = /<\/script[^>]*>|&lt;\/script[^&]*&gt;|%3C\/script[^%]*%3E/gi;

  const openingOrClosingScriptTagRegex = new RegExp(
    `${openingScriptTagRegex.source}|${closingScriptTagRegex.source}`,
    'gi',
  );
  return openingOrClosingScriptTagRegex.test(input);
}

function isIdLengthValid(id: string): boolean {
  return id.length < 256 && id.length > 4;
}

function isOpaque(id: string): boolean {
  for (let i = 0; i < id.length; i++) {
    const charCode = id.charCodeAt(i);
    if (charCode < 32 || charCode > 126) {
      return false;
    }
  }
  return true;
}

/**
 * @param id The ID to validate against the UUID format
 * @throws Error if ID is not a valid UUID
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function validateUuid(id: string | undefined | null): void {
  if (!id) {
    throw new Error('id must not be empty');
  }
  if (uuid.validate(id) === false) {
    throw new Error('id must be a valid UUID');
  }
}

/**
 * Cache if performance timers are available to avoid redoing this on each function call.
 */
const supportsPerformanceTimers = 'performance' in window && 'now' in window.performance;

/**
 * @internal
 * Limited to Microsoft-internal use
 * @returns current timestamp in milliseconds
 */
export function getCurrentTimestamp(): number {
  return supportsPerformanceTimers ? window.performance.now() + window.performance.timeOrigin : new Date().getTime();
}
