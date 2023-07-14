import {
  getMruTabInstances,
  getTabInstances,
  navigateToTab,
  pages,
  TabInformation,
  TabInstance,
  TabInstanceParameters,
} from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const NavigateToTab = (): React.ReactElement =>
  ApiWithTextInput<TabInstance>({
    name: 'navigateToTab',
    title: 'Navigate To Tab',
    onClick: {
      validateInput: (input) => {
        if (!input.tabName) {
          throw new Error('tabName is required');
        }
      },
      submit: {
        withPromise: async (input) => {
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
    onClick: {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      validateInput: () => {},
      submit: {
        withPromise: async (input) => {
          const result = await pages.tabs.getTabInstances(input);
          return JSON.stringify(result);
        },
        withCallback: (input, setResult) => {
          const callback = (tabInfo: TabInformation): void => {
            setResult(JSON.stringify(tabInfo));
          };
          getTabInstances(callback, input);
        },
      },
    },
  });

const GetMruTabInstances = (): React.ReactElement =>
  ApiWithTextInput<TabInstanceParameters>({
    name: 'getMRUTabInstance',
    title: 'Get MRU Tab Instance',
    onClick: {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      validateInput: () => {},
      submit: {
        withPromise: async (input) => {
          const result = await pages.tabs.getMruTabInstances(input);
          return JSON.stringify(result);
        },
        withCallback: (input, setResult) => {
          const callback = (tabInfo: TabInformation): void => {
            setResult(JSON.stringify(tabInfo));
          };
          getMruTabInstances(callback, input);
        },
      },
    },
  });

const CheckPagesTabsCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkPageTabsCapability',
    title: 'Check Page Tabs Call',
    onClick: async () => `Pages.tabs module ${pages.tabs.isSupported() ? 'is' : 'is not'} supported`,
  });

const PagesTabsAPIs = (): ReactElement => (
  <ModuleWrapper title="Pages.tabs">
    <NavigateToTab />
    <GetTabInstances />
    <GetMruTabInstances />
    <CheckPagesTabsCapability />
  </ModuleWrapper>
);

export default PagesTabsAPIs;
