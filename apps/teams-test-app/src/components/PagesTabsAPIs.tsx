import { pages, TabInstance } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';

const NavigateToTab = (): React.ReactElement =>
  ApiWithTextInput<TabInstance>({
    name: 'navigateToTab',
    title: 'Navigate To Tab',
    onClick: {
      validateInput: input => {
        if (!input.tabName) {
          throw new Error('tabName is required');
        }
      },
      submit: async input => {
        await pages.tabs.navigateToTab(input);
        return 'Completed';
      },
    },
  });

const CheckPagesTabsCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkPagesTabsCapability',
    title: 'Check Page Tabs Call',
    onClick: async () => `Pages.tabs module ${pages.tabs.isSupported() ? 'is' : 'is not'} supported`,
  });

const PagesTabsAPIs = (): ReactElement => (
  <>
    <h1>pages.tabs</h1>
    <NavigateToTab />
    <CheckPagesTabsCapability />
  </>
);

export default PagesTabsAPIs;
