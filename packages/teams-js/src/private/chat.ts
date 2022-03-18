import {
  sendAndHandleStatusAndReason as sendAndHandleError,
  sendAndUnwrap,
  sendMessageToParent,
} from '../internal/communication';
import { registerHandler, removeHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from '../public/constants';
import { runtime } from '../public/runtime';
import { ChatMembersInformation } from './interfaces';

/**
 *
 * @internal
 */
interface OpenChatRequest {
  /**
   * @hidden
   * The message to send when opening chat
   */
  message?: string;
}

/**
 * @hidden
 * Hide from docs.
 * ------
 *
 * @internal
 */
export interface OpenSingleChatRequest extends OpenChatRequest {
  /**
   * @hidden
   * User's UPN to open chat with
   */
  user: string;
}

/**
 * @hidden
 * Hide from docs.
 * ------
 *
 * @internal
 */
export interface OpenGroupChatRequest extends OpenChatRequest {
  /**
   * @hidden
   * Array containing UPNs of users to open chat with
   */
  users: string[];
  /**
   * @hidden
   * The display name of a conversation for 3 or more users
   */
  topic?: string;
}

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
 *
 * @alpha
 */
export namespace chat {
  /**
   * @hidden
   * Hide from docs
   * --------------
   * Allows the user to open a chat with a single user and allows
   * for the user to specify the message they wish to send.
   *
   *@param openChatRequest: OpenSingleChatRequest - a request object that contains a user's email as well as an optional message parameter.
   *
   * @returns Promise resolved upon completion
   */
  export function openChat(openChatRequest: OpenSingleChatRequest): Promise<void> {
    return new Promise<void>(resolve => {
      ensureInitialized(FrameContexts.content);
      const sendPromise = sendAndHandleError('chat.openChat', {
        members: openChatRequest.user,
        message: openChatRequest.message,
      });
      resolve(sendPromise);
    });
  }
  /**
   * @hidden
   * Hide from docs
   * --------------
   * Allows the user to create a chat with multiple users (2+) and allows
   * for the user to specify a message and name the topic of the conversation. If
   * only 1 user is provided into users array default back to origin openChat.
   *
   * @param openChatRequest: OpenGroupChatRequest - a request object that contains a list of user emails as well as optional parameters for message and topic (display name for the group chat).
   *
   * @returns Promise resolved upon completion
   */
  export function openGroupChat(openChatRequest: OpenGroupChatRequest): Promise<void> {
    return new Promise<void>(resolve => {
      if (openChatRequest.users.length < 1) {
        throw Error('OpenGroupChat Failed: No users specified');
      }
      if (openChatRequest.users.length === 1) {
        const chatRequest: OpenSingleChatRequest = {
          user: openChatRequest.users[0],
          message: openChatRequest.message,
        };
        openChat(chatRequest);
      } else {
        ensureInitialized(FrameContexts.content);
        const sendPromise = sendAndHandleError('chat.openChat', {
          members: openChatRequest.users,
          message: openChatRequest.message,
          topic: openChatRequest.topic,
        });
        resolve(sendPromise);
      }
    });
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
      resolve(sendAndUnwrap('getChatMembers'));
    });
  }

  export function isSupported(): boolean {
    return runtime.supports.chat ? true : false;
  }

  export namespace conversation {
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
      sendMessageToParent('conversations.closeConversation');
      removeHandler('startConversation');
      removeHandler('closeConversation');
    }

    export function isSupported(): boolean {
      return runtime.supports.chat.conversation ? true : false;
    }
  }
}
