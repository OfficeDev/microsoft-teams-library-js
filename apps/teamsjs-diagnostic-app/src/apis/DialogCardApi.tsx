import React, { useState } from 'react';
import { ApiComponent } from '../components/sample/ApiComponents';
import { AdaptiveCardDialogInfo, dialog } from '@microsoft/teams-js';
import { useDragAndDrop } from '../utils/UseDragAndDrop';

export const dialogCard_CheckDialogAdaptiveCardCapability = async (): Promise<void> => {
  console.log('Executing checkDialogAdaptiveCardCapability...');
  try {
    const isSupported = dialog.adaptiveCard.isSupported();
    console.log('Dialog Adaptive Card support check result:', isSupported);
    if (isSupported) {
      console.log('Dialog Adaptive Card module is supported. Dialog Adaptive Card is supported on all platforms except M365 Mobile and Outlook Mobile.');
    } else {
      console.log('Dialog Adaptive Card module is not supported. Dialog Adaptive Card is not supported on M365 Mobile or Outlook Mobile.');
      throw new Error('Dialog Adaptive Card module is not supported');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('Error checking Dialog Adaptive Card capability:', errorMessage);
    if (error instanceof Error) {
      console.log('Stack trace:', error.stack);
    }
    throw error;
  }
};

export const dialogCard_OpenAdaptiveCardDialog = (input: AdaptiveCardDialogInfo): Promise<void> => {
  console.log('Executing openAdaptiveCardDialog with input:', input);
  return new Promise((resolve, reject) => {
    try {
      console.log('Opening adaptive card dialog...');
      const onComplete = (resultObj: dialog.ISdkResponse): void => {
        if (resultObj.err) {
          if (resultObj.err === 'User cancelled/closed the task module.') {
            console.log('User cancelled/closed the task module.');
            resolve();
          } else {
            console.log('Error in adaptive card dialog result:', resultObj.err);
            reject(resultObj.err);
          }
        } else {
          console.log('Adaptive card dialog result:', resultObj.result);
          resolve();
        }
      };
      dialog.adaptiveCard.open(input, onComplete);
      console.log('Adaptive card dialog opened successfully');
    } catch (error) {
      console.log('Error opening adaptive card dialog:', error);
      reject(error);
      throw error;
    }
  });
};

interface DialogCardAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const DialogCardAPIs: React.FC<DialogCardAPIsProps> = ({ apiComponent, onDropToScenarioBox }) => {
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
        {selectedFunction === 'OpenAdaptiveCardDialog' && (
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

export default DialogCardAPIs;
