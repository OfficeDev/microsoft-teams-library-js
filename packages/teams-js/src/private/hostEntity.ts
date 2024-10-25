import { callFunctionInHostAndHandleResponse } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ResponseHandler, SimpleTypeResponseHandler } from '../internal/responseHandler';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { ErrorCode } from '../public';
import { TabInstance } from '../public/interfaces';
import { runtime } from '../public/runtime';
import { ISerializable } from '../public/serializable.interface';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const hostEntityTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * @hidden
 * @internal
 * @beta
 * Limited to Microsoft-internal use
 *
 * This capability allows an app to associate apps with a host entity, such as a Teams channel or chat, and configure them as needed.
 */
export namespace hostEntity {
  export enum AppTypes {
    edu = 'EDU',
  }

  /**
   * Id of the teams entity like channel, chat
   */
  interface TeamsEntityId {
    threadId: string;
  }

  /**
   * Id of message in which channel meeting is created
   */
  export interface TeamsChannelMeetingEntityIds extends TeamsEntityId {
    parentMessageId: string;
  }

  /**
   * Id of the host entity
   */
  export type HostEntityIds = TeamsEntityId | TeamsChannelMeetingEntityIds;

  class SerializableHostEntityId implements ISerializable {
    public constructor(private hostEntityId: HostEntityIds) {}
    public serialize(): object {
      return this.hostEntityId;
    }
  }

  /**
   * @hidden
   * @internal
   * @beta
   * Limited to Microsoft-internal use
   *
   * CRUD operations for tabs associated with apps
   */
  export namespace tab {
    /**
     * Represents information about a static tab instance
     */
    export interface StaticTabInstance extends TabInstance {
      tabType: 'StaticTab';
    }

    /**
     * Represents information about a configurable tab instance
     */
    export interface ConfigurableTabInstance extends TabInstance {
      tabType: 'ConfigurableTab';
    }

    class ConfigurableTabInstanceResponseHandler extends ResponseHandler<
      ConfigurableTabInstance,
      ConfigurableTabInstance
    > {
      public validate(response: ConfigurableTabInstance): boolean {
        return response.tabType === 'ConfigurableTab';
      }

      public deserialize(response: ConfigurableTabInstance): ConfigurableTabInstance {
        return response;
      }
    }

    class SerializableConfigurableTabInstance implements ISerializable {
      public constructor(private configurableTabInstance: ConfigurableTabInstance) {}
      public serialize(): object {
        return this.configurableTabInstance;
      }
    }

    /**
     * Represents information about a tab instance associated with a host entity like chat, channel or meeting. Cab be a configurable tab or static tab.
     */
    export type HostEntityTabInstance = StaticTabInstance | ConfigurableTabInstance;

    class HostEntityTabInstanceResponseHandler extends ResponseHandler<HostEntityTabInstance, HostEntityTabInstance> {
      public validate(response: HostEntityTabInstance): boolean {
        return response.tabType === 'ConfigurableTab' || response.tabType === 'StaticTab';
      }
      public deserialize(response: HostEntityTabInstance): HostEntityTabInstance {
        return response;
      }
    }

    class SerializableHostEntityTabInstance implements ISerializable {
      public constructor(private hostEntityTabInstance: HostEntityTabInstance) {}
      public serialize(): object {
        return this.hostEntityTabInstance;
      }
    }

    /**
     * Represents all tabs associated with a host entity like chat, channel or meeting
     */
    export interface HostEntityTabInstances {
      allTabs: HostEntityTabInstance[];
    }

    class HostEntityTabInstancesResponseHandler extends ResponseHandler<
      HostEntityTabInstances,
      HostEntityTabInstances
    > {
      public validate(response: HostEntityTabInstances): boolean {
        const instanceValidator = new HostEntityTabInstanceResponseHandler();
        let isValid: boolean = true;
        if (response.allTabs) {
          response.allTabs.forEach((tab) => {
            isValid ||= instanceValidator.validate(tab);
          });
        }
        return isValid;
      }

      public deserialize(response: HostEntityTabInstances): HostEntityTabInstances {
        return response;
      }
    }

