import { secondaryBrowser } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const CheckSecondaryBrowserCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'CheckSecondaryBrowserCapability',
    title: 'Check SecondaryBrowser Capability',
    onClick: async () => `secondaryBrowser module ${secondaryBrowser.isSupported() ? 'is' : 'is not'} supported`,
  });

const Open = (): React.ReactElement =>
  ApiWithTextInput<string>({
    name: 'secondaryBrowser_open',
    title: 'Open URL',
    onClick: {
      validateInput: (input) => {
        if (typeof input !== 'string') {
          throw new Error('Input should be a string');
        }

        // validate that input should also be a valid URL
        new URL(input);
      },
      submit: async (props) => {
        await secondaryBrowser.open(new URL(props));
        return 'Completed';
      },
    },
  });

const SecondaryBrowserAPIs = (): ReactElement => (
  <ModuleWrapper title="SecondaryBrowser">
    <CheckSecondaryBrowserCapability />
    <Open />
  </ModuleWrapper>
);

export default SecondaryBrowserAPIs;
