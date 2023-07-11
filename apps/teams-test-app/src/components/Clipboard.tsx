import { clipboard } from '@microsoft/teams-js';
import React from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const image = document.createElement('img');
image.setAttribute('id', 'clipboardImage');

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
        const blob = await(await fetch(imageUrl as URL)).blob();
        const result = await clipboard.write(blob);
        return JSON.stringify(result);
      },
    },
  });

const Paste = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'paste',
    title: 'Paste',
    onClick: async () => {
      const result = await clipboard.read();

      if (result.type.startsWith('text')) {
        return JSON.stringify(await result.text());
      } else if (result.type.startsWith('image')) {
        image.src = URL.createObjectURL(result);
        image.style.height = '150px';
        image.style.width = '150px';
        document.body.appendChild(image);
        return JSON.stringify(`Pasted from clipboard with image id: ${image.id}`);
      } else {
        return JSON.stringify('No contents read from clipboard.');
      }
    },
  });
const ClipboardAPIs: React.FC = () => (
  <ModuleWrapper title="Clipboard">
    <CopyText />
    <CopyImage />
    <Paste />
    <CheckCallCapability />
  </ModuleWrapper>
);

export default ClipboardAPIs;
