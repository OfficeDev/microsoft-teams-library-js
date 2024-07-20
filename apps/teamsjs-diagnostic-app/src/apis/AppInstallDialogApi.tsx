import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { ApiComponent } from '../components/sample/ApiComponents';
import { appInstallDialog } from '@microsoft/teams-js';

export interface AppInstallDialogInput {
  appId: string;
}

export const appInstallDialog_CheckAppInstallCapability = async () => {
  console.log('Executing CheckAppInstallCapability...');
  try {
    const capabilityCheckResult = await appInstallDialog.isSupported();
    if (capabilityCheckResult) {
      console.log('App Install Dialog capability is supported.');
    } else {
      console.log('App Install Dialog capability is not supported.');
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error checking App Install Dialog capability:', error.message);
    }
  }
};

export const appInstallDialog_OpenAppInstallDialog = async (input: AppInstallDialogInput): Promise<string> => {
  console.log('Executing OpenAppInstallDialog with input:', input);
  try {
    const validateInput = (input: AppInstallDialogInput) => {
      if (!input.appId) {
        throw new Error('appId is required for OpenAppInstallDialog');
      }
      console.log('Input validation passed for appId:', input.appId);
    };

    validateInput(input);

    const submit = async (input: AppInstallDialogInput): Promise<string> => {
      console.log('Submitting OpenAppInstallDialog with appId:', input.appId);
      const result = await appInstallDialog.openAppInstallDialog(input);
      console.log('OpenAppInstallDialog called with result:', result);
      return 'called';
    };

    return await submit(input);

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in OpenAppInstallDialog:', error.message);
    }
    return 'error';
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
