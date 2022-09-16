import { pages } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const NavigateTo = (): React.ReactElement =>
  ApiWithTextInput<pages.NavigateWithinAppParams>({
    name: 'navigateTo',
    title: 'Navigate To',
    onClick: {
      validateInput: (input) => {
        if (!input.pageId) {
          throw new Error('PageID are required.');
        }
      },
      submit: async (input) => {
        await pages.navigate.to(input);
        return 'Completed';
      },
    },
  });

const NavigateToDefaultPage = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'navigateToDefaultPage',
    title: 'Navigate To Default Page',
    onClick: async (setResult) => {
      await pages.navigate.toDefaultPage();
      setResult('Completed');
      return 'Completed';
    },
  });

const PagesNavigationAPIs = (): ReactElement => (
  <ModuleWrapper title="Pages.navigate">
    <NavigateTo />
    <NavigateToDefaultPage />
  </ModuleWrapper>
);

export default PagesNavigationAPIs;
