import React, { useState } from 'react';
import { useDragAndDrop } from '../utils/UseDragAndDrop';
import { ApiComponent } from '../components/sample/ApiComponents';
import { pages } from '@microsoft/teams-js';

export const pagesTabs_CheckPagesTabsCapability = async (): Promise<void> => {
  console.log('Executing CheckPagesTabsCapability...');
  try {
    const result = pages.isSupported();
    if (result) {
      console.log('Pages Tabs module is supported. Pages Tabs is supported on Teams Web and Teams Desktop.');
    } else {
      console.log('Pages Tabs module is not supported. Pages Tabs is not supported on M365 Web, Outlook Web, M365 Desktop, Outlook Desktop, Teams Mobile, M365 Mobile, or Outlook Mobile.');
      throw new Error('Pages Tabs capability is not supported');
    }
  } catch (error) {
    console.log('Error checking Pages Tabs capability:', error);
    throw error;
  }
};

export const pagesTabs_NavigateToTab = async (input: any): Promise<void> => {
  console.log('Executing NavigateToTab with input...');
  try {
    await pages.tabs.navigateToTab(input);
    console.log('Navigation to tab completed successfully.');
  } catch (error) {
    console.log('Error navigating to tab:', JSON.stringify(error, null, 2));
    throw error;
  }
};

export const pagesTabs_GetTabInstances = async (input: any): Promise<void> => {
  console.log('Executing GetTabInstances with input...');
  try {
    const result = await pages.tabs.getTabInstances(input);
    console.log('Tab instances retrieved:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('Error getting tab instances:', error);
    throw error;
  }
};

export const pagesTabs_GetMruTabInstances = async (input: any): Promise<void> => {
  console.log('Executing GetMruTabInstances with input...');
  try {
    const result = await pages.tabs.getMruTabInstances(input);
    console.log('MRU tab instances retrieved:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('Error getting MRU tab instances:', JSON.stringify(error, null, 2));
    throw error;
  }
};

interface PagesTabsAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const PagesTabsAPIs: React.FC<PagesTabsAPIsProps> = ({ apiComponent, onDropToScenarioBox }) => {
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');

  const functionsRequiringInput = [
    'NavigateToTab', 
    'GetTabInstances', 
    'GetMruTabInstances',
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

export default PagesTabsAPIs;
