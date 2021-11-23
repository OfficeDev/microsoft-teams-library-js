import { chat, OpenConversationRequest } from '@microsoft/teams-js';
import React from 'react';

import { noHostSdkMsg } from '../../App';
import { ApiWithoutInput, ApiWithTextInput } from '../utils';

const CheckChatCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkChatCapability',
    title: 'Check Chat Capability',
    onClick: async () => `Chat module ${chat.isSupported() ? 'is' : 'is not'} supported`,
  });

const OpenConversation = (): React.ReactElement =>
  ApiWithTextInput<OpenConversationRequest>({
    name: 'openConversation',
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

        await chat.openConversation(input);
        return 'conversations.openConversation()' + noHostSdkMsg;
      },
    },
  });

const CloseConversation = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'closeConversation',
    title: 'Close Conversation',
    onClick: async () => {
      chat.closeConversation();
      return 'Conversation Closed!';
    },
  });

const GetChatMembers = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'getChatMembers',
    title: 'Get Chat Members',
    onClick: async () => {
      const result = await chat.getChatMembers();
      return JSON.stringify(result);
    },
  });

const ConversationsAPIs = (): React.ReactElement => (
  <>
    <h1>chat</h1>
    <OpenConversation />
    <CloseConversation />
    <GetChatMembers />
    <CheckChatCapability />
  </>
);

export default ConversationsAPIs;
