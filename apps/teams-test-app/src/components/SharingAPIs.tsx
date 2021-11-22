import { sharing } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';

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
      validateInput: input => {
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
      submit: async input => {
        return new Promise<string>((res, rej) => {
          sharing.shareWebContent(input, error => {
            if (error) {
              rej(JSON.stringify(error));
            }
            res('Success');
          });
        });
      },
    },
  });

const SharingAPIs = (): ReactElement => (
  <>
    <h1>sharing</h1>
    <ShareWebContent />
    <CheckSharingCapability />
  </>
);

export default SharingAPIs;
