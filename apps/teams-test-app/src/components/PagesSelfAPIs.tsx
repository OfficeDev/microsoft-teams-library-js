import { pages } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const NavigateTo = (): React.ReactElement =>
  ApiWithTextInput<pages.NavigateToSelfParams>({
    name: 'navigateTo',
    title: 'Navigate To',
    onClick: {
      validateInput: (input) => {
        if (!input.pageId) {
          throw new Error('PageID are required.');
        }
      },
      submit: async (input) => {
        await pages.self.navigateTo(input);
        return 'Completed';
      },
    },
  });

const PagesSelfAPIs = (): ReactElement => (
  <ModuleWrapper title="Pages.self">
    <NavigateTo />
  </ModuleWrapper>
);

export default PagesSelfAPIs;
