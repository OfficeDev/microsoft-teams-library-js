import { GlobalVars } from '../internal/globalVars';
import * as Handlers from '../internal/handlers'; // Conflict with some names
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { isNullOrUndefined } from '../internal/typeCheckUtilities';
import { ssrSafeWindow } from '../internal/utils';
import { errorNotSupportedOnPlatform } from './constants';
import { LoadContext } from './interfaces';
import { runtime } from './runtime';

/**
 * Module containing the set of APIs that support Teams-specific functionalities.
 *
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 * @module
 */
const teamsAPIsTelemetryVersionNumber_v2: ApiVersionNumber = ApiVersionNumber.V_2;

/** Ready to unload function type */
export type readyToUnloadFunctionType = () => void;
/** Register on load handler function type */
export type registerOnLoadHandlerFunctionType = (context: LoadContext) => void;
/** Register before unload handler function type */
export type registerBeforeUnloadHandlerFunctionType = (readyToUnload: readyToUnloadFunctionType) => boolean;
/**
 * Enable print capability to support printing page using Ctrl+P and cmd+P
 */
export function enablePrintCapability(): void {
  if (!GlobalVars.printCapabilityEnabled) {
    ensureInitialized(runtime);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    GlobalVars.printCapabilityEnabled = true;
    // adding ctrl+P and cmd+P handler
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.keyCode === 80) {
        print();
        event.cancelBubble = true;
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    });
  }
}

/**
 * default print handler
 */
export function print(): void {
  ssrSafeWindow().print();
}

/**
 * Registers a handler to be called when the page has been requested to load.
 *
 * @remarks Check out [App Caching in Teams](https://learn.microsoft.com/microsoftteams/platform/tabs/how-to/app-caching)
 * for a more detailed explanation about using this API.
 *
 * @param handler - The handler to invoke when the page is loaded.
 *
 * @beta
 */
export function registerOnLoadHandler(handler: registerOnLoadHandlerFunctionType): void {
  registerOnLoadHandlerHelper(
    getApiVersionTag(teamsAPIsTelemetryVersionNumber_v2, ApiName.TeamsAPIs_RegisterOnLoadHandler),
    handler,
    () => {
      if (!isNullOrUndefined(handler) && !isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
    },
  );
}

/**
 * @hidden
 * Undocumented helper function with shared code between deprecated version and current version of the registerOnLoadHandler API.
 *
 * @internal
 * Limited to Microsoft-internal use
 *
 * @param apiVersionTag - The tag indicating API version number with name
 * @param handler - The handler to invoke when the page is loaded.
 * @param versionSpecificHelper - The helper function containing logic pertaining to a specific version of the API.
 *
 * @deprecated
 */
export function registerOnLoadHandlerHelper(
  apiVersionTag: string,
  handler: registerOnLoadHandlerFunctionType,
  versionSpecificHelper?: () => void,
): void {
  // allow for registration cleanup even when not finished initializing
  !isNullOrUndefined(handler) && ensureInitialized(runtime);

  if (!isNullOrUndefined(handler) && versionSpecificHelper) {
    versionSpecificHelper();
  }

  Handlers.registerOnLoadHandler(apiVersionTag, handler);
}

/**
 * Registers a handler to be called before the page is unloaded.
 *
 * @remarks Check out [App Caching in Teams](https://learn.microsoft.com/microsoftteams/platform/tabs/how-to/app-caching)
 * for a more detailed explanation about using this API.
 *
 * @param handler - The handler to invoke before the page is unloaded. If this handler returns true the page should
 * invoke the readyToUnload function provided to it once it's ready to be unloaded.
 *
 * @beta
 */
export function registerBeforeUnloadHandler(handler: registerBeforeUnloadHandlerFunctionType): void {
  registerBeforeUnloadHandlerHelper(
    getApiVersionTag(teamsAPIsTelemetryVersionNumber_v2, ApiName.TeamsAPIs_RegisterBeforeUnloadHandler),
    handler,
    () => {
      if (!isNullOrUndefined(handler) && !isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
    },
  );
}

/**
 * @hidden
 * Undocumented helper function with shared code between deprecated version and current version of the registerBeforeUnloadHandler API.
 *
 * @internal
 * Limited to Microsoft-internal use
 *
 * @param handler - - The handler to invoke before the page is unloaded. If this handler returns true the page should
 * invoke the readyToUnload function provided to it once it's ready to be unloaded.
 * @param versionSpecificHelper - The helper function containing logic pertaining to a specific version of the API.
 *
 * @deprecated
 */
export function registerBeforeUnloadHandlerHelper(
  apiVersionTag: string,
  handler: registerBeforeUnloadHandlerFunctionType,
  versionSpecificHelper?: () => void,
): void {
  // allow for registration cleanup even when not finished initializing
  !isNullOrUndefined(handler) && ensureInitialized(runtime);
  if (!isNullOrUndefined(handler) && versionSpecificHelper) {
    versionSpecificHelper();
  }
  Handlers.registerBeforeUnloadHandler(apiVersionTag, handler);
}

/**
 * Checks if teamsCore capability is supported by the host
 *
 * @returns boolean to represent whether the teamsCore capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.teamsCore ? true : false;
}
