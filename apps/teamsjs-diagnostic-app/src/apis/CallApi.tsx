import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { ApiComponent } from '../components/sample/ApiComponents';
import { call } from '@microsoft/teams-js';
import { useDragAndDrop } from '../utils/UseDragAndDrop';

export const call_CheckCallCapability = async (): Promise<void> => {
  console.log('Executing CheckCallCapability...');
  try {
    const result = await call.isSupported();
    if (result) {
      console.log('Call capability is supported. Call is supported on Teams Web, Outlook Web, Teams Desktop, Outlook Desktop, and Teams Mobile.');
    } else {
      console.log('Call capability is not supported. Call is not supported on M365 Web, M365 Desktop, Outlook Desktop, M365 Mobile, or Outlook Mobile.');
      throw new Error('Call capability is not supported');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error checking Call capability:', errorMessage);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
};

export const call_StartCall = async (input: string): Promise<string> => {
  console.log('Executing StartCall with input:', input);

  try {
    const validateInput = (input: string) => {
      if (!input) {
        console.log('Input is required for StartCall');
        throw new Error('Input is required for StartCall');
      }
      console.log('Input validation passed');
    };

    validateInput(input);

    const result = await call.startCall({ targets: [input] });
    console.log('Call started successfully. StartCall result:', result);
    return 'Call started successfully';
  } catch (error) {
    console.log('Error in StartCall:', error);
    throw error;
  }
};

interface CallAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const CallAPIs: React.FC<CallAPIsProps> = ({ apiComponent, onDropToScenarioBox }) => {
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
        {selectedFunction === 'StartCall' && (
          <div className="input-container">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Enter input for StartCall"
            />
            <button onClick={() => setInputValue(apiComponent.defaultInput || '')}>Default</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallAPIs;
