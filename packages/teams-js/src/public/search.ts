import { sendMessageToParent } from '../internal/communication';
import { registerHandler, removeHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { runtime } from './runtime';

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
}
