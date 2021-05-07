import React, { ReactElement } from 'react';
import { OpenConversationRequest, chat, ChatMembersInformation } from '@microsoft/teamsjs-app-sdk';
import BoxAndButton from '../BoxAndButton';
import { noHubSdkMsg } from '../../App';

const ConversationsAPIs = (): ReactElement => {
  const [openConversationRes, setOpenConversationRes] = React.useState('');
  const [closeConversationRes, setCloseConversationRes] = React.useState('');
  const [getChatMembersRes, setGetChatMembersRes] = React.useState('');
  const [capabilityCheckRes, setCapabilityCheckRes] = React.useState('');

  const openConversation = (openConversationRequestInput: string): void => {
    setOpenConversationRes('conversations.openConversation()' + noHubSdkMsg);
    let openConversationRequest: OpenConversationRequest = JSON.parse(openConversationRequestInput);
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
      chat.openConversation(openConversationRequest);
    } catch (e) {
      setOpenConversationRes('Error' + e);
    }
  };

  const closeConversation = (): void => {
    setCloseConversationRes('Conversation Closed!');
    chat.closeConversation();
  };

  const returnGetChatMembers = (): void => {
    setGetChatMembersRes('getChatMembers()' + noHubSdkMsg);
    const onComplete = (chatMembersInformation: ChatMembersInformation): void => {
      setGetChatMembersRes(JSON.stringify(chatMembersInformation));
    };
    chat.getChatMembers(onComplete);
  };

  const checkChatCapability = (): void => {
    if (chat.isSupported()) {
      setCapabilityCheckRes('Chat module is supported');
    } else {
      setCapabilityCheckRes('Chat module is not supported');
    }
  };

  return (
    <>
      <BoxAndButton
        handleClickWithInput={openConversation}
        output={openConversationRes}
        hasInput={true}
        title="Open Conversation"
        name="openConversation"
      />
      <BoxAndButton
        handleClick={closeConversation}
        output={closeConversationRes}
        hasInput={false}
        title="Close Conversation"
        name="closeConversation"
      />
      <BoxAndButton
        handleClick={returnGetChatMembers}
        output={getChatMembersRes}
        hasInput={false}
        title="Get Chat Members"
        name="getChatMembers"
      />
      <BoxAndButton
        handleClick={checkChatCapability}
        output={capabilityCheckRes}
        hasInput={false}
        title="Check Chat Capability"
        name="checkChatCapability"
      />
    </>
  );
};

export default ConversationsAPIs;
