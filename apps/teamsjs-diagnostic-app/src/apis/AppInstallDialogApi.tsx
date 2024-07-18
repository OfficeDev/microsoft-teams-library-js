import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { ApiComponent } from '../components/sample/ApiComponents';
import { appInstallDialog } from '@microsoft/teams-js';

export const appInstallDialog_CheckAppInstallCapability = async (): Promise<string> => {
  try {
    console.log('Executing appInstallDialog_CheckAppInstallCapability...');
    const result = `AppInstallDialog module ${appInstallDialog.isSupported() ? 'is' : 'is not'} supported`;
    console.log('appInstallDialog_CheckAppInstallCapability result:', result);
    return result;
  } catch (error) {
    console.error('Error in appInstallDialog_CheckAppInstallCapability:', error);
    throw error;
  }
};

export const appInstallDialog_OpenAppInstallDialog = async (input?: string): Promise<string> => {
  try {
    console.log('Executing appInstallDialog_OpenAppInstallDialog with input:', input);
    const parsedInput = input ? JSON.parse(input) : {};
    console.log('Parsed input for appInstallDialog_OpenAppInstallDialog:', parsedInput);
    
    await appInstallDialog.openAppInstallDialog(parsedInput);
    const result = 'OpenAppInstallDialog called';
    console.log('appInstallDialog_OpenAppInstallDialog result:', result);
    return result;
  } catch (error) {
    console.error('Error in appInstallDialog_OpenAppInstallDialog:', error);
    throw error;
  }
};

interface AppInstallDialogAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (apiComponent: ApiComponent, func: string, input: string) => void;
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
