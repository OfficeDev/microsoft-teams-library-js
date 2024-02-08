import {
  sendAndHandleStatusAndReasonWithVersion,
  sendAndUnwrapWithVersion,
  sendMessageToParentWithVersion,
} from '../internal/communication';
import { registerHandlerWithVersion, removeHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import { runtime } from '../public/runtime';
import { ChatMembersInformation } from './interfaces';

/**
 * @hidden
 *
 * @internal
 * Limited to Microsoft-internal use
 *
 * v1 APIs telemetry file: All of APIs in this capability file should send out API version v1 ONLY
 */
const conversationsTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_1;

export interface OpenConversationRequest {
  /**
   * @hidden
   * The Id of the subEntity where the conversation is taking place
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  subEntityId: string;

  /**
   * @hidden
   * The title of the conversation
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  title: string;

  /**
   * @hidden
   * The Id of the conversation. This is optional and should be specified whenever a previous conversation about a specific sub-entity has already been started before
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  conversationId?: string;

  /**
   * @hidden
   * The Id of the channel. This is optional and should be specified whenever a conversation is started or opened in a personal app scope
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  channelId?: string;

  /**
   * @hidden
   * The entity Id of the tab
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  entityId: string;

  /**
   * @hidden
   * A function that is called once the conversation Id has been created
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  onStartConversation?: (conversationResponse: ConversationResponse) => void;

  /**
   * @hidden
   * A function that is called if the pane is closed
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  onCloseConversation?: (conversationResponse: ConversationResponse) => void;
}

/**
 * @hidden
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface ConversationResponse {
  /**
   * @hidden
   *
   * Limited to Microsoft-internal use
   * The Id of the subEntity where the conversation is taking place
   */
  subEntityId: string;

  /**
   * @hidden
   * The Id of the conversation. This is optional and should be specified whenever a previous conversation about a specific sub-entity has already been started before
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  conversationId?: string;

  /**
   * @hidden
   * The Id of the channel. This is optional and should be specified whenever a conversation is started or opened in a personal app scope
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  channelId?: string;

  /**
   * @hidden
   * The entity Id of the tab
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  entityId?: string;
}

/**
 * @hidden
 * Namespace to interact with the conversational subEntities inside the tab
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export namespace conversations {
  /**
   * @hidden
   * Hide from docs
   * --------------
   * Allows the user to start or continue a conversation with each subentity inside the tab
   *
   * @returns Promise resolved upon completion
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function openConversation(openConversationRequest: OpenConversationRequest): Promise<void> {
    return new Promise<void>((resolve) => {
      ensureInitialized(runtime, FrameContexts.content);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      const sendPromise = sendAndHandleStatusAndReasonWithVersion(
        getApiVersionTag(conversationsTelemetryVersionNumber, ApiName.Conversations_OpenConversation),
        'conversations.openConversation',
        {
          title: openConversationRequest.title,
          subEntityId: openConversationRequest.subEntityId,
          conversationId: openConversationRequest.conversationId,
          channelId: openConversationRequest.channelId,
          entityId: openConversationRequest.entityId,
        },
      );
      if (openConversationRequest.onStartConversation) {
        registerHandlerWithVersion(
          getApiVersionTag(conversationsTelemetryVersionNumber, ApiName.Conversations_RegisterStartConversationHandler),
          'startConversation',
          (subEntityId: string, conversationId: string, channelId: string, entityId: string) =>
            openConversationRequest.onStartConversation?.({
              subEntityId,
              conversationId,
              channelId,
              entityId,
            }),
        );
      }
      if (openConversationRequest.onCloseConversation) {
        registerHandlerWithVersion(
          getApiVersionTag(conversationsTelemetryVersionNumber, ApiName.Conversations_RegisterCloseConversationHandler),
          'closeConversation',
          (subEntityId: string, conversationId?: string, channelId?: string, entityId?: string) =>
            openConversationRequest.onCloseConversation?.({
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
   *
   * Allows the user to close the conversation in the right pane
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function closeConversation(): void {
    ensureInitialized(runtime, FrameContexts.content);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    sendMessageToParentWithVersion(
      getApiVersionTag(conversationsTelemetryVersionNumber, ApiName.Conversations_CloseConversation),
      'conversations.closeConversation',
    );
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
   * Limited to Microsoft-internal use
   */
  export function getChatMembers(): Promise<ChatMembersInformation> {
    return new Promise<ChatMembersInformation>((resolve) => {
      ensureInitialized(runtime);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      resolve(
        sendAndUnwrapWithVersion(
          getApiVersionTag(conversationsTelemetryVersionNumber, ApiName.Conversations_GetChatMember),
          'getChatMembers',
        ),
      );
    });
  }

  /**
   * Checks if the conversations capability is supported by the host
   * @returns boolean to represent whether conversations capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.conversations ? true : false;
  }
}
