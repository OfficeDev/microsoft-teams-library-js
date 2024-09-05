import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { getGenericOnCompleteHandler } from '../internal/utils';
import { FrameContexts } from './constants';
import { configSetConfigHelper, configSetValidityStateHelper, getConfigHelper, pages } from './pages';
import { runtime } from './runtime';

/**
 * v1 APIs telemetry file: All of APIs in this capability file should send out API version v1 ONLY
 */
const settingsTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_1;

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.config} namespace instead.
 *
 * Namespace to interact with the settings-specific part of the SDK.
 * This object is usable only on the settings frame.
 */
export namespace settings {
  /** Register on remove handler function type */
  export type registerOnRemoveHandlerFunctionType = (evt: RemoveEvent) => void;
  /** Register on save handler function type */
  export type registerOnSaveHandlerFunctionType = (evt: SaveEvent) => void;
  /** Set settings on complete function type */
  export type setSettingsOnCompleteFunctionType = (status: boolean, reason?: string) => void;
  /** Get settings callback function type */
  export type getSettingsCallbackFunctionType = (instanceSettings: Settings) => void;

  /**
   * @deprecated
   * As of TeamsJS v2.0.0, please use {@link pages.config.Config} instead.
   * @remarks
   * Renamed to config in pages.Config
   */
  export import Settings = pages.InstanceConfig;

  /**
   * @deprecated
   * As of TeamsJS v2.0.0, please use {@link pages.config.SaveEvent} instead.
   * @remarks
   * See pages.SaveEvent
   */
  export import SaveEvent = pages.config.SaveEvent;

  /**
   * @deprecated
   * As of TeamsJS v2.0.0, please use {@link pages.config.RemoveEvent} instead.
   * @remarks
   * See pages.RemoveEvent
   */
  export import RemoveEvent = pages.config.RemoveEvent;

  /**
   * @deprecated
   * As of TeamsJS v2.0.0, please use {@link pages.config.SaveParameters} instead.
   * @remarks
   * See pages.SaveParameters
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import SaveParameters = pages.config.SaveParameters;

  /**
   * @deprecated
   * As of TeamsJS v2.0.0, please use {@link pages.config.setValidityState pages.config.setValidityState(validityState: boolean): void} instead.
   *
   * Sets the validity state for the settings.
   * The initial value is false, so the user cannot save the settings until this is called with true.
   *
   * @param validityState - Indicates whether the save or remove button is enabled for the user.
   */
  export function setValidityState(validityState: boolean): void {
    configSetValidityStateHelper(
      getApiVersionTag(settingsTelemetryVersionNumber, ApiName.Settings_SetValidityState),
      validityState,
    );
  }

  /**
   * @deprecated
   * As of TeamsJS v2.0.0, please use {@link pages.getConfig pages.getConfig(): Promise\<InstanceConfig\>} instead.
   *
   * Gets the settings for the current instance.
   *
   * @param callback - The callback to invoke when the {@link Settings} object is retrieved.
   */
  export function getSettings(callback: getSettingsCallbackFunctionType): void {
    ensureInitialized(
      runtime,
      FrameContexts.content,
      FrameContexts.settings,
      FrameContexts.remove,
      FrameContexts.sidePanel,
    );
    getConfigHelper(getApiVersionTag(settingsTelemetryVersionNumber, ApiName.Settings_GetSettings)).then(
      (config: pages.InstanceConfig) => {
        callback(config);
      },
    );
  }

  /**
   * @deprecated
   * As of TeamsJS v2.0.0, please use {@link pages.config.setConfig pages.config.setConfig(instanceSettings: Config): Promise\<void\>} instead.
   *
   * Sets the settings for the current instance.
   * This is an asynchronous operation; calls to getSettings are not guaranteed to reflect the changed state.
   *
   * @param - Set the desired settings for this instance.
   */
  export function setSettings(instanceSettings: Settings, onComplete?: setSettingsOnCompleteFunctionType): void {
    ensureInitialized(runtime, FrameContexts.content, FrameContexts.settings, FrameContexts.sidePanel);
    const completionHandler: setSettingsOnCompleteFunctionType = onComplete ?? getGenericOnCompleteHandler();
    configSetConfigHelper(
      getApiVersionTag(settingsTelemetryVersionNumber, ApiName.Settings_SetSettings),
      instanceSettings,
    )
      .then(() => {
        completionHandler(true);
      })
      .catch((error: Error) => {
        completionHandler(false, error.message);
      });
  }

  /**
   * @deprecated
   * As of TeamsJS v2.0.0, please use {@link pages.config.registerOnSaveHandler pages.config.registerOnSaveHandler(handler: registerOnSaveHandlerFunctionType): void} instead.
   *
   * Registers a handler for when the user attempts to save the settings. This handler should be used
   * to create or update the underlying resource powering the content.
   * The object passed to the handler must be used to notify whether to proceed with the save.
   * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
   *
   * @param handler - The handler to invoke when the user selects the save button.
   */
  export function registerOnSaveHandler(handler: registerOnSaveHandlerFunctionType): void {
    pages.config.registerOnSaveHandlerHelper(
      getApiVersionTag(settingsTelemetryVersionNumber, ApiName.Settings_RegisterOnSaveHandler),
      handler,
    );
  }

  /**
   * @deprecated
   * As of TeamsJS v2.0.0, please use {@link pages.config.registerOnRemoveHandler pages.config.registerOnRemoveHandler(handler: registerOnRemoveHandlerFunctionType): void} instead.
   *
   * Registers a handler for user attempts to remove content. This handler should be used
   * to remove the underlying resource powering the content.
   * The object passed to the handler must be used to indicate whether to proceed with the removal.
   * Only one handler may be registered at a time. Subsequent registrations will override the first.
   *
   * @param handler - The handler to invoke when the user selects the remove button.
   */
  export function registerOnRemoveHandler(handler: registerOnRemoveHandlerFunctionType): void {
    pages.config.registerOnRemoveHandlerHelper(
      getApiVersionTag(settingsTelemetryVersionNumber, ApiName.Settings_RegisterOnRemoveHandler),
      handler,
    );
  }
}
