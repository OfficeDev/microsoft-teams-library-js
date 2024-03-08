import { sendAndHandleStatusAndReason } from '../internal/communication';
import { createTeamsDeepLinkForChat } from '../internal/deepLinkUtilities';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import { runtime } from '../public/runtime';

/**
 * Describes information needed to start a chat
 */

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const chatTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

interface OpenChatRequest {
  /**
   * An optional message used when initiating chat
   */
  message?: string;
}

/**
 * Used when starting a chat with one person
 *
 * @see OpenGroupChatRequest for use when a chat with more than one person
 */
export interface OpenSingleChatRequest extends OpenChatRequest {
  /**
   * The [Microsoft Entra UPN](https://learn.microsoft.com/entra/identity/hybrid/connect/plan-connect-userprincipalname) (usually but not always an e-mail address)
   * of the user with whom to begin a chat
   */
  user: string;
}

/**
 * Used when starting a chat with more than one person
 *
 * @see OpenSingleChatRequest for use in a chat with only one person
 */
export interface OpenGroupChatRequest extends OpenChatRequest {
  /**
   * Array containing [Microsoft Entra UPNs](https://learn.microsoft.com/entra/identity/hybrid/connect/plan-connect-userprincipalname) (usually but not always an e-mail address)
   * of users with whom to begin a chat
   */
  users: string[];
  /**
   * The display name of a conversation for 3 or more users (chats with fewer than three users will ignore this field)
   */
  topic?: string;
}

/**
 * Contains functionality to start chat with others
 */
export namespace chat {
  /**
   * Allows the user to open a chat with a single user and allows
   * for the user to specify the message they wish to send.
   *
   * @param openChatRequest: {@link OpenSingleChatRequest}- a request object that contains a user's email as well as an optional message parameter.
   *
   * @returns Promise resolved upon completion
   */
  export function openChat(openChatRequest: OpenSingleChatRequest): Promise<void> {
    const apiVersionTag = getApiVersionTag(chatTelemetryVersionNumber, ApiName.Chat_OpenChat);
    return openChatHelper(apiVersionTag, openChatRequest);
  }

  function openChatHelper(apiVersionTag: string, openChatRequest: OpenSingleChatRequest): Promise<void> {
    return new Promise<void>((resolve) => {
      ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      if (runtime.isLegacyTeams) {
        resolve(
          sendAndHandleStatusAndReason(
            apiVersionTag,
            'executeDeepLink',
            createTeamsDeepLinkForChat([openChatRequest.user], undefined /*topic*/, openChatRequest.message),
          ),
        );
      } else {
        const sendPromise = sendAndHandleStatusAndReason(apiVersionTag, 'chat.openChat', {
          members: [openChatRequest.user],
          message: openChatRequest.message,
        });
        resolve(sendPromise);
      }
    });
  }
  /**
   * Allows the user to create a chat with multiple users (2+) and allows
   * for the user to specify a message and name the topic of the conversation. If
   * only 1 user is provided into users array default back to origin openChat.
   *
   * @param openChatRequest: {@link OpenGroupChatRequest} - a request object that contains a list of user emails as well as optional parameters for message and topic (display name for the group chat).
   *
   * @returns Promise resolved upon completion
   */
  export function openGroupChat(openChatRequest: OpenGroupChatRequest): Promise<void> {
    const apiVersionTag = getApiVersionTag(chatTelemetryVersionNumber, ApiName.Chat_OpenGroupChat);
    return new Promise<void>((resolve) => {
      if (openChatRequest.users.length < 1) {
        throw Error('OpenGroupChat Failed: No users specified');
      }
      if (openChatRequest.users.length === 1) {
        const chatRequest: OpenSingleChatRequest = {
          user: openChatRequest.users[0],
          message: openChatRequest.message,
        };
        resolve(openChatHelper(apiVersionTag, chatRequest));
      } else {
        ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
        if (!isSupported()) {
          throw errorNotSupportedOnPlatform;
        }
        if (runtime.isLegacyTeams) {
          resolve(
            sendAndHandleStatusAndReason(
              apiVersionTag,
              'executeDeepLink',
              createTeamsDeepLinkForChat(openChatRequest.users, openChatRequest.topic, openChatRequest.message),
            ),
          );
        } else {
          const sendPromise = sendAndHandleStatusAndReason(apiVersionTag, 'chat.openChat', {
            members: openChatRequest.users,
            message: openChatRequest.message,
            topic: openChatRequest.topic,
          });
          resolve(sendPromise);
        }
      }
    });
  }

  /**
   * Checks if the chat capability is supported by the host
   * @returns boolean to represent whether the chat capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.chat ? true : false;
  }
}
