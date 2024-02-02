import { SdkError, thirdPartyCloudStorage } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const ThirdPartyCloudStorage = (): React.ReactElement =>
  ApiWithTextInput<string>({
    name: 'checkCapabilityThirdPartyCloudStorage',
    title: 'thirdPartyCloudStorage',
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
          attachments: thirdPartyCloudStorage.FilesFor3PStorage[],
          error?: SdkError | undefined,
        ): void => {
          if (error) {
            setResult('error received in callback' + JSON.stringify(error));
          } else {
            console.log(attachments);
            setResult('Received files in callback');
          }
        };
        const result = thirdPartyCloudStorage.getDragAndDropFiles(input, filesCallback);
        setResult(JSON.stringify(result));
        return 'thirdPartyCloudStorage.getDragAndDropFiles() was called';
      },
    },
    defaultInput: '"dragAndDropInput"',
  });

const ThirdPartyCloudStorageAPIs = (): ReactElement => (
  <ModuleWrapper title="ThirdPartyCloudStorage">
    <ThirdPartyCloudStorage />
  </ModuleWrapper>
);

export default ThirdPartyCloudStorageAPIs;
