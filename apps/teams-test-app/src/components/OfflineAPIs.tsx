import { offline, SdkError } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';
import { off } from 'process';

const CheckOfflineCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'CheckOfflineCapability',
    title: 'Check offline Capability',
    onClick: async () => `offline ${offline.isSupported() ? 'is' : 'is not'} supported`,
  });

  const EnableOfflineMode = (): React.ReactElement =>
    ApiWithTextInput<offline.OfflineParams>({
      name: 'CheckOfflineCapability',
      title: 'CheckOfflineCapability',
      onClick: {
        validateInput: (input) => {
          if (!input.invalidationUrl) {
            throw new Error('invalidationurl is needed');
          }
        },
        submit: {
          withPromise: async (input) => {
            await offline.enableOfflineMode(input);
            return 'opened';
          },
          withCallback: (input, setResult) => {
            const callback = (error?: SdkError): void => {
              if (error) {
                setResult(JSON.stringify(error));
              }
            };
            // remove after updating e2e tests
            offline
              .enableOfflineMode(input)
              .then()
              .catch((error) => callback(error));
          },
        },
      },
      defaultInput: '"https://www.microsoft.com"',
    });



const OfflineAPIs = (): ReactElement => (
  <ModuleWrapper title="Offline">
    <CheckOfflineCapability />
    <EnableOfflineMode />
  </ModuleWrapper>
);

export default OfflineAPIs;