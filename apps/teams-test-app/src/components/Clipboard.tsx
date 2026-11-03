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
    defaultInput: '"copy this test"',
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
    defaultInput: '"image/jpeg"',
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

const HasClipboardReadPermission = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'hasClipboardReadPermission',
    title: 'Has Clipboard Read Permission',
    onClick: async () => JSON.stringify(await clipboard.hasPermission()),
  });

const RequestClipboardReadPermission = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'requestClipboardReadPermission',
    title: 'Request Clipboard Read Permission',
    onClick: async () => {
      const granted = await clipboard.requestPermission();
      return granted
        ? 'Permission granted. Reload may be required for this already-loaded app frame. After any reload, click "Read Clipboard with Browser API" as a new user gesture.'
        : 'Permission was not granted.';
    },
  });

const ReadClipboardWithBrowserApi = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'readClipboardWithBrowserApi',
    title: 'Read Clipboard with Browser API',
    onClick: async () => {
      if (!navigator.clipboard?.read) {
        throw new Error('navigator.clipboard.read() is not available in this app frame');
      }
      const items = await navigator.clipboard.read();
      const textItems = items.filter((item) => item.types.includes('text/plain'));
      if (textItems.length > 0) {
        const textPayloads = await Promise.all(
          textItems.map(async (item) => (await item.getType('text/plain')).text()),
        );
        return textPayloads.join('\n');
      }

      const availableMimeTypes = [...new Set(items.flatMap((item) => item.types))];
      return `No text/plain clipboard content was available. Available MIME types: ${
        availableMimeTypes.join(', ') || 'none'
      }.`;
    },
  });

const ClipboardAPIs: React.FC = () => (
  <ModuleWrapper title="Clipboard">
    <CopyText />
    <CopyImage />
    <Paste />
    <HasClipboardReadPermission />
    <RequestClipboardReadPermission />
    <ReadClipboardWithBrowserApi />
    <CheckCallCapability />
  </ModuleWrapper>
);

export default ClipboardAPIs;
