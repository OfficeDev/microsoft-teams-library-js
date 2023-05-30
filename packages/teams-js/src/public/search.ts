/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  Communication,
  sendAndHandleStatusAndReason as sendAndHandleError,
  sendMessageToParent,
  uninitializeCommunication,
} from '../internal/communication';
import { GlobalVars } from '../internal/globalVars';
import { registerHandler, removeHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { logs } from '../private/logs';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { pages } from './pages';
import { runtime } from './runtime';
import { teamsCore } from './teamsAPIs';
import { version } from './version';

/**
 * Allows your application to interact with the host M365 application's search box.
 * By integrating your application with the host's search box, users can search
 * your app using the same search box they use elsewhere in Teams, Outlook, or Office.
 *
 * This functionality is in Beta.
 * @beta
 */
export namespace search {
  const onChangeHandlerName = 'search.queryChange';
  const onClosedHandlerName = 'search.queryClose';
  const onExecutedHandlerName = 'search.queryExecute';

  /** Search Function Messages */
  export const Messages = {
    /** Close search is called. */
    CloseSearch: 'search.closeSearch',
  };

  /**
   * This interface contains information pertaining to the contents of the host M365 application's search box
   *
   * @beta
   */
  export interface SearchQuery {
    /** The current search term in the host search experience */
    searchTerm: string;

    /** Timestamp sequence value to ensure messages are processed in correct order / combine them. */
    timestamp: number;
  }

  /**
   * This type will store the SearchQuery and allow other logic to be made inside the handler.
   *
   * @beta
   */
  export type SearchQueryHandler = (query: SearchQuery) => void;

  /**
   * Allows the caller to register for various events fired by the host search experience.
   * Calling this function indicates that your application intends to plug into the host's search box and handle search events,
   * when the user is actively using your page/tab.
   * 
   * The host may visually update its search box, e.g. with the name or icon of your application.
   * 
   * Your application should *not* re-render inside of these callbacks, there may be a large number
   * of onChangeHandler calls if the user is typing rapidly in the search box.
   *
   * @param onClosedHandler - This handler will be called when the user exits or cancels their search.
   * Should be used to return your application to its most recent, non-search state. The value of {@link SearchQuery.searchTerm} 
   * will be whatever the last query was before ending search. 
   * 
   * @param onExecuteHandler - The handler will be called when the user executes their 
   * search (by pressing Enter for example). Should be used to display the full list of search results. 
   * The value of {@link SearchQuery.searchTerm} is the complete query the user entered in the search box.
   *
   * @param onChangeHandler - This optional handler will be called when the user first starts using the
   * host's search box and as the user types their query. Can be used to put your application into a 
   * word-wheeling state or to display suggestions as the user is typing. 
   * 
   * This handler will be called with an empty {@link SearchQuery.searchTerm} when search is beginning, and subsequently,
   * with the current contents of the search box.
   * @example
   * ``` ts
   * search.registerHandlers(
      query => {
        console.log('Update your application to handle the search experience being closed. Last query: ${query.searchTerm}');
      },
      query => {
        console.log(`Update your application to handle an executed search result: ${query.searchTerm}`);
      },
      query => {
        console.log(`Update your application with the changed search query: ${query.searchTerm}`);
      },
     );
   * ```
   *
   * @beta
   */
  export function registerHandlers(
    onClosedHandler: SearchQueryHandler,
    onExecuteHandler: SearchQueryHandler,
    onChangeHandler?: SearchQueryHandler,
  ): void {
    ensureInitialized(runtime, FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    registerHandler(onClosedHandlerName, onClosedHandler);
    registerHandler(onExecutedHandlerName, onExecuteHandler);
    if (onChangeHandler) {
      registerHandler(onChangeHandlerName, onChangeHandler);
    }
  }

  /**
   * Allows the caller to unregister for all events fired by the host search experience. Calling
   * this function will cause your app to stop appearing in the set of search scopes in the hosts
   *
   * @beta
   */
  export function unregisterHandlers(): void {
    ensureInitialized(runtime, FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    // This should let the host know to stop making the app scope show up in the search experience
    // Can also be used to clean up handlers on the host if desired
    sendMessageToParent('search.unregister');
    removeHandler(onChangeHandlerName);
    removeHandler(onClosedHandlerName);
    removeHandler(onExecutedHandlerName);
  }

  /**
   * Checks if search capability is supported by the host
   * @returns boolean to represent whether the search capability is supported
   *
   * @throws Error if {@link app.initialize} has not successfully completed
   *
   * @beta
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.search ? true : false;
  }

  /**
   * Clear the host M365 application's search box
   *
   * @beta
   */
  export function closeSearch(): Promise<void> {
    return new Promise<void>((resolve) => {
      ensureInitialized(runtime, FrameContexts.content);
      if (!isSupported()) {
        throw new Error('Not supported');
      }

      resolve(sendAndHandleError('search.closeSearch', version));
    });
  }

  /**
   * @hidden
   * Undocumented function used to set a mock window for unit tests
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function _initialize(hostWindow: any): void {
    Communication.currentWindow = hostWindow;
  }

  /**
   * @hidden
   * Undocumented function used to clear state between unit tests
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function _uninitialize(): void {
    if (!GlobalVars.initializeCalled) {
      return;
    }

    if (GlobalVars.frameContext) {
      /* eslint-disable strict-null-checks/all */
      pages.backStack.registerBackButtonHandler(null);
      pages.registerFullScreenHandler(null);
      teamsCore.registerBeforeUnloadHandler(null);
      teamsCore.registerOnLoadHandler(null);
      logs.registerGetLogHandler(null); /* Fix tracked by 5730662 */
      /* eslint-enable strict-null-checks/all */
    }

    if (GlobalVars.frameContext === FrameContexts.settings) {
      /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
      pages.config.registerOnSaveHandler(null);
    }

    if (GlobalVars.frameContext === FrameContexts.remove) {
      /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
      pages.config.registerOnRemoveHandler(null);
    }

    GlobalVars.initializeCalled = false;
    GlobalVars.initializeCompleted = false;
    GlobalVars.initializePromise = null;
    GlobalVars.additionalValidOrigins = [];
    GlobalVars.frameContext = null;
    GlobalVars.hostClientType = null;
    GlobalVars.isFramelessWindow = false;

    uninitializeCommunication();
  }
}
