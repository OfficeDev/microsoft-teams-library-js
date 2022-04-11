import { sendAndHandleStatusAndReason as sendAndHandleError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from '../public/constants';
import { runtime } from '../public/runtime';

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
   *@param openChatRequest: {@link OpenSingleChatRequest}- a request object that contains a user's email as well as an optional message parameter.
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
   * @param openChatRequest: {@link OpenGroupChatRequest} - a request object that contains a list of user emails as well as optional parameters for message and topic (display name for the group chat).
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

  export function isSupported(): boolean {
    return runtime.supports.chat ? true : false;
  }
}