    /**
     * @hidden
     * @internal
     * @beta
     * Limited to Microsoft-internal use
     *
     * Launches host-owned UI that lets a user select an app, installs it if required,
     * runs through app configuration if required, and then associates the app with the threadId provided
     *
     * @param hostEntityIds Ids of the host entity like channel, chat or meeting
     *
     * @param appTypes What type of applications to show the user. If EDU is passed as appType, only apps supported by EDU tenant are shown.
     * If no value is passed, all apps are shown.
     *
     * @returns The HostEntityTabInstance of the newly associated app
     *
     * @throws Error if host does not support this capability, library as not been initialized successfully, input parameters are invalid, user cancels operation or installing
     * or configuring or adding tab fails
     */
    export function addAndConfigure(
      hostEntityIds: HostEntityIds,
      appTypes?: AppTypes[],
    ): Promise<HostEntityTabInstance> {
      ensureInitialized(runtime);

      if (!isSupported()) {
        throw new Error(`Error code: ${ErrorCode.NOT_SUPPORTED_ON_PLATFORM}, message: Not supported on platform`);
      }

      validateThreadId(hostEntityIds.threadId);

      if (appTypes && appTypes.length === 0) {
        throw new Error(`Error code: ${ErrorCode.INVALID_ARGUMENTS}, message: App types cannot be an empty array`);
      }

      return callFunctionInHostAndHandleResponse<HostEntityTabInstance, HostEntityTabInstance>(
        'hostEntity.tab.addAndConfigure',
        [new SerializableHostEntityId(hostEntityIds), appTypes],
        new HostEntityTabInstanceResponseHandler(),
        getApiVersionTag(hostEntityTelemetryVersionNumber, ApiName.HostEntity_Tab_addAndConfigureApp),
      );
    }

    /**
     * @hidden
     * @internal
     * @beta
     * Limited to Microsoft-internal use
     *
     * Returns all tab instances associated with a host entity
     *
     * @param hostEntityIds Ids of the host entity like channel, chat or meeting
     *
     * @returns Object with array of HostEntityTabInstance's associated with a host entity
     *
     * @throws Error if host does not support this capability, library as not been initialized successfully, input parameters are invalid or fetching tabs fails
     */
    export function getAll(hostEntityIds: HostEntityIds): Promise<HostEntityTabInstances> {
      ensureInitialized(runtime);

      if (!isSupported()) {
        throw new Error(`Error code: ${ErrorCode.NOT_SUPPORTED_ON_PLATFORM}, message: Not supported on platform`);
      }

      validateThreadId(hostEntityIds.threadId);

      return callFunctionInHostAndHandleResponse<HostEntityTabInstances, HostEntityTabInstances>(
        'hostEntity.tab.getAll',
        [new SerializableHostEntityId(hostEntityIds)],
        new HostEntityTabInstancesResponseHandler(),
        getApiVersionTag(hostEntityTelemetryVersionNumber, ApiName.HostEntity_Tab_getAll),
      );
    }

    /**
     * @hidden
     * @internal
     * @beta
     * Limited to Microsoft-internal use
     *
     * Launches host-owned UI that lets a user re-configure the contentUrl of the tab
     *
     * @param tab Configurable tab instance that needs to be updated
     *
     * @param hostEntityIds Ids of the host entity like channel, chat or meeting
     *
     * @returns The HostEntityTabInstance of the updated tab
     *
     * @throws Error if host does not support this capability, library as not been initialized successfully, input parameters are invalid, user cancels operation,
     * re-configuring tab fails or if tab is a static tab
     */
    export function reconfigure(
      tab: ConfigurableTabInstance,
      hostEntityIds: HostEntityIds,
    ): Promise<ConfigurableTabInstance> {
      ensureInitialized(runtime);

      if (!isSupported()) {
        throw new Error(`Error code: ${ErrorCode.NOT_SUPPORTED_ON_PLATFORM}, message: Not supported on platform`);
      }

      validateTab(tab);
      validateThreadId(hostEntityIds.threadId);

      return callFunctionInHostAndHandleResponse<ConfigurableTabInstance, ConfigurableTabInstance>(
        'hostEntity.tab.reconfigure',
        [new SerializableConfigurableTabInstance(tab), new SerializableHostEntityId(hostEntityIds)],
        new ConfigurableTabInstanceResponseHandler(),
        getApiVersionTag(hostEntityTelemetryVersionNumber, ApiName.HostEntity_Tab_reconfigure),
      );
    }

