import React from 'react';
import { ApiComponent } from '../components/sample/ApiComponents';
import { chat, conversations } from '@microsoft/teams-js';
import ApiComponentWrapper from '../utils/ApiComponentWrapper';
import { checkCapabilitySupport } from '../utils/CheckCapabilityUtils';

export const chat_CheckChatCapability = async (): Promise<void> => {
  const module = chat;
  const moduleName = 'Chat';
  const supportedMessage = 'Chat module is supported. Chat is supported on Teams Web, Outlook Web, Teams Desktop, Outlook Desktop (Version 2205 or later), and Teams Mobile.';
  const notSupportedMessage = 'Chat module is not supported. Chat is not supported on M365 Web, M365 Desktop, Outlook Desktop (Versions older than 2205), M365 Mobile, or Outlook Mobile.';
  
  await checkCapabilitySupport(module, moduleName, supportedMessage, notSupportedMessage);
};

export const chat_OpenChat = async (input: string): Promise<string> => {
  console.log('Executing OpenChat...');
  try {
    const chatParams = JSON.parse(input);
    if (!chatParams.user) {
      console.log('User is required');
      throw new Error('User is required');
    }

    await chat.openChat({ user: chatParams.user, message: chatParams.message });
    console.log('Chat opened successfully');
    return 'chat.openChat() was called';
  } catch (error) {
    console.log('Error opening chat:', error);
    throw error;
  }
};

export const chat_OpenGroupChat = async (input: string): Promise<string> => {
  console.log('Executing OpenGroupChat...');
  try {
    const groupChatParams = JSON.parse(input);
    if (!Array.isArray(groupChatParams.users) || groupChatParams.users.length === 0) {
      console.log('Users array is required and must contain at least one user');
      throw new Error('Users array is required and must contain at least one user');
    }
    
    await chat.openGroupChat({ users: groupChatParams.users, message: groupChatParams.message });
    console.log('Group chat opened successfully');
    return 'chat.openGroupChat() was called';
  } catch (error) {
    console.log('Error opening group chat:', error);
    throw error;
  }
};

export const chat_OpenConversation = async (input: string): Promise<string> => {
  console.log('Executing OpenConversation with input...');
  try {
    const conversationParams = JSON.parse(input);
    if (!conversationParams.entityId || !conversationParams.title || !conversationParams.subEntityId) {
      throw new Error('entityId, title, and subEntityId are required');
    }
    await conversations.openConversation(conversationParams);
    console.log('Conversations opened successfully');
    return 'Conversation Opened';
  } catch (error) {
    console.log('Error opening conversation:', error);
    throw error;
  }
};

export const chat_CloseConversation = async (): Promise<string> => {
  console.log('Executing CloseConversation...');
  try {
    await conversations.closeConversation();
    console.log('Conversation closed successfully');
    return 'Conversation Closed';
  } catch (error) {
    console.log('Error closing conversation:', error);
    throw error;
  }
};

const functionsRequiringInput = [
  'OpenChat', 
  'OpenGroupChat', 
  'OpenConversation'
]; // List of functions requiring input
interface ChatAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const ChatAPIs: React.FC<ChatAPIsProps> = (props) => {
  return (
    <ApiComponentWrapper
      apiComponent={props.apiComponent}
      onDropToScenarioBox={props.onDropToScenarioBox}
      functionsRequiringInput={functionsRequiringInput}
    />
  );
};

export default ChatAPIs;
