import { SdkError, thirdPartyStorageProviders } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

// import { noHostSdkMsg } from '../App';
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
          return; //API allows for no input to be provided
        }
        return;
      },
      submit: async (input, setResult) => {
        // input will be the thread id
        const callback = (
          attachments: thirdPartyStorageProviders.FilesFor3PApps[],
          error?: SdkError | undefined,
        ): void => {
          if (error) {
            setResult(JSON.stringify(error));
          }
        };
        const result = thirdPartyStorageProviders.getDragAndDropFiles(input, callback);
        setResult(JSON.stringify(result));
        return 'abc';
        // return 'thirdPartyStorageProviders.getDragAndDropFiles()' + noHostSdkMsg;
      },
    },
  });

const ThirdPartyStorageProvidersAPIs = (): ReactElement => (
  <ModuleWrapper title="ThirdPartyStorageProviders">
    <ThirdPartyStorageProviders />
  </ModuleWrapper>
);

export default ThirdPartyStorageProvidersAPIs;
