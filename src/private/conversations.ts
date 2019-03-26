import { ensureInitialized, sendMessageRequest } from "../internal/internalAPIs";
import { GlobalVars } from "../internal/globalVars";
import { frameContexts } from "../internal/constants";
import { OpenConversationRequest } from "../public/interfaces";

/**
 * Namespace to interact with the conversational subEntities inside the tab
 */
export namespace conversations {

  /**
  * @private
  * Hide from docs
  * --------------
  * Allows the user to start or continue a conversation with each subentity inside a tab
  */
  export function openConversation(
    openConversationRequest: OpenConversationRequest
  ): void {
    ensureInitialized(frameContexts.content);
    const messageId = sendMessageRequest(GlobalVars.parentWindow, "conversations.openConversation", [{
      title: openConversationRequest.title,
      subEntityId: openConversationRequest.subEntityId,
      conversationId: openConversationRequest.conversationId
    }]);
    GlobalVars.getConversationIdHandler = openConversationRequest.onCloseConversation;
    GlobalVars.callbacks[messageId] = (conversationId?: string) => {
      openConversationRequest.onStartConversation(conversationId);
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
    sendMessageRequest(GlobalVars.parentWindow, "conversations.closeConversation");
  }
}
