import { ensureInitialized } from '../internal/internalAPIs';
import { GlobalVars } from '../internal/globalVars';
import { FrameContexts } from '../public/constants';
import { OpenConversationRequest } from '../public/interfaces';
import { sendMessageToParent } from '../internal/communication';

/**
 * Namespace to interact with the conversational subEntities inside the tab
 */
export namespace conversations {
  /**
   * @private
   * Hide from docs
   * --------------
   * Allows the user to start or continue a conversation with each subentity inside the tab
   */
  export function openConversation(openConversationRequest: OpenConversationRequest): void {
    ensureInitialized(FrameContexts.content);
    sendMessageToParent(
      'conversations.openConversation',
      [
        {
          title: openConversationRequest.title,
          subEntityId: openConversationRequest.subEntityId,
          conversationId: openConversationRequest.conversationId,
          channelId: openConversationRequest.channelId,
          entityId: openConversationRequest.entityId,
        },
      ],
      (status: boolean, reason: string) => {
        if (!status) {
          throw new Error(reason);
        }
      },
    );
    GlobalVars.onCloseConversationHandler = openConversationRequest.onCloseConversation;
    GlobalVars.onStartConversationHandler = openConversationRequest.onStartConversation;
  }

  /**
   * @private
   * Hide from docs
   * --------------
   * Allows the user to close the conversation in the right pane
   */
  export function closeConversation(): void {
    ensureInitialized(FrameContexts.content);
    sendMessageToParent('conversations.closeConversation');
    GlobalVars.onCloseConversationHandler = null;
    GlobalVars.onStartConversationHandler = null;
  }
}
