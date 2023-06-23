import { clipboard } from '@microsoft/teams-js';
import React from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const CheckCallCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkCapabilityClipboard',
    title: 'Check Capability Clipboard',
    onClick: async () => `Clipboard module ${clipboard.isSupported() ? 'is' : 'is not'} supported`,
  });

const CopyText = (): React.ReactElement =>
  ApiWithTextInput<string>({
    name: 'copyText',
    title: 'Copy',
    onClick: {
      validateInput: (input) => {
        if (!input) {
          throw new Error("String can't be empty");
        }
      },
      submit: async (text) => {
        const blob = new Blob([text], { type: 'text/plain' });
        const result = await clipboard.write(blob);
        return JSON.stringify(result);
      },
    },
  });

const CopyImage = (): React.ReactElement =>
  ApiWithTextInput({
    name: 'copyImage',
    title: 'Copy Image',
    onClick: {
      validateInput: (input) => {
        if (!input) {
          throw new Error("Image url can't be empty.");
        }
      },
      submit: async (imageUrl) => {
        const blob = await (await fetch(imageUrl as URL)).blob();
        console.log(blob.type);
        const result = await clipboard.write(blob);
        return JSON.stringify(result);
      },
    },
  });

const ClipboardAPIs: React.FC = () => (
  <ModuleWrapper title="Clipboard">
    <CopyText />
    <CopyImage />
    <CheckCallCapability />
  </ModuleWrapper>
);

export default ClipboardAPIs;
