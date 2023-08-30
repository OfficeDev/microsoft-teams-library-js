import { clipboard } from '@microsoft/teams-js';
import React from 'react';

import { noHostSdkMsg } from '../App';
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
          throw "String can't be empty";
        }
      },
      submit: async (text) => {
        const blob = new Blob([text], { type: 'text/html' });
        await clipboard.write(blob);
        return JSON.stringify(true);
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
          throw "mimeType can't be empty";
        }
      },
      submit: async (mimeType) => {
        const byteCharacters = atob(
          'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==',
        );
        const byteArray = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArray[i] = byteCharacters.charCodeAt(i);
        }
        await clipboard.write(new Blob([byteArray], { type: mimeType as string }));
        return JSON.stringify(true);
      },
    },
  });

const pasteHelper = (blob: Blob, setResult: (result: string) => void): void => {
  const reader = new FileReader();
  reader.readAsText(blob);
  reader.onloadend = () => {
    if (reader.result) {
      setResult(JSON.stringify(reader.result));
    }
  };
};

const Paste = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'paste',
    title: 'Paste',
    onClick: async (setResult) => {
      const result = await clipboard.read();
      if (result.type.startsWith('text')) {
        pasteHelper(result, setResult);
        return 'clipboard.read()' + noHostSdkMsg;
      } else if (result.type.startsWith('image')) {
        image.src = URL.createObjectURL(result);
        image.style.height = '150px';
        image.style.width = '150px';
        const root = document.getElementById('root');
        if (root) {
          root.appendChild(image);
        }
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
