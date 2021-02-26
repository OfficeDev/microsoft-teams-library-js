import React, { ReactElement } from 'react';
import { conversations } from '@microsoft/teamsjs-app-sdk';
import BoxAndButton from './BoxAndButton';
import { noHubSdkMsg } from '../App';

const ConversationsAPIs = (): ReactElement => {
  const [openConversationRes, setOpenConversationRes] = React.useState('');
  const [closeConversationRes, setCloseConversationRes] = React.useState('');

  const openConversation = (openConversationRequest: any): void => {
    setOpenConversationRes('conversations.openConversation()' + noHubSdkMsg);
    openConversationRequest = JSON.parse(openConversationRequest);
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
    try {
      conversations.openConversation(openConversationRequest);
    } catch (e) {
      setOpenConversationRes('Error' + e);
    }
  };

  const closeConversation = (): void => {
    setCloseConversationRes('Conversation Closed!');
    conversations.closeConversation();
  };

  return (
    <>
      <BoxAndButton
        handleClick={openConversation}
        output={openConversationRes}
        hasInput={true}
        title="openConversation"
        name="Open Conversation"
      />
      <BoxAndButton
        handleClick={closeConversation}
        output={closeConversationRes}
        hasInput={false}
        title="closeConversation"
        name="Close Conversation"
      />
    </>
  );
};

export default ConversationsAPIs;