    /**
     * @hidden
     * @internal
     * @beta
     * Limited to Microsoft-internal use
     *
     * Launches host-owned UI that lets a user rename the tab
     *
     * @param tab Configurable tab instance that needs to be updated
     *
     * @param hostEntityIds Ids of the host entity like channel, chat or meeting
     *
     * @returns The HostEntityTabInstance of the updated tab
     *
     * @throws Error if host does not support this capability, library as not been initialized successfully, input parameters are invalid, user cancels operation,
     * re-naming tab fails or if tab is a static tab
     */
    export function rename(
      tab: ConfigurableTabInstance,
      hostEntityIds: HostEntityIds,
    ): Promise<ConfigurableTabInstance> {
      ensureInitialized(runtime);

      if (!isSupported()) {
        throw new Error(`Error code: ${ErrorCode.NOT_SUPPORTED_ON_PLATFORM}, message: Not supported on platform`);
      }

      validateTab(tab);
      validateThreadId(hostEntityIds.threadId);

      return callFunctionInHostAndHandleResponse<ConfigurableTabInstance, ConfigurableTabInstance>(
        'hostEntity.tab.rename',
        [new SerializableConfigurableTabInstance(tab), new SerializableHostEntityId(hostEntityIds)],
        new ConfigurableTabInstanceResponseHandler(),
        getApiVersionTag(hostEntityTelemetryVersionNumber, ApiName.HostEntity_Tab_rename),
      );
    }

    /**
     * @hidden
     * @internal
     * @beta
     * Limited to Microsoft-internal use
     *
     * Launches host-owned UI that lets a user remove the tab
     *
     * @param tab tab instance that needs to be updated. Can be static tab or configurable tab.
     *
     * @param hostEntityIds Ids of the host entity like channel, chat or meeting
     *
     * @returns Boolean. Returns true if removing tab was successful
     *
     * @throws Error if host does not support this capability, library as not been initialized successfully, input parameters are invalid, user cancels operation or
     * removing tab fails
     */
    export function remove(tab: HostEntityTabInstance, hostEntityIds: HostEntityIds): Promise<boolean> {
      ensureInitialized(runtime);

      if (!isSupported()) {
        throw new Error(`Error code: ${ErrorCode.NOT_SUPPORTED_ON_PLATFORM}, message: Not supported on platform`);
      }

      validateThreadId(hostEntityIds.threadId);
      validateTab(tab);

      return callFunctionInHostAndHandleResponse<boolean, boolean>(
        'hostEntity.tab.remove',
        [new SerializableHostEntityTabInstance(tab), new SerializableHostEntityId(hostEntityIds)],
        new SimpleTypeResponseHandler(),
        getApiVersionTag(hostEntityTelemetryVersionNumber, ApiName.HostEntity_Tab_remove),
      );
    }

    /**
     * @hidden
     * @internal
     * @beta
     * Limited to Microsoft-internal use
     *
     * Checks if the hostEntity.tab capability is supported by the host
     * @returns boolean to represent whether the histEntity and hostEntity.tab capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     */
    export function isSupported(): boolean {
      return ensureInitialized(runtime) && hostEntity.isSupported() && runtime.supports.hostEntity?.tab ? true : false;
    }

    /**
     * @hidden
     * @internal
     * @beta
     * Limited to Microsoft-internal use
     *
     * Checks if the threadId is defined
     * @throws Error if threadId is null, undefined or empty
     */
    function validateThreadId(threadId: string): void {
      if (!threadId || threadId.length == 0) {
        throw new Error(`Error code: ${ErrorCode.INVALID_ARGUMENTS}, message: ThreadId cannot be null or empty`);
      }
    }

    /**
     * @hidden
     * @internal
     * @beta
     * Limited to Microsoft-internal use
     *
     * Checks if the tabId is defined
     * @throws Error if tabId is null, undefined or empty
     */
    function validateTab(tab: HostEntityTabInstance): void {
      if (!tab?.internalTabInstanceId || tab.internalTabInstanceId.length === 0) {
        throw new Error(`Error code: ${ErrorCode.INVALID_ARGUMENTS}, message: TabId cannot be null or empty`);
      }
    }
  }

  /**
   * @hidden
   * @internal
   * @beta
   * Limited to Microsoft-internal use
   *
   * Checks if the hostEntity capability is supported by the host
   * @returns boolean to represent whether the hostEntity capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.hostEntity ? true : false;
  }
}
