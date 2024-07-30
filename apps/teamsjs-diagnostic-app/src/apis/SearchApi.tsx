import React, { useState } from 'react';
import { ApiComponent } from '../components/sample/ApiComponents';
import { search } from '@microsoft/teams-js';
import { useDragAndDrop } from '../utils/UseDragAndDrop';

export function search_RegisterHandlers() {
  return new Promise<void>((resolve, reject) => {
    console.log('Executing RegisterHandler...');
    try {
      const onChange = (onChangeHandler: search.SearchQuery): void => {
        console.log('Search query changed:', onChangeHandler.searchTerm);
      };
      const onClosed = (onClosedHandler: search.SearchQuery): void => {
        console.log('Search closed:', onClosedHandler.searchTerm);
      };
      const onExecute = (onExecuteHandler: search.SearchQuery): void => {
        console.log('Search executed:', onExecuteHandler.searchTerm);
      };
      search.registerHandlers(onClosed, onExecute, onChange);
      console.log('Search handlers registered successfully');
      resolve();
    } catch (error) {
      console.log('Error registering search handlers:', JSON.stringify(error, null, 2));
      console.log('Search API is not supported in this current environment');
      reject(error);
      throw error;
    }
  });
}

export const search_CloseSearch = async (): Promise<void> => {
  console.log('Executing CloseSearch...');

  try {
    const result = search.isSupported();
    if (result) {
      console.log('Search module is supported');
    } else {
      console.log('Search API is not supported in this current environment');
      throw new Error('Search API not supported');
    }
  } catch (error) {
    console.log('Error closing search:', JSON.stringify(error, null, 2));
    throw error;
  }

  try {
    await search.closeSearch();
    console.log('Search successfully closed');
  } catch (error) {
    console.log('Error closing search:', JSON.stringify(error, null, 2));
    throw error;
  }
};

interface SearchAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const SearchAPIs: React.FC<SearchAPIsProps> = ({ apiComponent, onDropToScenarioBox }) => {
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');

  const handleFunctionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFunc = event.target.value;
    setSelectedFunction(selectedFunc);
    setInputValue('');
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
      </div>
    </div>
  );
};

export default SearchAPIs;
