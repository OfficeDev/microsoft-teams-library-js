import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { ApiComponent } from '../components/sample/ApiComponents';
import { appInstallDialog } from '@microsoft/teams-js';
import * as microsoftTeams from '@microsoft/teams-js';
import { useDragAndDrop } from '../utils/UseDragAndDrop';

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
      console.log('Error checking App Install Dialog capability:', error.message);
    }
    throw error;
  }
};

export function appInstallDialog_OpenAppInstallDialog(input: { appId: string }) {
  return new Promise<void>((resolve, reject) => {
    if (!input.appId) {
      console.error('App ID is missing');
      return reject('App ID is required');
    }

    console.log(`Starting OpenAppInstallDialog with appId: ${input.appId}`);

    try {
      const appId = input.appId;
      // SDK/API call to open install dialog
      microsoftTeams.tasks.startTask({
        title: 'Install App',
        height: 600,
        width: 400,
        url: `https://teams.microsoft.com/l/app/${appId}`,
      });

      console.log('App install dialog started successfully');
      resolve();
    } catch (error) {
      console.error('Error opening app install dialog:', error);
      reject(error);
    }
  });
}

interface AppInstallDialogAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const AppInstallDialogAPIs: React.FC<AppInstallDialogAPIsProps> = ({ apiComponent, onDropToScenarioBox }) => {
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
