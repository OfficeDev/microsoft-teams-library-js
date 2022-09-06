import { pages } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const NavigateTo = (): React.ReactElement =>
  ApiWithTextInput<pages.NavigationWithinAnAppParams>({
    name: 'navigateTo',
    title: 'Navigate To',
    onClick: {
      validateInput: (input) => {
        if (!input.pageId) {
          throw new Error('PageID are required.');
        }
      },
      submit: async (input) => {
        await pages.navigation.withinAnApp(input);
        return 'Completed';
      },
    },
  });

const PagesNavigationAPIs = (): ReactElement => (
  <ModuleWrapper title="Pages.navigation">
    <NavigateTo />
  </ModuleWrapper>
);

export default PagesNavigationAPIs;
