import React, { useState } from 'react';
import { ApiComponent } from '../components/sample/ApiComponents';
import { profile } from '@microsoft/teams-js';
import { useDragAndDrop } from '../utils/UseDragAndDrop';

export const profile_CheckProfileCapability = async (): Promise<void> => {
    console.log('Executing CheckProfileCapability...');
    try {
      const result = await profile.isSupported();
      if (result) {
        console.log('Profile module is supported. Profile is supported on new Teams (Version 23247.720.2421.8365 and above) Web, Outlook Web, new Teams (Version 23247.720.2421.8365 and above) Desktop, and Outlook Desktop');
      } else {
        console.log('Profile module is not supported.Profile is not supported on Teams versions under 23247.720.2421.8365, M365, or any Mobile platforms.');
        throw new Error('Profile capability is not supported');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error checking Profile capability:', errorMessage);
      if (error instanceof Error) {
        console.error('Stack trace:', error.stack);
      }
      throw error;
    }
  };
  
  export function profile_ShowProfile(input: profile.ShowProfileRequest) {
    return new Promise<void>((resolve, reject) => {
      if (!input) {
        console.log('ShowProfileRequest input is missing');
        return reject('ShowProfileRequest is required');
      }
  
      console.log('Starting ShowProfile with input:', input);
  
      try {
        profile.showProfile(input);
        console.log('Profile displayed successfully');
        resolve();
      } catch (error) {
        console.error('Error displaying profile:', error);
        reject(error);
      }
    });
  }

interface ProfileAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const ProfileAPIs: React.FC<ProfileAPIsProps> = ({ apiComponent, onDropToScenarioBox }) => {
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
        {selectedFunction === 'ShowProfile' && (
          <div className="input-container">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Enter input for ShowProfile"
            />
            <button onClick={() => setInputValue(apiComponent.defaultInput || '')}>Default</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileAPIs;
