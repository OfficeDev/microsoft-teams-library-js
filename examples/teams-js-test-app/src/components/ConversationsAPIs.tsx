import React from 'react';
import { conversations } from "@microsoft/teamsjs-app-sdk";
import BoxAndButton from "./BoxAndButton";
import { noHubSdkMsg } from "../App"

const ConversationsAPIs = () => {
  const [openConversation, setOpenConversation] = React.useState("");
  const [closeConversation, setCloseConversation] = React.useState("");

  const returnConversationsOpenConversation = (openConversationRequest: any) => {
    setOpenConversation("conversations.openConversation()" + noHubSdkMsg);
    openConversationRequest = JSON.parse(openConversationRequest);
    openConversationRequest.onStartConversation = (conversationResponse) => {
      setOpenConversation("Start Conversation Subentity Id " + conversationResponse.subEntityId + " Conversation Id: " + conversationResponse.conversationId + " Entity Id: " + conversationResponse.entityId + " Channel Id: " + conversationResponse.channelId);
    };
    openConversationRequest.onCloseConversation = (conversationResponse) => {
      setOpenConversation("Start Conversation Subentity Id " + conversationResponse.subEntityId + " Conversation Id: " + conversationResponse.conversationId + " Entity Id: " + conversationResponse.entityId + " Channel Id: " + conversationResponse.channelId);
    };
    try {
      conversations.openConversation(openConversationRequest);
    } catch (e) {
      setOpenConversation("Error" + e);
    }
  };

  const returnConversationsCloseConversation = () => {
    setCloseConversation("Conversation Closed!");
    conversations.closeConversation();
  };

  return (
    <>
      <BoxAndButton
        handleClick={returnConversationsOpenConversation}
        output={openConversation}
        hasInput={true}
        title="openConversation"
        name="Open Conversation"
      />
      <BoxAndButton
        handleClick={returnConversationsCloseConversation}
        output={closeConversation}
        hasInput={false}
        title="closeConversation"
        name="Close Conversation"
      />
    </>
  );
};

export default ConversationsAPIs;
