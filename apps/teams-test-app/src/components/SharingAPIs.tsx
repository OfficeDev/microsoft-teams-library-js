import { SdkError, sharing } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const CheckSharingCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkSharingCapability',
    title: 'Check Sharing Capability',
    onClick: async () => `Sharing ${sharing.isSupported() ? 'is' : 'is not'} supported`,
  });

const ShareWebContent = (): React.ReactElement =>
  ApiWithTextInput<sharing.IShareRequest<sharing.IURLContent>>({
    name: 'share_shareWebContent',
    title: 'Share web content',
    onClick: {
      validateInput: (input) => {
        if (!input.content || input.content.length === 0) {
          throw new Error('content is required');
        }
        for (const contentItem of input.content) {
          if (contentItem.type !== 'URL') {
            throw new Error("Each of the content items has to have type property with value 'URL'.");
          }
          if (!contentItem.url) {
            throw new Error('Each of the content items has to have url property set.');
          }
        }
      },
      submit: {
        withPromise: async (input) => {
          await sharing.shareWebContent(input);
          return 'Success';
        },
        withCallback: (input, setResult) => {
          const callback = (err?: SdkError): void => {
            if (err) {
              setResult(JSON.stringify(err));
            } else {
              setResult('Success');
            }
          };
          sharing.shareWebContent(input, callback);
        },
      },
    },
  });

const SharingAPIs = (): ReactElement => (
  <ModuleWrapper title="Sharing">
    <ShareWebContent />
    <CheckSharingCapability />
  </ModuleWrapper>
);

export default SharingAPIs;
