import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { ApiComponent } from '../components/sample/ApiComponents';
import { chat, conversations } from '@microsoft/teams-js';
import { useDragAndDrop } from '../utils/UseDragAndDrop';

export const chat_CheckChatCapability = async (): Promise<void> => {
  console.log('Executing CheckChatCapability...');
  try {
    const result = await chat.isSupported();
    if (result) {
      console.log('Chat module is supported. Chat is supported on Teams Web, Outlook Web, Teams Desktop, Outlook Desktop (Version 2205 or later), and Teams Mobile.');
    } else {
      console.log('Chat module is not supported. Chat is not supported on M365 Web, M365 Desktop, Outlook Desktop (Versions older than 2205), M365 Mobile, or Outlook Mobile.');
      throw new Error('Chat module is not supported');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error checking Chat capability:', errorMessage);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
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

interface ChatAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const ChatAPIs: React.FC<ChatAPIsProps> = ({ apiComponent, onDropToScenarioBox }) => {
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');

  const functionsRequiringInput = [
    'OpenChat', 
    'OpenGroupChat', 
    'OpenConversation'
  ]; // List of functions requiring input

  const handleFunctionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFunc = event.target.value;
    setSelectedFunction(selectedFunc);
    setInputValue('');  // Reset input value when function changes
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleDefaultButtonClick = () => {
    if (selectedFunction && apiComponent.defaultInput) {
      const defaultInputs = JSON.parse(apiComponent.defaultInput);
      setInputValue(defaultInputs[selectedFunction] ? JSON.stringify(defaultInputs[selectedFunction]) : '');
    }
  };

  // Determine if the input box should be shown based on the selected function
  const showInputBox = selectedFunction && functionsRequiringInput.includes(selectedFunction);

  const { isDragging, drag } = useDragAndDrop('API', { api: apiComponent, func: selectedFunction, input: inputValue });

  return (
    <div className="api-container" ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <div className="api-header">{apiComponent.title}</div>
      <div className="dropdown-menu">
        <select
          aria-label={`Select a function for ${apiComponent.title}`}
          className="box-dropdown"
          onChange={handleFunctionChange}
          value={selectedFunction}
        >
          <option value="">Select a function</option>
          {apiComponent.functions.map((func, index) => (
            <option key={index} value={func.name}>
              {func.name}
            </option>
          ))}
        </select>
        {showInputBox && (
          <div className="input-container">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={`Enter input for ${selectedFunction}`}
            />
            <button onClick={handleDefaultButtonClick}>Default</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatAPIs;
