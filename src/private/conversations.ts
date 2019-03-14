import { ensureInitialized, sendMessageRequest } from "../internal/internalAPIs";
import { GlobalVars } from "../internal/globalVars";
import { frameContexts } from "../internal/constants";
import { StartConversationRequest, ShowConversationRequest } from "../public/interfaces";

/**
 * Namespace to interact with the conversational subEntities inside the tab
 */
export namespace conversations {

  /**
  * @private
  * Hide from docs
  * --------------
  * Allows the user to start a conversation with each subentity inside a tab
  * @param startConversationRequest Callback containing the conversation Id and if the tab pane was closed
  */
  export function startConversation(
    startConversationRequest: StartConversationRequest
  ): void {
    ensureInitialized(frameContexts.content);
    const messageId = sendMessageRequest(GlobalVars.parentWindow, "startConversation", [
      startConversationRequest.subEntityId,
      startConversationRequest.title
    ]);
    GlobalVars.callbacks[messageId] = (conversationId?: string, reason?: string) => {
      if (conversationId) {
        startConversationRequest.onStartConversation(conversationId);
      } else {
        startConversationRequest.onCloseConversation(reason);
      }
    };
  }

  /**
  * @private
  * Hide from docs
  * --------------
  * Allows the user to show the conversation in the right pane
  * @param showConversationRequest Callback containing if the tab pane was closed
  */
  export function showConversation(
    showConversationRequest: ShowConversationRequest
  ): void {
    ensureInitialized(frameContexts.content);
    const messageId = sendMessageRequest(GlobalVars.parentWindow, "showConversation", [
      showConversationRequest.subEntityId,
      showConversationRequest.title,
      showConversationRequest.conversationId
    ]);
    GlobalVars.callbacks[messageId] = (reason?: string) => {
      showConversationRequest.onCloseConversation(reason);
    };
  }

  /**
  * @private
  * Hide from docs
  * --------------
  * Allows the user to close the conversation in the right pane
  */
  export function closeConversation(): void {
    ensureInitialized(frameContexts.content);
    sendMessageRequest(GlobalVars.parentWindow, "closeConversation");
  }
}
