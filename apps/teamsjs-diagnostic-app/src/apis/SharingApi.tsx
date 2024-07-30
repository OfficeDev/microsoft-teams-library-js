import React, { useState } from 'react';
import { ApiComponent } from '../components/sample/ApiComponents';
import { sharing } from '@microsoft/teams-js';
import { useDragAndDrop } from '../utils/UseDragAndDrop';

interface ShareWebContentInput {
  content: {
    type: 'URL';
    url: string;
    message?: string;
    preview?: boolean;
  }[];
}

export const sharing_CheckSharingCapability = async (): Promise<void> => {
  console.log('Executing CheckSharingCapability...');

  try {
    const result = sharing.isSupported();
    if (result) {
      console.log('Sharing module is supported. Sharing is supported on Teams Web, Teams Desktop, and Teams (versions under 23247.720.2421.8365) Mobile');
    } else {
      console.log('Sharing module is not supported. Sharing is not supported on M365 Web, Outlook Web, M365 Desktop, Outlook Desktop, M365 Mobile, or Outlook Mobile.');
      throw new Error('Sharing capability is not supported');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error checking Sharing capability:', errorMessage);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
};

export const sharing_ShareWebContent = async (input: ShareWebContentInput): Promise<string> => {
  console.log('Executing ShareWebContent...');
  try {
    if (!input.content || input.content.length === 0) {
      throw new Error('content is required');
    }
    for (const contentItem of input.content) {
      if (contentItem.type !== 'URL') {
        console.log("Each of the content items has to have type property with value 'URL'.");
        throw new Error("Must have type property with value 'URL'.");
      }
      if (!contentItem.url) {
        console.log('Each of the content items has to have url property set.');
        throw new Error('Must have url property set.');
      }
    }

    await sharing.shareWebContent(input);
    return 'Success';
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('Error sharing web content:', errorMessage);
    throw error;
  }
};

interface SharingAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const SharingAPIs: React.FC<SharingAPIsProps> = ({ apiComponent, onDropToScenarioBox }) => {
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');

  const handleFunctionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFunc = event.target.value;
    setSelectedFunction(selectedFunc);
    setInputValue('');
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

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
        {selectedFunction === 'ShareWebContent' && (
          <div className="input-container">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={`Enter input for ${selectedFunction}`}
            />
            <button onClick={() => setInputValue(apiComponent.defaultInput || '')}>Default</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharingAPIs;
