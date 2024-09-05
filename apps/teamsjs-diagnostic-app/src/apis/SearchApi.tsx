import React from 'react';
import { ApiComponent } from '../components/sample/ApiComponents';
import { search } from '@microsoft/teams-js';
import ApiComponentWrapper from '../utils/ApiComponentWrapper';

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

const SearchAPIs: React.FC<SearchAPIsProps> = (props) => {
  return (
    <ApiComponentWrapper
      apiComponent={props.apiComponent}
      onDropToScenarioBox={props.onDropToScenarioBox}
    />
  );
};

export default SearchAPIs;
