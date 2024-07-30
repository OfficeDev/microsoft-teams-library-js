import React, { useState } from 'react';
import { ApiComponent } from '../components/sample/ApiComponents';
import { people, SdkError } from '@microsoft/teams-js';
import { useDragAndDrop } from '../utils/UseDragAndDrop';

interface SelectPeopleInput {
  title?: string;
  setSelected?: string[];
  openOrgWideSearchInChatOrChannel?: boolean;
  singleSelect?: boolean;
}

export const people_CheckPeopleCapability = async (): Promise<void> => {
  console.log('Executing CheckPeopleCapability...');

  try {
    const result = people.isSupported();
    if (result) {
      console.log('People module is supported. People is supported on Teams Web, Teams Desktop, and Teams (versions under 23247.720.2421.8365) Mobile');
    } else {
      console.log('People module is not supported. People is not supported on M365 Web, Outlook Web, M365 Desktop, Outlook Desktop, M365 Mobile, or Outlook Mobile.');
      throw new Error('People capability is not supported');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error checking People capability:', errorMessage);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
};

export const people_SelectPeople = async (input?: SelectPeopleInput): Promise<string> => {
  console.log('Executing SelectPeople with input:', JSON.stringify(input, null, 2));

  try {
    const result = await new Promise<any>((resolve, reject) => {
      people.selectPeople((error: SdkError, result: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }, input);
    });

    console.log('SelectPeople result:', JSON.stringify(result, null, 2));
    return JSON.stringify(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('Error during SelectPeople operation:', errorMessage);
    throw new Error(`Failure: SelectPeople for People API - ${errorMessage}`);
  }
};

interface PeopleAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const PeopleAPIs: React.FC<PeopleAPIsProps> = ({ apiComponent, onDropToScenarioBox }) => {
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
        {selectedFunction === 'SelectPeople' && (
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

export default PeopleAPIs;
