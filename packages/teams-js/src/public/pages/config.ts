/**
 * Provides APIs to interact with the configuration-specific part of the SDK.
 * This object is usable only on the configuration frame.
 * @module
 */

import { sendMessageEventToChild, shouldEventBeRelayedToChild } from '../../internal/childCommunication';
import { sendMessageToParent } from '../../internal/communication';
import { registerHandler, registerHandlerHelper } from '../../internal/handlers';
import { ensureInitialized } from '../../internal/internalAPIs';
import {
  configSetConfigHelper,
  configSetValidityStateHelper,
  pagesTelemetryVersionNumber,
} from '../../internal/pagesHelpers';
import { ApiName, getApiVersionTag } from '../../internal/telemetry';
import { isNullOrUndefined } from '../../internal/typeCheckUtilities';
import { errorNotSupportedOnPlatform, FrameContexts } from '../constants';
import { runtime } from '../runtime';
import { handlerFunctionType, InstanceConfig, removeEventType, saveEventType } from './pages';

let saveHandler: undefined | ((evt: SaveEvent) => void);
let removeHandler: undefined | ((evt: RemoveEvent) => void);

/**
 * @hidden
 * Hide from docs because this function is only used during initialization
 *
 * Adds register handlers for settings.save and settings.remove upon initialization. Function is called in {@link app.initializeHelper}
 * @internal
 * Limited to Microsoft-internal use
 */
export function initialize(): void {
  registerHandler(
    getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_Config_RegisterSettingsSaveHandler),
    'settings.save',
    handleSave,
    false,
  );
  registerHandler(
    getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_Config_RegisterSettingsRemoveHandler),
    'settings.remove',
    handleRemove,
    false,
  );
}

/**
 * Sets the validity state for the configuration.
 * The initial value is false, so the user cannot save the configuration until this is called with true.
 * @param validityState - Indicates whether the save or remove button is enabled for the user.
 */
export function setValidityState(validityState: boolean): void {
  return configSetValidityStateHelper(
    getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_Config_SetValidityState),
    validityState,
  );
}

/**
 * Sets the configuration for the current instance.
 * This is an asynchronous operation; calls to getConfig are not guaranteed to reflect the changed state.
 * @param instanceConfig - The desired configuration for this instance.
 * @returns Promise that resolves when the operation has completed.
 */
export function setConfig(instanceConfig: InstanceConfig): Promise<void> {
  return configSetConfigHelper(
    getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_Config_SetConfig),
    instanceConfig,
  );
}

/**
 * Registers a handler for when the user attempts to save the configuration. This handler should be used
 * to create or update the underlying resource powering the content.
 * The object passed to the handler must be used to notify whether to proceed with the save.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 * @param handler - The handler to invoke when the user selects the Save button.
 */
