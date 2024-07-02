import { sendMessageToParentAsync } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ErrorCode, TabInstance } from '../public';
import { runtime } from '../public/runtime';

// Open questions
// 1. I've re-used `TabInstance` from the public API, does that contain all of the information you and app developers might need?
// 2. I didn't see any reason to add a `getTabs` function because `pages.tabs.getTabInstances`. Any reason that won't work for you?
// 3. I've added an `AppTypes[]` param to `addAndConfigureApp` to allow for the host to show different app types to the user. Very open to changes.
// 4. I've added empty, private `validate` functions for the threadId and TabInstance. Any validation that is possible will help prevent against
//    bad data being sent to the host. If you have any validation that can be done, please add it there. If you *can* use restrictive types like UUID
//    or something, that would be even better.
// 5. I've made the namespace structure an empty `associatedApps` namespace that only contains the `tab` namespace. This was an attempt to leave room for
//    expansion in the future for non-tab scenarios that will make it less likely that your callers will need to update their code. Open to opinions though.

// TODO: Add unit tests
// TODO: Add E2E tests

/**
 * @hidden
 * @internal
 * @beta
 * Limited to Microsoft-internal use
 *
 * TODO: Brief description of what this capability does
 */
export namespace associatedApps {
  export enum AppTypes {
    meeting = 'meeting',
  }

  /**
   * @hidden
   * @internal
   * @beta
   * Limited to Microsoft-internal use
   *
   * TODO: Brief description of what this capability does
   */
  export namespace tab {
    interface ErrorResponse {
      errorCode: ErrorCode;
      message?: string; // TODO: Can remove if you don't have a message to send back to the app developer
    }

