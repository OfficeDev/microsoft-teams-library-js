import React, { useState } from 'react';
import { ApiComponent } from '../components/sample/ApiComponents';
import { secondaryBrowser } from '@microsoft/teams-js';
import { useDragAndDrop } from '../utils/UseDragAndDrop';

export const secondaryBrowser_CheckSecondaryBrowserCapability = async (): Promise<void> => {
  console.log('Executing CheckSecondaryBrowserCapability...');
  try {
    const isSupported = secondaryBrowser.isSupported();
    if (isSupported) {
      console.log('Secondary Browser module is supported. Secondary Browser is supported on M365 Mobile and Outlook Mobile.');
    } else {
      console.log('Secondary Browser module is not supported. Secondary Browser is only supported on M365 Mobile and Outlook Mobile.');
      throw new Error('Secondary Browser module is not supported');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('Error checking Secondary Browser capability:', errorMessage);
    if (error instanceof Error) {
      console.log('Stack trace:', error.stack);
    }
    throw error;
  }
};

export const secondaryBrowser_Open = async (input: string): Promise<void> => {
  console.log('Executing Open...');
  try{
    if (typeof input !== 'string') {
        throw new Error('Input should be a string');
      }
      // validate that input should also be a valid URL
      new URL(input);
      await secondaryBrowser.open(new URL(input));
  }catch (error){
    console.log('Error opening secondary browser:', JSON.stringify(error, null, 2));
    console.log('Secondary Browser module is not supported. Secondary Browser is only supported on M365 Mobile and Outlook Mobile.');
    throw error;
  }
};
interface SecondaryBrowserAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const SecondaryBrowserAPIs: React.FC<SecondaryBrowserAPIsProps> = ({ apiComponent, onDropToScenarioBox }) => {
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

  const handleDefaultInput = () => {
    const defaultInput = apiComponent.defaultInput || '';
    setInputValue(defaultInput);
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
        {selectedFunction === 'Open' && (
          <div className="input-container">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={`Enter input for ${selectedFunction}`}
            />
            <button onClick={handleDefaultInput}>
              Default
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecondaryBrowserAPIs;
