import { pages } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const NavigateTo = (): React.ReactElement =>
  ApiWithTextInput<pages.currentApp.NavigateWithinAppParams>({
    name: 'navigateTo',
    title: 'Navigate To',
    onClick: {
      validateInput: (input) => {
        if (!input.pageId) {
          throw new Error('PageID are required.');
        }
      },
      submit: async (input) => {
        await pages.currentApp.navigateTo(input);
        return 'Completed';
      },
    },
  });

const NavigateToDefaultPage = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'navigateToDefaultPage',
    title: 'Navigate To Default Page',
    onClick: async (setResult) => {
      await pages.currentApp.navigateToDefaultPage();
      setResult('Completed');
      return 'Completed';
    },
  });

const CheckPageCurrentAppCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkPageCurrentAppCapability',
    title: 'Check Page currentApp Call',
    onClick: async () => `Pages.currentApp module ${pages.currentApp.isSupported() ? 'is' : 'is not'} supported`,
  });
const PagesCurrentAppAPIs = (): ReactElement => (
  <ModuleWrapper title="Pages.currentApp">
    <NavigateTo />
    <NavigateToDefaultPage />
    <CheckPageCurrentAppCapability />
  </ModuleWrapper>
);

export default PagesCurrentAppAPIs;
