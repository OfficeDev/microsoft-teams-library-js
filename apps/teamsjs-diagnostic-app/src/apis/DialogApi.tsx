import React, { useState } from 'react';
import { ApiComponent } from '../components/sample/ApiComponents';
import { dialog } from '@microsoft/teams-js';
import { useDragAndDrop } from '../utils/UseDragAndDrop';

export const dialog_CheckDialogCapability = async (): Promise<void> => {
  console.log('Executing CheckDialogCapability...');
  try {
    const result = await dialog.isSupported();
    if (result) {
      console.log('Dialog module is supported. Dialog is supported on all platforms except M365 Mobile and Outlook Mobile.');
    } else {
      console.log('Dialog module is not supported. Dialog is not supported on M365 Mobile or Outlook Mobile.');
      throw new Error('Dialog module is not supported');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error checking Dialog capability:', errorMessage);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
};
interface DialogAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const DialogAPIs: React.FC<DialogAPIsProps> = ({ apiComponent, onDropToScenarioBox }) => {
  const [selectedFunction, setSelectedFunction] = useState<string>('');

  const handleFunctionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFunction(event.target.value);
  };

  const { isDragging, drag } = useDragAndDrop('API', { api: apiComponent, func: selectedFunction});

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
      </div>
    </div>
  );
};

export default DialogAPIs;
