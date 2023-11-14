import { SdkError, thirdPartyStorageProviders } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const ThirdPartyStorageProviders = (): React.ReactElement =>
  ApiWithTextInput<string>({
    name: 'checkCapabilityThirdPartyStorageProviders',
    title: 'thirdPartyStorageProviders',
    onClick: {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      validateInput: (input) => {
        if (!input) {
          return; // API allows for no input to be provided
        }
        return;
      },
      submit: async (input, setResult) => {
        // input will be the thread id
        const filesCallback = (
          attachments: thirdPartyStorageProviders.FilesFor3PApps[],
          error?: SdkError | undefined,
        ): void => {
          if (error) {
            setResult('error received in callback' + JSON.stringify(error));
          } else {
            console.log(attachments);
            setResult('Received files in callback');
          }
        };
        const result = thirdPartyStorageProviders.getDragAndDropFiles(input, filesCallback);
        setResult(JSON.stringify(result));
        return 'thirdPartyStorageProviders.getDragAndDropFiles() was called';
      },
    },
  });

const ThirdPartyStorageProvidersAPIs = (): ReactElement => (
  <ModuleWrapper title="ThirdPartyStorageProviders">
    <ThirdPartyStorageProviders />
  </ModuleWrapper>
);

export default ThirdPartyStorageProvidersAPIs;
