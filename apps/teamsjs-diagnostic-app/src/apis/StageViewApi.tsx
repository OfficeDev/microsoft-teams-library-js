import React, { useState } from 'react';
import { ApiComponent } from '../components/sample/ApiComponents';
import { stageView } from '@microsoft/teams-js';
import { useDragAndDrop } from '../utils/UseDragAndDrop';

interface StageViewInput {
  appId: string;
  contentUrl: string;
  threadId: string;
  title: string;
  websiteUrl?: string;
  entityId?: string;
  openMode?: stageView.StageViewOpenMode;
}

export const stageView_CheckStageViewCapability = async (): Promise<void> => {
  console.log('Executing CheckStageViewCapability...');

  try {
    const result = stageView.isSupported();
    if (result) {
      console.log('Stage View module is supported. Stage View is supported on Teams Web and Teams Desktop.');
    } else {
      console.log('Stage View module is not supported. Stage View is not supported on M365 Web, Outlook Web, M365 Desktop, Outlook Desktop, Teams Mobile, M365 Mobile, or Outlook Mobile.');
      throw new Error('StageView capability is not supported');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error checking Stage View capability:', errorMessage);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
};

export const stageView_OpenStageView = async (input: StageViewInput): Promise<string> => {
  console.log('Executing OpenStageView...');
  try {
    if (!input.appId) {
      throw new Error('appId is required.');
    }
    if (!input.contentUrl) {
      throw new Error('contentUrl is required.');
    }
    if (!input.threadId) {
      throw new Error('threadId is required.');
    }
    if (!input.title) {
      throw new Error('title is required.');
    }

    await stageView.open(input);
    return 'Success';
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('Error opening stage view:', errorMessage);
    throw error;
  }
};

interface StageViewAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const StageViewAPIs: React.FC<StageViewAPIsProps> = ({ apiComponent, onDropToScenarioBox }) => {
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
        {selectedFunction === 'OpenStageView' && (
          <div className="input-container">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={`Enter input for ${selectedFunction}`}
            />
            <button onClick={() => setInputValue(apiComponent.defaultInput || '')}>Default</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StageViewAPIs;
