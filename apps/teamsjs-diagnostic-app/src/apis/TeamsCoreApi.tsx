import React, { useState } from 'react';
import { ApiComponent } from '../components/sample/ApiComponents';
import { teamsCore } from '@microsoft/teams-js';
import { useDragAndDrop } from '../utils/UseDragAndDrop';

export const teamsCore_CheckTeamsCoreCapability = async (): Promise<void> => {
  console.log('Executing CheckTeamsCoreCapability...');
  try {
    const result = await teamsCore.isSupported();
    if (result) {
      console.log('Teams Core module is supported. Teams Core is supported on Teams Web, Outlook Web, Teams Desktop, and Teams Mobile.');
    } else {
      console.log('Teams Core module is not supported. Teams Core is only supported on Teams Web, Outlook Web, Teams Desktop, and Teams Mobile.');
      throw new Error('Teams Core module is not supported');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error checking Teams Core capability:', errorMessage);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
};

export const teamsCore_EnablePrintCapability = async (): Promise<void> => {
  console.log('Executing EnablePrintCapability...');
  try {
    await teamsCore.enablePrintCapability();
    console.log('Print capability enabled.');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error enabling print capability:', errorMessage);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
};

export const teamsCore_Print = async (): Promise<void> => {
  console.log('Executing Print with input...');
  try {
    await teamsCore.print();
    console.log('Successfully printed');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error executing print:', errorMessage);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
};

export const teamsCore_RegisterOnLoadHandler = async (): Promise<void> => {
  console.log('Executing RegisterOnLoadHandler...');
  try {
    teamsCore.registerOnLoadHandler((context) => {
      console.log('On load handler called with context:', context);
    });
    console.log('On load handler registered.');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error registering on load handler:', errorMessage);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
};

export const teamsCore_RegisterBeforeUnloadHandler = async (input: string): Promise<void> => {
  console.log('Executing RegisterBeforeUnloadHandler with input...');
  try {
    const delay = parseInt(input, 10);
    if (isNaN(delay)) {
      throw new Error('Input should be a number');
    }

    teamsCore.registerBeforeUnloadHandler((readyToUnload) => {
      const canUnload = true;
      if (canUnload) {
        setTimeout(() => {
          readyToUnload();
        }, delay);
        console.log(`Before unload handler registered; calling readyToUnload in ${delay / 1000} seconds`);
      } else {
        console.log('Unload operation blocked.');
      }
      return canUnload;
    });

    console.log('Before unload handler registered with delay:', delay);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error registering before unload handler:', errorMessage);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
};

interface TeamsCoreAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const TeamsCoreAPIs: React.FC<TeamsCoreAPIsProps> = ({ apiComponent, onDropToScenarioBox }) => {
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
        {selectedFunction === 'RegisterBeforeUnloadHandler' && (
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

export default TeamsCoreAPIs;
