import {
  sendAndHandleStatusAndReason as sendAndHandleError,
  sendAndUnwrap,
  sendMessageToParent,
} from '../internal/communication';
import { registerHandler, removeHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import { runtime } from '../public/runtime';
import { ChatMembersInformation } from './interfaces';

/**
 * @hidden
 * Hide from docs.
 * ------
 *
 * @internal
 */
export interface OpenConversationRequest {
  /**
   * @hidden
   * The Id of the subEntity where the conversation is taking place
   */
  subEntityId: string;

  /**
   * @hidden
   * The title of the conversation
   */
  title: string;

  /**
   * @hidden
   * The Id of the conversation. This is optional and should be specified whenever a previous conversation about a specific sub-entity has already been started before
   */
  conversationId?: string;

  /**
   * @hidden
   * The Id of the channel. This is optional and should be specified whenever a conversation is started or opened in a personal app scope
   */
  channelId?: string;

  /**
   * @hidden
   * The entity Id of the tab
   */
  entityId: string;

  /**
   * @hidden
   * A function that is called once the conversation Id has been created
   */
  onStartConversation?: (conversationResponse: ConversationResponse) => void;

  /**
   * @hidden
   * A function that is called if the pane is closed
   */
  onCloseConversation?: (conversationResponse: ConversationResponse) => void;
}

/**
 * @hidden
 * Hide from docs.
 * ------
 *
 * @internal
 */
export interface ConversationResponse {
  /**
   * @hidden
   * The Id of the subEntity where the conversation is taking place
   */
  subEntityId: string;

  /**
   * @hidden
   * The Id of the conversation. This is optional and should be specified whenever a previous conversation about a specific sub-entity has already been started before
   */
  conversationId?: string;

  /**
   * @hidden
   * The Id of the channel. This is optional and should be specified whenever a conversation is started or opened in a personal app scope
   */
  channelId?: string;

  /**
   * @hidden
   * The entity Id of the tab
   */
  entityId?: string;
}

/**
 * @hidden
 * Namespace to interact with the conversational subEntities inside the tab
 */
export namespace conversations {
  /**
   * @hidden
   * Hide from docs
   * --------------
   * Allows the user to start or continue a conversation with each subentity inside the tab
   *
   * @returns Promise resolved upon completion
   */
  export function openConversation(openConversationRequest: OpenConversationRequest): Promise<void> {
    return new Promise<void>(resolve => {
      ensureInitialized(FrameContexts.content);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      const sendPromise = sendAndHandleError('conversations.openConversation', {
        title: openConversationRequest.title,
        subEntityId: openConversationRequest.subEntityId,
        conversationId: openConversationRequest.conversationId,
        channelId: openConversationRequest.channelId,
        entityId: openConversationRequest.entityId,
      });
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
      resolve(sendPromise);
    });
  }

  /**
   * @hidden
   * Hide from docs
   * --------------
   * Allows the user to close the conversation in the right pane
   */
  export function closeConversation(): void {
    ensureInitialized(FrameContexts.content);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    sendMessageToParent('conversations.closeConversation');
    removeHandler('startConversation');
    removeHandler('closeConversation');
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * Allows retrieval of information for all chat members.
   * NOTE: This value should be used only as a hint as to who the members are
   * and never as proof of membership in case your app is being hosted by a malicious party.
   *
   * @returns Promise resolved with information on all chat members
   *
   * @internal
   */
  export function getChatMembers(): Promise<ChatMembersInformation> {
    return new Promise<ChatMembersInformation>(resolve => {
      ensureInitialized();
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      resolve(sendAndUnwrap('getChatMembers'));
    });
  }

  export function isSupported(): boolean {
    return runtime.supports.conversations ? true : false;
  }
}
