import React from 'react';
//import { chat, conversations } from '@microsoft/teams-js';
//import { captureConsoleLogs } from './../components/sample/LoggerUtility';

const ChatAPIs: React.FC = () => {
  /*
  const checkChatCapability = async () => {
    captureConsoleLogs((log) => console.log(log));
    console.log('Checking if Chat module is supported...');
    const isSupported = chat.isSupported();
    console.log(`Chat module ${isSupported ? 'is' : 'is not'} supported`);
    return `Chat module ${isSupported ? 'is' : 'is not'} supported`;
  };

  const openChat = async () => {
    await chat.openChat({ user: 'testUpn', message: 'testMessage' });
    return 'chat.openChat() was called';
  };

  const openGroupChat = async () => {
    await chat.openGroupChat({ users: ['testUpn1', 'testUpn2'], message: 'testMessage' });
    return 'chat.openGroupChat() was called';
  };

  const openConversation = async () => {
    await conversations.openConversation({
      entityId: 'entityId1',
      title: 'title1',
      subEntityId: 'subEntityId1',
    });
    return 'conversations.openConversation() called';
  };

  const closeConversation = async () => {
    conversations.closeConversation();
    return 'Conversation Closed!';
  };

  const getChatMembers = async () => {
    const result = await conversations.getChatMembers();
    return JSON.stringify(result);
  };*/

  return (
    <div>
      <div className="api-header">API: Chat</div>
    </div>
  );
};

export default ChatAPIs;
