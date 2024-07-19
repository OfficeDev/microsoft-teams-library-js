import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { ApiComponent } from '../components/sample/ApiComponents';
import { appInstallDialog } from '@microsoft/teams-js';

export const appInstallDialog_CheckAppInstallCapability = async () => {
  console.log('Executing CheckAppInstallCapability...');
  try {
    const isSupported = appInstallDialog.isSupported();
    console.log(`AppInstallDialog module ${isSupported ? 'is' : 'is not'} supported`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(`Error: ${error.message}`);
    } else {
      console.log(`Unknown error occurred`);
    }
  }
};

export const appInstallDialog_OpenAppInstallDialog = async (input?: string) => {
  console.log('Executing OpenAppInstallDialog with input:', input);
  try {
    const parsedInput = input ? JSON.parse(input) : {};
    if (!parsedInput.appId) {
      throw new Error('appId is required');
    }
    console.log('Parsed input:', parsedInput);
    await appInstallDialog.openAppInstallDialog(parsedInput);
    console.log('OpenAppInstallDialog called successfully');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(`Error: ${error.message}`);
    } else {
      console.log(`Unknown error occurred`);
    }
  }
};

interface AppInstallDialogAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (apiComponent: ApiComponent, func: string, result: string) => void;
}

const AppInstallDialogAPIs: React.FC<AppInstallDialogAPIsProps> = ({ apiComponent, onDropToScenarioBox }) => {
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');

  const handleFunctionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFunc = event.target.value;
    setSelectedFunction(selectedFunc);
    if (selectedFunc === 'OpenAppInstallDialog') {
      setInputValue(apiComponent.defaultInput || '');
    } else {
      setInputValue('');
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'API',
    item: () => ({
      api: apiComponent,
      func: selectedFunction,
      input: selectedFunction === 'OpenAppInstallDialog' ? inputValue : '',
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [selectedFunction, inputValue]);

  const handleDrop = async () => {
    let result;
    try {
      if (selectedFunction === 'CheckAppInstallCapability') {
        await appInstallDialog_CheckAppInstallCapability();
        result = 'CheckAppInstallCapability executed successfully';
      } else if (selectedFunction === 'OpenAppInstallDialog') {
        await appInstallDialog_OpenAppInstallDialog(inputValue);
        result = 'OpenAppInstallDialog executed successfully';
      } else {
        result = 'Function not implemented';
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        result = `Error: ${error.message}`;
      } else {
        result = 'Unknown error occurred';
      }
    }
    onDropToScenarioBox(apiComponent, selectedFunction, result);
  };

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
        {selectedFunction === 'OpenAppInstallDialog' && (
          <div className="input-container">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Enter input for OpenAppInstallDialog"
            />
            <button onClick={() => setInputValue(apiComponent.defaultInput || '')}>Default</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppInstallDialogAPIs;
