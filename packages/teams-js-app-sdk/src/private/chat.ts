import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from '../public/constants';
import { OpenConversationRequest } from '../public/interfaces';
import { sendMessageToParent } from '../internal/communication';
import { registerHandler, removeHandler } from '../internal/handlers';
import { runtime } from '../public/runtime';
import { ChatMembersInformation } from './interfaces';

/**
 * Namespace to interact with the conversational subEntities inside the tab
 */
export namespace chat {
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
    if (openConversationRequest.onStartConversation) {
      registerHandler(
        'startConversation',
        (subEntityId: string, conversationId: string, channelId: string, entityId: string) =>
          openConversationRequest.onStartConversation({
            subEntityId,
            conversationId,
            channelId,
            entityId,
          }),
      );
    }
    if (openConversationRequest.onCloseConversation) {
      registerHandler(
        'closeConversation',
        (subEntityId: string, conversationId?: string, channelId?: string, entityId?: string) =>
          openConversationRequest.onCloseConversation({
            subEntityId,
            conversationId,
            channelId,
            entityId,
          }),
      );
    }
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
    removeHandler('startConversation');
    removeHandler('closeConversation');
  }

  /**
   * @private
   * Hide from docs
   * ------
   * Allows an app to retrieve information of all chat members
   * Because a malicious party run your content in a browser, this value should
   * be used only as a hint as to who the members are and never as proof of membership.
   * @param callback The callback to invoke when the {@link ChatMembersInformation} object is retrieved.
   */
  export function getChatMembers(callback: (chatMembersInformation: ChatMembersInformation) => void): void {
    ensureInitialized();

    sendMessageToParent('getChatMembers', callback);
  }

  export function isSupported(): boolean {
    return runtime.supports.chat ? true : false;
  }
}