export function registerOnSaveHandler(handler: saveEventType): void {
  registerOnSaveHandlerHelper(
    getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_Config_RegisterOnSaveHandler),
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
 * Undocumented helper function with shared code between deprecated version and current version of the registerOnSaveHandler API.
 *
 * @internal
 * Limited to Microsoft-internal use
 *
 * @param apiVersionTag - The API version tag, which is used for telemetry, composed by API version number and source API name.
 * @param handler - The handler to invoke when the user selects the Save button.
 * @param versionSpecificHelper - The helper function containing logic pertaining to a specific version of the API.
 */
export function registerOnSaveHandlerHelper(
  apiVersionTag: string,
  handler: (evt: SaveEvent) => void,
  versionSpecificHelper?: () => void,
): void {
  // allow for registration cleanup even when not finished initializing
  !isNullOrUndefined(handler) && ensureInitialized(runtime, FrameContexts.settings);
  if (versionSpecificHelper) {
    versionSpecificHelper();
  }
  saveHandler = handler;
  !isNullOrUndefined(handler) && sendMessageToParent(apiVersionTag, 'registerHandler', ['save']);
}

/**
 * Registers a handler for user attempts to remove content. This handler should be used
 * to remove the underlying resource powering the content.
 * The object passed to the handler must be used to indicate whether to proceed with the removal.
 * Only one handler may be registered at a time. Subsequent registrations will override the first.
 * @param handler - The handler to invoke when the user selects the Remove button.
 */
export function registerOnRemoveHandler(handler: removeEventType): void {
  registerOnRemoveHandlerHelper(
    getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_Config_RegisterOnRemoveHandler),
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
 * Undocumented helper function with shared code between deprecated version and current version of the registerOnRemoveHandler API.
 *
 * @internal
 * Limited to Microsoft-internal use
 *
 * @param apiVersionTag - The API version tag, which is used for telemetry, composed by API version number and source API name.
 * @param handler - The handler to invoke when the user selects the Remove button.
 * @param versionSpecificHelper - The helper function containing logic pertaining to a specific version of the API.
 */
export function registerOnRemoveHandlerHelper(
  apiVersionTag: string,
  handler: (evt: RemoveEvent) => void,
  versionSpecificHelper?: () => void,
): void {
  // allow for registration cleanup even when not finished initializing
  !isNullOrUndefined(handler) && ensureInitialized(runtime, FrameContexts.remove, FrameContexts.settings);
  if (versionSpecificHelper) {
    versionSpecificHelper();
  }
  removeHandler = handler;
  !isNullOrUndefined(handler) && sendMessageToParent(apiVersionTag, 'registerHandler', ['remove']);
}

function handleSave(result?: SaveParameters): void {
  const saveEventType = new SaveEventImpl(result);
  if (saveHandler) {
    saveHandler(saveEventType);
  } else if (shouldEventBeRelayedToChild()) {
    sendMessageEventToChild('settings.save', [result]);
  } else {
    // If no handler is registered, we assume success.
    saveEventType.notifySuccess();
  }
}

/**
 * Registers a handler for when the tab configuration is changed by the user
 * @param handler - The handler to invoke when the user clicks on Settings.
 */
export function registerChangeConfigHandler(handler: handlerFunctionType): void {
  registerHandlerHelper(
    getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_Config_RegisterChangeConfigHandler),
    'changeSettings',
    handler,
    [FrameContexts.content],
    () => {
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
    },
  );
}

/**
 * Describes the results of the settings.save event. Includes result, notifySuccess, and notifyFailure
 * to indicate the return object (result) and the status of whether the settings.save call succeeded or not and why.
 */
export interface SaveEvent {
  /**
   * Object containing properties passed as arguments to the settings.save event.
   */
  result: SaveParameters;
  /**
   * Indicates that the underlying resource has been created and the config can be saved.
   */
  notifySuccess(): void;
  /**
   * Indicates that creation of the underlying resource failed and that the config cannot be saved.
   * @param reason - Specifies a reason for the failure. If provided, this string is displayed to the user; otherwise a generic error is displayed.
   */
  notifyFailure(reason?: string): void;
}

/**
 * Describes the results of the settings.remove event. Includes notifySuccess, and notifyFailure
 * to indicate the status of whether the settings.save call succeeded or not and why.
 */
export interface RemoveEvent {
  /**
   * Indicates that the underlying resource has been removed and the content can be removed.
   */
  notifySuccess(): void;
  /**
   * Indicates that removal of the underlying resource failed and that the content cannot be removed.
   * @param reason - Specifies a reason for the failure. If provided, this string is displayed to the user; otherwise a generic error is displayed.
   */
  notifyFailure(reason?: string): void;
}

/**
 * Parameters used in the settings.save event
 */
export interface SaveParameters {
  /**
   * Connector's webhook Url returned as arguments to settings.save event as part of user clicking on Save
   */
  webhookUrl?: string;
}

/**
 * @hidden
 * Hide from docs, since this class is not directly used.
 */
class SaveEventImpl implements SaveEvent {
  public notified = false;
  public result: SaveParameters;
  public constructor(result?: SaveParameters) {
    this.result = result ? result : {};
  }
  public notifySuccess(): void {
    this.ensureNotNotified();
    sendMessageToParent(
      getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_SaveEvent_NotifySuccess),
      'settings.save.success',
    );
    this.notified = true;
  }
  public notifyFailure(reason?: string): void {
    this.ensureNotNotified();
    sendMessageToParent(
      getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_SaveEvent_NotifyFailure),
      'settings.save.failure',
      [reason],
    );
    this.notified = true;
  }
  private ensureNotNotified(): void {
    if (this.notified) {
      throw new Error('The SaveEvent may only notify success or failure once.');
    }
  }
}

function handleRemove(): void {
  const removeEventType = new RemoveEventImpl();
  if (removeHandler) {
    removeHandler(removeEventType);
  } else if (shouldEventBeRelayedToChild()) {
    sendMessageEventToChild('settings.remove', []);
  } else {
    // If no handler is registered, we assume success.
    removeEventType.notifySuccess();
  }
}

/**
 * @hidden
 * Hide from docs, since this class is not directly used.
 */
class RemoveEventImpl implements RemoveEvent {
  public notified = false;

  public notifySuccess(): void {
    this.ensureNotNotified();
    sendMessageToParent(
      getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_RemoveEvent_NotifySuccess),
      'settings.remove.success',
    );
    this.notified = true;
  }

  public notifyFailure(reason?: string): void {
    this.ensureNotNotified();
    sendMessageToParent(
      getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_RemoveEvent_NotifyFailure),
      'settings.remove.failure',
      [reason],
    );
    this.notified = true;
  }

  private ensureNotNotified(): void {
    if (this.notified) {
      throw new Error('The removeEventType may only notify success or failure once.');
    }
  }
}

/**
 * Checks if the pages.config capability is supported by the host
 * @returns boolean to represent whether the pages.config capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.pages ? (runtime.supports.pages.config ? true : false) : false;
}
