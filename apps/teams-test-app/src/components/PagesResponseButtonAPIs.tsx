import { pages } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const ShowResponseButton = (): React.ReactElement =>
  ApiWithTextInput<pages.responseButton.ResponseInfo>({
    name: 'showResponseButton',
    title: 'Show Response Button',
    onClick: {
      validateInput: (input) => {
        if (!input) {
          throw new Error('reponseInfo is required');
        }
      },
      submit: async (input) => {
        const result = await pages.responseButton.showResponseButton(input);
        return JSON.stringify(result);
      },
    },
  });

const HideResponseButton = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'uploadImages',
    title: 'Upload Images',
    onClick: async () => {
      await pages.responseButton.hideResponseButton();
      return 'Completed';
    },
  });

const RegisterResponseButtonEventHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerResponseButtonEventHandler',
    title: 'Register Response Button Event Handler',
    onClick: async (setResult) => {
      pages.responseButton.responseButtonEventHandler((): void => {
        setResult('responseButtonEventHandler successfully called');
      });
      return 'Completed';
    },
  });

const CheckPagesResponseButtonCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkPagesResponseButtonCapability',
    title: 'Check Pages ResponseButton Capability',
    onClick: async () =>
      `Pages.responseButton module ${pages.responseButton.isSupported() ? 'is' : 'is not'} supported`,
  });

const PagesResponseButtonAPIs = (): ReactElement => (
  <ModuleWrapper title="Response Button">
    <ShowResponseButton />
    <HideResponseButton />
    <RegisterResponseButtonEventHandler />
    <CheckPagesResponseButtonCapability />
  </ModuleWrapper>
);

export default PagesResponseButtonAPIs;
