import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { ApiComponent } from '../components/sample/ApiComponents';
import { chat, conversations } from '@microsoft/teams-js';

export const chat_CheckChatCapability = async () => {
  console.log('Executing CheckChatCapability...');
  return `Chat module ${chat.isSupported() ? 'is' : 'is not'} supported`;
};

export const chat_OpenChat = async (input?: string) => {
  console.log('Executing OpenChat with input:', input);
  const parsedInput = input ? JSON.parse(input) : {};
  await chat.openChat(parsedInput);
  return 'OpenChat called';
};

export const chat_OpenGroupChat = async (input?: string) => {
  console.log('Executing OpenGroupChat with input:', input);
  const parsedInput = input ? JSON.parse(input) : {};
  await chat.openGroupChat(parsedInput);
  return 'OpenGroupChat called';
};

export const chat_OpenConversation = async (input?: string) => {
  console.log('Executing OpenConversation with input:', input);
  const parsedInput = input ? JSON.parse(input) : {};
  await conversations.openConversation(parsedInput);
  return 'OpenConversation called';
};

export const chat_CloseConversation = async () => {
  console.log('Executing CloseConversation...');
  conversations.closeConversation();
  return 'Conversation Closed!';
};

/*
export const chat_GetChatMembers = async (input: string | undefined) => {
  console.log('Executing GetChatMembers...');
  const result = await conversations.getChatMembers();
  return JSON.stringify(result);
};*/

interface ChatAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (apiComponent: ApiComponent, func: string, input: string) => void;
}

const ChatAPIs: React.FC<ChatAPIsProps> = ({ apiComponent, onDropToScenarioBox }) => {
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');

  const handleFunctionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFunc = event.target.value;
    setSelectedFunction(selectedFunc);
    if (selectedFunc === 'OpenChat' || selectedFunc === 'OpenGroupChat' || selectedFunc === 'OpenConversation') {
      setInputValue(apiComponent.defaultInput || '');
    } else {
      setInputValue('');
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'API',
    item: () => ({
      api: apiComponent,
      func: selectedFunction,
      input: selectedFunction === 'OpenChat' || selectedFunction === 'OpenGroupChat' || selectedFunction === 'OpenConversation' ? inputValue : '',
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [selectedFunction, inputValue]);

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
          {apiComponent.options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
        {(selectedFunction === 'OpenChat' || selectedFunction === 'OpenGroupChat' || selectedFunction === 'OpenConversation') && (
          <div className="input-container">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Enter input for the selected function"
            />
            <button onClick={() => setInputValue(apiComponent.defaultInput || '')}>Default</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatAPIs;