    /**
     * @hidden
     * @internal
     * @beta
     * Limited to Microsoft-internal use
     *
     * TODO: Add full description of what this function does, ie "Launches host-owned UI that lets a user select an app, installs it if required,
     * runs through app configuration if required, and then associates the app with the threadId provided. If external docs exist, link to them here"
     *
     * @param threadId Info about where this comes from, links to external docs if available, etc.
     * @param appTypes what type of applications to show the user
     *
     * @returns The TabInstance of the newly associated app
     *
     * @throws TODO: Description of errors that can be thrown from this function
     */
    export function addAndConfigureApp(threadId: string, appTypes: AppTypes[]): Promise<TabInstance> {
      ensureInitialized(runtime); // TODO: add frameContext checks if this is limited to certain contexts such as content

      if (!isSupported()) {
        throw new Error(ErrorCode.NOT_SUPPORTED_ON_PLATFORM.toString());
      }

      validateThreadId(threadId);

      return sendMessageToParentAsync<[boolean, TabInstance | ErrorResponse]>(
        'apiVersionTag', // TODO: see uses of getApiVersionTag in other files to do this correctly
        'associatedApps.tab.addAndConfigureApp',
        [threadId, appTypes],
      ).then(([wasSuccessful, response]: [boolean, TabInstance | ErrorResponse]) => {
        if (!wasSuccessful) {
          // TODO: Can handle error codes differently here, for example if you don't want "user cancelled" to throw
          const error = response as ErrorResponse;
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
     * TODO: Add full description of what this function does, ie "Allows the user to go through the tab config process again for the specified app. If
     * no config process exists, X happens, etc."
     *
     * @param tab fill in details
     * @param threadId Info about where this comes from, links to external docs if available, etc.
     *
     * @returns The TabInstance of the newly configured app
     *
     * @throws TODO: Description of errors that can be thrown from this function
     */
    export function reconfigure(tab: TabInstance, threadId: string): Promise<TabInstance> {
      ensureInitialized(runtime); // TODO: add frameContext checks if this is limited to certain contexts such as content

      if (!isSupported()) {
        throw new Error(ErrorCode.NOT_SUPPORTED_ON_PLATFORM.toString());
      }

      validateTab(tab);
      validateThreadId(threadId);

      return sendMessageToParentAsync<[boolean, TabInstance | ErrorResponse]>(
        'apiVersionTag', // TODO: see uses of getApiVersionTag in other files to do this correctly
        'associatedApps.tab.reconfigure',
        [tab, threadId],
      ).then(([wasSuccessful, response]: [boolean, TabInstance | ErrorResponse]) => {
        if (!wasSuccessful) {
          // TODO: Can handle error codes differently here, for example if you don't want "user cancelled" to throw
          const error = response as ErrorResponse;
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
     * TODO: Add full description of what this function does, ie "Renames the tab associated with an app"
     *
     * @param tab fill in details
     * @param threadId Info about where this comes from, links to external docs if available, etc.
     *
     * @returns The TabInstance of the newly renamed app
     *
     * @throws TODO: Description of errors that can be thrown from this function
     */
    export function rename(tab: TabInstance, threadId: string): Promise<TabInstance> {
      ensureInitialized(runtime); // TODO: add frameContext checks if this is limited to certain contexts such as content

      if (!isSupported()) {
        throw new Error(ErrorCode.NOT_SUPPORTED_ON_PLATFORM.toString());
      }

      validateTab(tab);
      validateThreadId(threadId);

      return sendMessageToParentAsync<[boolean, TabInstance | ErrorResponse]>(
        'apiVersionTag', // TODO: see uses of getApiVersionTag in other files to do this correctly
        'associatedApps.tab.rename',
        [tab, threadId],
      ).then(([wasSuccessful, response]: [boolean, TabInstance | ErrorResponse]) => {
        if (!wasSuccessful) {
          // TODO: Can handle error codes differently here, for example if you don't want "user cancelled" to throw
          const error = response as ErrorResponse;
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
     * TODO: Add full description of what this function does, ie "Removes a tab associated with an app, must be called on an app tab, etc."
     *
     * @param tab fill in details
     * @param threadId Info about where this comes from, links to external docs if available, etc.
     *
     * @throws TODO: Description of errors that can be thrown from this function
     */
    export function remove(tab: TabInstance, threadId: string): Promise<void> {
      ensureInitialized(runtime); // TODO: add frameContext checks if this is limited to certain contexts such as content

      if (!isSupported()) {
        throw new Error(ErrorCode.NOT_SUPPORTED_ON_PLATFORM.toString());
      }

      validateTab(tab);
      validateThreadId(threadId);

      return sendMessageToParentAsync<[boolean, TabInstance | ErrorResponse]>(
        'apiVersionTag', // TODO: see uses of getApiVersionTag in other files to do this correctly
        'associatedApps.tab.remove',
        [tab, threadId],
      ).then(([wasSuccessful, response]: [boolean, TabInstance | ErrorResponse]) => {
        if (!wasSuccessful) {
          // TODO: Can handle error codes differently here, for example if you don't want "user cancelled" to throw
          const error = response as ErrorResponse;
          throw new Error(`Error code: ${error.errorCode}, message: ${error.message ?? 'None'}`);
        }
      });
    }

    /**
     * @hidden
     * @internal
     * @beta
     * Limited to Microsoft-internal use
     */
    export function isSupported(): boolean {
      throw new Error('Not implemented');
    }

    function validateThreadId(threadId: string) {
      // TODO: Any checks you can do on threadId to guarantee valid (not null, not empty, not undefined, format if possible, etc.)
      /*
      if (threadId is not valid) {
        throw new Error(`${threadId} is not a valid threadId`);
      }
      */
    }

    function validateTab(tabInstance: TabInstance) {
      // TODO: Any checks you can do on TabInstance to guarantee valid (not null, not empty, not undefined, all required properties set to legal values, etc.)
      /*
      if (tabInstance is not valid) {
        throw new Error(`TabInstance ${tabInstance.internalTabInstanceId} is not a valid, extra detail if available`);
      }
      */
    }
  }
  /**
   * @hidden
   * @internal
   * @beta
   * Limited to Microsoft-internal use
   */
  export function isSupported(): boolean {
    throw new Error('Not implemented');
  }
}
