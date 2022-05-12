import {
  chat,
  conversations,
  OpenConversationRequest,
  OpenGroupChatRequest,
  OpenSingleChatRequest,
} from '@microsoft/teams-js';
import React from 'react';

import { noHostSdkMsg } from '../../App';
import { ApiWithoutInput, ApiWithTextInput } from '../utils';

const CheckChatCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkChatCapability',
    title: 'Check Chat Capability',
    onClick: async () => `Chat module ${chat.isSupported() ? 'is' : 'is not'} supported`,
  });

const OpenChat = (): React.ReactElement =>
  ApiWithTextInput<OpenSingleChatRequest>({
    name: 'openChat',
    title: 'Open Chat',
    onClick: {
      validateInput: input => {
        if (!input.user) {
          throw new Error('user is required on the input');
        }
      },
      submit: async input => {
        await chat.openChat(input);
        return 'chat.openChat()' + noHostSdkMsg;
      },
    },
  });

const OpenGroupChat = (): React.ReactElement =>
  ApiWithTextInput<OpenGroupChatRequest>({
    name: 'openGroupChat',
    title: 'Open Group Chat',
    onClick: {
      validateInput: input => {
        if (!input.users) {
          throw new Error('users is required on the input');
        }
      },
      submit: async input => {
        await chat.openGroupChat(input);
        return 'chat.openChat()' + noHostSdkMsg;
      },
    },
  });

const OpenConversation = (): React.ReactElement =>
  ApiWithTextInput<OpenConversationRequest>({
    name: 'openConversation2',
    title: 'Open Conversation',
    onClick: {
      validateInput: input => {
        if (!input.entityId || !input.title || !input.subEntityId) {
          throw new Error('entityId, title and subEntityId are required on the input');
        }
      },
      submit: async (input, setResult) => {
        input.onStartConversation = conversationResponse => {
          setResult(
            'Start Conversation Subentity Id ' +
              conversationResponse.subEntityId +
              ' Conversation Id: ' +
              conversationResponse.conversationId +
              ' Entity Id: ' +
              conversationResponse.entityId +
              ' Channel Id: ' +
              conversationResponse.channelId,
          );
        };
        input.onCloseConversation = conversationResponse => {
          setResult(
            'Close Conversation Subentity Id ' +
              conversationResponse.subEntityId +
              ' Conversation Id: ' +
              conversationResponse.conversationId +
              ' Entity Id: ' +
              conversationResponse.entityId +
              ' Channel Id: ' +
              conversationResponse.channelId,
          );
        };

        await conversations.openConversation(input);
        return 'conversations.openConversation()' + noHostSdkMsg;
      },
    },
  });

const CloseConversation = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'closeConversation',
    title: 'Close Conversation',
    onClick: async () => {
      conversations.closeConversation();
      return 'Conversation Closed!';
    },
  });

const GetChatMembers = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'getChatMembers',
    title: 'Get Chat Members',
    onClick: async () => {
      const result = await conversations.getChatMembers();
      return JSON.stringify(result);
    },
  });

const ConversationsAPIs = (): React.ReactElement => (
  <>
    <h1>chat</h1>
    <OpenChat />
    <OpenGroupChat />
    <OpenConversation />
    <CloseConversation />
    <GetChatMembers />
    <CheckChatCapability />
  </>
);

export default ConversationsAPIs;
