import { search } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const RegisterHandlers = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'search_registerHandlers',
    title: 'Search Register Handlers',
    onClick: async (setResult) => {
      const onChange = (onChangeHandler: search.SearchQuery): void => {
        console.log(onChangeHandler.searchTerm);

        setResult('Update your application with the changed search query: ' + onChangeHandler.searchTerm);
      };
      const onClosed = (onClosedHandler: search.SearchQuery): void => {
        console.log(onClosedHandler.searchTerm);
        setResult(
          'Update your application to handle the search experience being closed. Last query: ' +
            onClosedHandler.searchTerm,
        );
      };
      const onExecute = (onExecuteHandler: search.SearchQuery): void => {
        console.log(onExecuteHandler.searchTerm);
        setResult('Update your application to handle an executed search result: ' + onExecuteHandler.searchTerm);
      };
      setResult('register handlers');

      search.registerHandlers(onClosed, onExecute, onChange);
      return 'received';
    },
  });

const SearchAPIs = (): ReactElement => (
  <>
    <ModuleWrapper title="Search">
      <RegisterHandlers />
    </ModuleWrapper>
  </>
);

export default SearchAPIs;
