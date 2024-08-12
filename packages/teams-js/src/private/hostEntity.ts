import { sendMessageToParentAsync } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { ErrorCode, SdkError } from '../public';
import { TabInformation, TabInstance } from '../public/interfaces';
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

  export interface HostEntityIds {
    /**
     * Id of the host entity like channel, chat and meetings
     */
    threadId: string;

    /**
     * Id of message in which channel meeting is created
     */
    parentMessageId?: string;
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
     * @returns The TabInstance of the newly associated app
     *
     * @throws Error if host does not support this capability, library as not been initialized successfully, input parameters are invalid, user cancels operation or installing
     * or configuring or adding tab fails
     */
    export function addAndConfigure(hostEntityIds: HostEntityIds, appTypes?: AppTypes[]): Promise<TabInstance> {
      ensureInitialized(runtime);

      if (!isSupported()) {
        throw new Error(`Error code: ${ErrorCode.NOT_SUPPORTED_ON_PLATFORM}, message: Not supported on platform`);
      }

      validateThreadId(hostEntityIds.threadId);

      return sendMessageToParentAsync<[boolean, TabInstance | SdkError]>(
        getApiVersionTag(hostEntityTelemetryVersionNumber, ApiName.HostEntity_Tab_addAndConfigureApp),
        'hostEntity.tab.addAndConfigure',
        [hostEntityIds, appTypes],
      ).then(([wasSuccessful, response]: [boolean, TabInstance | SdkError]) => {
        if (!wasSuccessful) {
          const error = response as SdkError;
          throw new Error(`Error code: ${error.errorCode}, message: ${error.message ?? 'None'}`);
        }
        return response as TabInstance;
      });
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
     * @returns Object with array of TabInstance's associated with a host entity
     *
     * @throws Error if host does not support this capability, library as not been initialized successfully, input parameters are invalid or fetching tabs fails
     */
    export function getAll(hostEntityIds: HostEntityIds): Promise<TabInformation> {
      ensureInitialized(runtime);

      if (!isSupported()) {
        throw new Error(`Error code: ${ErrorCode.NOT_SUPPORTED_ON_PLATFORM}, message: Not supported on platform`);
      }

      validateThreadId(hostEntityIds?.threadId);

      return sendMessageToParentAsync<[boolean, TabInformation | SdkError]>(
        getApiVersionTag(hostEntityTelemetryVersionNumber, ApiName.HostEntity_Tab_getAll),
        'hostEntity.tab.getAll',
        [hostEntityIds],
      ).then(([wasSuccessful, response]: [boolean, TabInformation | SdkError]) => {
        if (!wasSuccessful) {
          const error = response as SdkError;
          throw new Error(`Error code: ${error.errorCode}, message: ${error.message ?? 'None'}`);
        }
        return response as TabInformation;
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
     * @param hostEntityIds Ids of the host entity like channel, chat or meeting
     *
     * @returns The TabInstance of the updated tab
     *
     * @throws Error if host does not support this capability, library as not been initialized successfully, input parameters are invalid, user cancels operation,
     * re-configuring tab fails or if tab is a static tab
     */
    export function reconfigure(tab: TabInstance, hostEntityIds: HostEntityIds): Promise<TabInstance> {
      ensureInitialized(runtime);

      if (!isSupported()) {
        throw new Error(`Error code: ${ErrorCode.NOT_SUPPORTED_ON_PLATFORM}, message: Not supported on platform`);
      }

      validateTab(tab);
      validateThreadId(hostEntityIds?.threadId);

      return sendMessageToParentAsync<[boolean, TabInstance | SdkError]>(
        getApiVersionTag(hostEntityTelemetryVersionNumber, ApiName.HostEntity_Tab_reconfigure),
        'hostEntity.tab.reconfigure',
        [tab, hostEntityIds],
      ).then(([wasSuccessful, response]: [boolean, TabInstance | SdkError]) => {
        if (!wasSuccessful) {
          const error = response as SdkError;
          throw new Error(`Error code: ${error.errorCode}, message: ${error.message ?? 'None'}`);
        }
        return response as TabInstance;
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
     * @param hostEntityIds Ids of the host entity like channel, chat or meeting
     *
     * @returns The TabInstance of the updated tab
     *
     * @throws Error if host does not support this capability, library as not been initialized successfully, input parameters are invalid, user cancels operation,
     * re-naming tab fails or if tab is a static tab
     */
    export function rename(tab: TabInstance, hostEntityIds: HostEntityIds): Promise<TabInstance> {
      ensureInitialized(runtime);

      if (!isSupported()) {
        throw new Error(`Error code: ${ErrorCode.NOT_SUPPORTED_ON_PLATFORM}, message: Not supported on platform`);
      }

      validateTab(tab);
      validateThreadId(hostEntityIds.threadId);

      return sendMessageToParentAsync<[boolean, TabInstance | SdkError]>(
        getApiVersionTag(hostEntityTelemetryVersionNumber, ApiName.HostEntity_Tab_rename),
        'hostEntity.tab.rename',
        [tab, hostEntityIds],
      ).then(([wasSuccessful, response]: [boolean, TabInstance | SdkError]) => {
        if (!wasSuccessful) {
          const error = response as SdkError;
          throw new Error(`Error code: ${error.errorCode}, message: ${error.message ?? 'None'}`);
        }
        return response as TabInstance;
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
     * @param hostEntityIds Ids of the host entity like channel, chat or meeting
     *
     * @returns Boolean. Returns true if removing tab was successful
     *
     * @throws Error if host does not support this capability, library as not been initialized successfully, input parameters are invalid, user cancels operation or
     * removing tab fails
     */
    export function remove(tabId: string, hostEntityIds: HostEntityIds): Promise<boolean> {
      ensureInitialized(runtime);

      if (!isSupported()) {
        throw new Error(`Error code: ${ErrorCode.NOT_SUPPORTED_ON_PLATFORM}, message: Not supported on platform`);
      }

      if (!tabId) {
        throw new Error(`Error code: ${ErrorCode.INVALID_ARGUMENTS}, message: TabId cannot be null or empty`);
      }

      validateThreadId(hostEntityIds?.threadId);

      return sendMessageToParentAsync<[boolean, TabInstance | SdkError]>(
        getApiVersionTag(hostEntityTelemetryVersionNumber, ApiName.HostEntity_Tab_remove),
        'hostEntity.tab.remove',
        [tabId, hostEntityIds],
      ).then(([wasSuccessful, response]: [boolean, SdkError]) => {
        if (!wasSuccessful) {
          const error = response as SdkError;
          throw new Error(`Error code: ${error.errorCode}, message: ${error.message ?? 'None'}`);
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
     * @returns boolean to represent whether the hostEntity.tab capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     */
    export function isSupported(): boolean {
      return ensureInitialized(runtime) && runtime.supports.hostEntity?.tab ? true : false;
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
    function validateTab(tab?: TabInstance): void {
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
