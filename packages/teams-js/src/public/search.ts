import { sendMessageToParent } from '../internal/communication';
import { registerHandler, removeHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { runtime } from './runtime';

/**
 * Allows you to interact with the host search experience
 *
 * @beta
 */
export namespace search {
  const onChangeHandlerName = 'search.queryChange';
  const onClosedHandlerName = 'search.queryClose';
  const onExecutedHandlerName = 'search.queryExecute';

  /**
   * This interface contains information pertaining to the search term in the host search experience
   */
  export interface SearchQuery {
    /** The current search term in the host search experience */
    searchTerm: string;

    // TODO: may need some sort of timestamp or sequence value to
    // ensure messages are processed in correct order / combine them
    // having any sort of logic around combining messages or sorting them
    // would make sense to go into the teamsjs-sdk layer
    // timestamp: number;
  }

  export type SearchQueryHandler = (query: SearchQuery) => void;

  /**
   * Allows the caller to register for various events fired by the host search experience.
   * Calling this function will cause the host search experience to set its default scope to
   * the name of your application.
   * 
   * Your application should *not* re-render inside of these callbacks, there may be a large number
   * of onChangeHandler calls if the user is changing the searchQuery rapidly.
   *
   * @param onChangeHandler - This handler will be called when the user begins searching and every
   * time the user changes the contents of the query. The value of the query is the current term
   * the user is searching for. Should be used to put your application into whatever state is used
   * to handle searching. This handler will be called with an empty {@link SearchQuery.searchTerm}
   * when search is beginning. 
   * @param onClosedHandler - This handler will be called when the user finishes searching. Should be
   * used to return your application to its default, non-search state. The value of {@link SearchQuery.searchTerm}
   * will be whatever the last query was before ending search.
   * @param onExecuteHandler - This optional handler will be called whenever the user 'executes' the
   * search (by pressing enter for example). The value of {@link SearchQuery.searchTerm} is the current 
   * term the user is searching for. Should be used if your app wants to treat executing searches differently than responding
   * to changes to the search query.
   *
   * @example
   * ``` ts
   * search.registerHandlers(
      query => {
        console.log(`Update your application with the changed search query: ${query.searchTerm}`);
      },
      () => {
        console.log('Update your application to handle the search experience being closed');
      },
      query => {
        console.log(`Update your application to handle an executed search result: ${query.searchTerm}`);
      },
     );
   * ```
   */
  export function registerHandlers(
    onChangeHandler: SearchQueryHandler,
    onClosedHandler: SearchQueryHandler,
    onExecuteHandler?: SearchQueryHandler,
  ): void {
    // TODO: figure out what frame contexts you want to support this in
    // This is just a guess that I made and should be something you make
    // an explicit decision about.
    ensureInitialized(
      FrameContexts.content,
      FrameContexts.task,
      FrameContexts.sidePanel,
      FrameContexts.stage,
      FrameContexts.meetingStage,
    );

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    registerHandler(onChangeHandlerName, onChangeHandler);
    registerHandler(onClosedHandlerName, onClosedHandler);
    if (onExecuteHandler) {
      registerHandler(onExecutedHandlerName, onExecuteHandler);
    }
  }

  /**
   * Checks if search capability is supported by the host
   * @returns true if the search capability is enabled in runtime.supports.search and
   * false if it is disabled
   */
  export function isSupported(): boolean {
    return runtime.supports.search ? true : false;
  }
}
