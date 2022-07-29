import { search } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

//import { search } from '../../../../packages/teams-js/src/public/search';
import { ApiWithoutInput } from './utils';

const RegisterHandlers = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'search_registerHandlers',
    title: 'Search Register Handlers',
    onClick: async setResult => {
      const onChange = (onChangeHandler: search.SearchQuery): void => {
        console.log(onChangeHandler.searchTerm);
      };
      const onClosed = (onClosedHandler: search.SearchQuery): void => {
        console.log(onClosedHandler);
      };
      const onExecute = (onExecuteHandler: search.SearchQuery): void => {
        console.log(onExecuteHandler);
      };
      setResult('register handlers');

      search.registerHandlers(onChange, onClosed, onExecute);
      return 'recieved';
    },
  });

const SearchAPIs = (): ReactElement => (
  <>
    <h1>search</h1>
    <RegisterHandlers />
  </>
);

export default SearchAPIs;
