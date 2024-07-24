import React, { useState } from 'react';
import { useDragAndDrop } from '../../utils/UseDragAndDrop';
import { ApiComponent } from '../components/sample/ApiComponents';
import { pages } from '@microsoft/teams-js';

export const pages_CheckCapability = async (): Promise<void> => {
    console.log('Executing CheckCapability...');
    try {
      const result = pages.isSupported();
      if (result) {
        console.log('Pages module is supported. Pages is supported on all platforms.');
      } else {
        console.log('Pages module is not supported.');
        throw new Error('Pages capability is not supported');
      }
    } catch (error) {
      console.error('Error checking Pages capability:', error);
      throw error;
    }
};

  export const pages_NavigateCrossDomain = async (url: string): Promise<void> => {
    console.log('Executing NavigateCrossDomain...');

    console.log('URL received:', url);
    console.log('Type of URL:', typeof url);
    
    if (typeof url !== 'string') {
      console.log('Url is invalid. Must be a URL string.');
      throw new Error('Url is invalid');
    }
    
    try {
      await pages.navigateCrossDomain(url);
      console.log(`Navigation to ${url} was successful.`);
    } catch (error) {
      console.error(`Error navigating to ${url}:`, error);
      throw error;
    }
  };

  export const pages_NavigateToApp = async (input: {
    appId: string;
    pageId: string;
    webUrl: string;
    subPageId?: string;
    channelId?: string;
}): Promise<void> => {
    console.log('Executing NavigateToApp...');

    try {
        await pages.navigateToApp(input);
        console.log(`Navigation to app with ID ${input.appId} was successful.`)
    } catch (error) {
        console.log(`Error navigating to app with ID ${input.appId}:`, error);
        throw error;
    }
};

export const pages_ShareDeepLink = async (input: {
  subEntityId: string;
  subEntityLabel: string;
  subEntityWebUrl: string;
  subPageId: string;
  subPageLabel: string;
  subPageWebUrl: string;
}): Promise<void> => {
  console.log('Executing ShareDeepLink...');
  try {
    await pages.shareDeepLink(input);
    console.log(`Deep link shared successfully.`);
  } catch (error) {
    console.error('Error sharing deep link:', error);
    throw error;
  }
};

export const pages_SetCurrentFrame = async (input: {
  websiteUrl: string;
  contentUrl: string;
}): Promise<void> => {
  console.log('Executing SetCurrentFrame...');
  try {
    await pages.setCurrentFrame(input);
    console.log('Current frame set successfully.');
  } catch (error) {
    console.error('Error setting current frame:', error);
    throw error;
  }
};

export const pages_GetConfig = async (): Promise<void> => {
    console.log('Executing GetConfig...');
    try {
      const config = await pages.getConfig();
      console.log('Page configuration retrieved:', JSON.stringify(config, null, 2));
    } catch (error) {
      console.log('Error getting page configuration:', error);
      throw error;
    }
  };
  

export const pages_RegisterFocusEnterHandler = async (): Promise<void> => {
  console.log('Executing RegisterChangeHandler...');
  try {
    pages.registerFocusEnterHandler((event) => {
      console.log('Page configuration changed:', event);
    });
    console.log('Change handler registered successfully.');
  } catch (error) {
    console.error('Error registering change handler:', error);
    throw error;
  }
};

export const pages_RegisterFullScreenChangeHandler = async (): Promise<void> => {
    console.log('Executing RegisterFullScreenChangeHandler...');
    try {
      pages.registerFullScreenHandler((isFullScreen) => {
        console.log(`Full screen mode changed: ${isFullScreen}`);
      });
  
      console.log('Full screen change handler registered successfully.');
    } catch (error) {
      console.error('Error registering full screen change handler:', error);
      throw error;
    }
  };

interface PagesAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const PagesAPIs: React.FC<PagesAPIsProps> = ({ apiComponent, onDropToScenarioBox }) => {
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');

  const functionsRequiringInput = [
    'NavigateCrossDomain', 
    'NavigateToApp', 
    'ShareDeepLink',
    'SetCurrentFrame'
  ];

  const handleFunctionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFunc = event.target.value;
    setSelectedFunction(selectedFunc);
    setInputValue('');
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

export default PagesAPIs;
