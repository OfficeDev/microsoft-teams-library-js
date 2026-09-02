import { contextualSearch } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { generateRegistrationMsg } from '../../App';
import { ApiWithoutInput, ApiWithTextInput } from '../utils';
import { ModuleWrapper } from '../utils/ModuleWrapper';

interface OpenContextualSearchInput {
  triggerSource?: string;
}

const ContextualSearchAPIs = (): ReactElement => {
  const CheckContextualSearchCapability = (): ReactElement =>
    ApiWithoutInput({
      name: 'checkContextualSearchCapability',
      title: 'Check if Contextual Search is supported',
      onClick: async () => `Contextual Search module ${contextualSearch.isSupported() ? 'is' : 'is not'} supported`,
    });

  const OpenContextualSearch = (): ReactElement =>
    ApiWithoutInput({
      name: 'openContextualSearch',
      title: 'Open Contextual Search',
      onClick: async () => {
        await contextualSearch.openContextualSearch();
        return 'contextualSearch.openContextualSearch() was called';
      },
    });

  const OpenContextualSearchWithTriggerSource = (): ReactElement =>
    ApiWithTextInput<OpenContextualSearchInput>({
      name: 'openContextualSearchWithTriggerSource',
      title: 'Open Contextual Search With Trigger Source',
      onClick: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        validateInput: (_input) => {},
        submit: async (input) => {
          await contextualSearch.openContextualSearch({
            triggerSource: input.triggerSource,
          });

          return 'contextualSearch.openContextualSearch() was called';
        },
      },
      defaultInput: JSON.stringify({
        triggerSource: 'testTriggerSource',
      }),
    });

  const CloseContextualSearch = (): ReactElement =>
    ApiWithoutInput({
      name: 'closeContextualSearch',
      title: 'Close Contextual Search',
      onClick: async () => {
        await contextualSearch.closeContextualSearch();
        return 'contextualSearch.closeContextualSearch() was called';
      },
    });

  const RegisterOpenedHandler = (): ReactElement =>
    ApiWithoutInput({
      name: 'registerOnContextualSearchOpenedHandler',
      title: 'Register Contextual Search Opened Handler',
      onClick: async (setResult) => {
        contextualSearch.registerOnContextualSearchOpenedHandler(() => {
          setResult('Contextual Search Opened');
        });

        return generateRegistrationMsg('then contextual search is opened');
      },
    });

  const RegisterClosedHandler = (): ReactElement =>
    ApiWithoutInput({
      name: 'registerOnContextualSearchClosedHandler',
      title: 'Register Contextual Search Closed Handler',
      onClick: async (setResult) => {
        contextualSearch.registerOnContextualSearchClosedHandler(() => {
          setResult('Contextual Search Closed');
        });

        return generateRegistrationMsg('then contextual search is closed');
      },
    });

  return (
    <ModuleWrapper title="Contextual Search">
      <CheckContextualSearchCapability />
      <OpenContextualSearch />
      <OpenContextualSearchWithTriggerSource />
      <CloseContextualSearch />
      <RegisterOpenedHandler />
      <RegisterClosedHandler />
    </ModuleWrapper>
  );
};

export default ContextualSearchAPIs;
