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
  ApiWithTextInput<sharing.IShareRequest<sharing.IShareRequestContentType>>({
    name: 'share_shareWebContent',
    title: 'Share web content',
    onClick: {
      validateInput: (input) => {
        if (!input.content || input.content.length === 0) {
          throw new Error('content is required');
        }
        for (const contentItem of input.content) {
          if (contentItem.type === 'URL') {
            if (!(contentItem as sharing.IURLContent).url) {
              throw new Error('Each URL content item must have a url property set.');
            }
          } else if (contentItem.type === 'FILE') {
            if (!(contentItem as sharing.IFileContent).url) {
              throw new Error('Each File content item must have a url property set.');
            }
          } else {
            throw new Error('Unsupported content type');
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
    defaultInput: JSON.stringify({
      content: [
        {
          type: 'URL',
          url: 'https://www.bing.com',
          message: 'Bing message',
          preview: false,
        },
      ],
    }),
  });

const SharingAPIs = (): ReactElement => (
  <ModuleWrapper title="Sharing">
    <ShareWebContent />
    <CheckSharingCapability />
  </ModuleWrapper>
);

export default SharingAPIs;
