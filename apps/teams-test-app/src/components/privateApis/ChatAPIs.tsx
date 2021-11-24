import { chat, OpenConversationRequest } from '@microsoft/teams-js';
import React from 'react';

import { noHostSdkMsg } from '../../App';
import BoxAndButton from '../BoxAndButton';
import { ApiWithoutInput, ApiWithTextInput } from '../utils';

const CheckChatCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkChatCapability',
    title: 'Check Chat Capability',
    onClick: async () => `Chat module ${chat.isSupported() ? 'is' : 'is not'} supported`,
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

const ConversationsAPIs = (): React.ReactElement => {
  // TODO: Remove once E2E scenario tests are updated to use the new version
  const [openConversationRes, setOpenConversationRes] = React.useState('');

  // TODO: Remove once E2E scenario tests are updated to use the new version
  const openConversation = (openConversationRequestInput: string): void => {
    setOpenConversationRes('conversations.openConversation()' + noHostSdkMsg);
    const openConversationRequest: OpenConversationRequest = JSON.parse(openConversationRequestInput);
    openConversationRequest.onStartConversation = conversationResponse => {
      setOpenConversationRes(
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
    openConversationRequest.onCloseConversation = conversationResponse => {
      setOpenConversationRes(
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
    chat.openConversation(openConversationRequest).catch(e => setOpenConversationRes('Error' + e));
  };

  return (
    <>
      <h1>chat</h1>
      <OpenConversation />
      <CloseConversation />
      {/* TODO: Remove once E2E scenario tests are updated to use the new version */}
      <BoxAndButton
        handleClickWithInput={openConversation}
        output={openConversationRes}
        hasInput={true}
        title="Open Conversation"
        name="openConversation"
      />
      <GetChatMembers />
      <CheckChatCapability />
    </>
  );
};

export default ConversationsAPIs;
