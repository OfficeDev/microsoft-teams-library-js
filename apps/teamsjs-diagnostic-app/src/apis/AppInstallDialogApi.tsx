import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { ApiComponent } from '../components/sample/ApiComponents';
import { appInstallDialog } from '@microsoft/teams-js';
import * as microsoftTeams from '@microsoft/teams-js';
import { useDragAndDrop } from '../utils/UseDragAndDrop';

export interface AppInstallDialogInput {
  appId: string;
}

export const appInstallDialog_CheckAppInstallCapability = async (): Promise<void> => {
  console.log('Executing CheckAppInstallCapability...');
  try {
    const result = await appInstallDialog.isSupported();
    if (result) {
      console.log('AppInstallDialog capability is supported. AppInstall Dialog is supported on Teams Web, Teams Desktop, and Teams Mobile.');
    } else {
      console.log('AppInstallDialog capability is not supported. AppInstallDialog is not supported on Outlook Web, Outlook Desktop, Outlook Mobile, or M365 Mobile.');
      throw new Error('AppInstallDialog capability is not supported');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error checking App Install Dialog capability:', errorMessage);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
};

export function appInstallDialog_OpenAppInstallDialog(input: { appId: string }) {
  return new Promise<void>((resolve, reject) => {
    if (!input.appId) {
      console.log('App ID is missing');
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

      console.log('App install dialog opened successfully');
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
          {apiComponent.functions.map((func, index) => (
            <option key={index} value={func.name}>
              {func.name}
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
