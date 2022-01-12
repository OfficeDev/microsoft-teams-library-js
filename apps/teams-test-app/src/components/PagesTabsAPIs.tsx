import { navigateToTab, pages, TabInstance, TabInstanceParameters } from '@microsoft/teams-js';
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
      submit: {
        withPromise: async input => {
          await pages.tabs.navigateToTab(input);
          return 'Completed';
        },
        withCallback: (input, setResult) => {
          const onComplete = (status: boolean, reason?: string): void => {
            if (!status) {
              if (reason) {
                setResult(JSON.stringify(reason));
              } else {
                setResult("Status is false but there's not reason?! This shouldn't happen.");
              }
            } else {
              setResult('Completed');
            }
          };
          navigateToTab(input, onComplete);
        },
      },
    },
  });

const GetTabInstances = (): React.ReactElement =>
  ApiWithTextInput<TabInstanceParameters>({
    name: 'getTabInstance',
    title: 'Get Tab Instance',
    onClick: async input => {
      const result = await pages.tabs.getTabInstances(input);
      return JSON.stringify(result);
    },
  });

const GetMruTabInstances = (): React.ReactElement =>
  ApiWithTextInput<TabInstanceParameters>({
    name: 'getMRUTabInstance',
    title: 'Get MRU Tab Instance',
    onClick: async input => {
      const result = await pages.tabs.getMruTabInstances(input);
      return JSON.stringify(result);
    },
  });

const CheckPagesTabsCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkPageTabsCapability',
    title: 'Check Page Tabs Call',
    onClick: async () => `Pages.tabs module ${pages.tabs.isSupported() ? 'is' : 'is not'} supported`,
  });

const PagesTabsAPIs = (): ReactElement => (
  <>
    <h1>pages.tabs</h1>
    <NavigateToTab />
    <GetTabInstances />
    <GetMruTabInstances />
    <CheckPagesTabsCapability />
  </>
);

export default PagesTabsAPIs;
