import {
  Args,
  ResponseHandler,
  sendMessage,
  sendMessageToParentAsync,
  SerializableArg,
} from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { ErrorCode, SdkError } from '../public';
import { isSdkError, TabInstance } from '../public/interfaces';
import { runtime } from '../public/runtime';

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

    /**
     * Represents information about a tab instance associated with a host entity like chat, channel or meeting. Cab be a configurable tab or static tab.
     */
    export type HostEntityTabInstance = StaticTabInstance | ConfigurableTabInstance;

    /**
     * Represents all tabs associated with a host entity like chat, channel or meeting
     */
    export interface HostEntityTabInstances {
      allTabs: HostEntityTabInstance[];
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

      return sendMessage<HostEntityTabInstance, HostEntityTabInstance>(
        getApiVersionTag(hostEntityTelemetryVersionNumber, ApiName.HostEntity_Tab_addAndConfigureApp),
        'hostEntity.tab.addAndConfigure',
        new HostEntityTabInstanceResponseHandler(),
        new Args([new SerializableHostEntityId(hostEntityIds), appTypes]),
      );
    }

    class SerializableHostEntityId implements SerializableArg {
      public constructor(private hostEntityId: HostEntityIds) {}
      public serialize(): object {
        return this.hostEntityId;
      }
    }

    class HostEntityTabInstanceResponseHandler extends ResponseHandler<HostEntityTabInstance, HostEntityTabInstance> {
      public validate(response: HostEntityTabInstance): boolean {
        return response.tabType === 'ConfigurableTab' || response.tabType === 'StaticTab';
      }
      public deserialize(response: HostEntityTabInstance): HostEntityTabInstance {
        return response;
      }
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

      return sendMessageToParentAsync<[HostEntityTabInstances | SdkError]>(
        getApiVersionTag(hostEntityTelemetryVersionNumber, ApiName.HostEntity_Tab_getAll),
        'hostEntity.tab.getAll',
        [hostEntityIds],
      ).then(([response]: [HostEntityTabInstances | SdkError]) => {
        if (isSdkError(response)) {
          throw new Error(`Error code: ${response.errorCode}, message: ${response.message ?? 'None'}`);
        }
        return response as HostEntityTabInstances;
      });
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

      return sendMessageToParentAsync<[ConfigurableTabInstance | SdkError]>(
        getApiVersionTag(hostEntityTelemetryVersionNumber, ApiName.HostEntity_Tab_reconfigure),
        'hostEntity.tab.reconfigure',
        [tab, hostEntityIds],
      ).then(([response]: [ConfigurableTabInstance | SdkError]) => {
        if (isSdkError(response)) {
          throw new Error(`Error code: ${response.errorCode}, message: ${response.message ?? 'None'}`);
        }
        return response as ConfigurableTabInstance;
      });
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

      return sendMessageToParentAsync<[ConfigurableTabInstance | SdkError]>(
        getApiVersionTag(hostEntityTelemetryVersionNumber, ApiName.HostEntity_Tab_rename),
        'hostEntity.tab.rename',
        [tab, hostEntityIds],
      ).then(([response]: [ConfigurableTabInstance | SdkError]) => {
        if (isSdkError(response)) {
          throw new Error(`Error code: ${response.errorCode}, message: ${response.message ?? 'None'}`);
        }
        return response as ConfigurableTabInstance;
      });
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

      return sendMessageToParentAsync<[boolean | SdkError]>(
        getApiVersionTag(hostEntityTelemetryVersionNumber, ApiName.HostEntity_Tab_remove),
        'hostEntity.tab.remove',
        [tab, hostEntityIds],
      ).then(([response]: [boolean | SdkError]) => {
        if (isSdkError(response)) {
          throw new Error(`Error code: ${response.errorCode}, message: ${response.message ?? 'None'}`);
        }
        return true;
      });
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
