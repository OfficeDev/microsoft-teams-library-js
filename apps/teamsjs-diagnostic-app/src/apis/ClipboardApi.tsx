import React from 'react';
//import { clipboard } from '@microsoft/teams-js';
//import { captureConsoleLogs } from '../components/sample/LoggerUtility';

const ClipboardAPIs: React.FC = () => {
  /*
  const checkClipboardCapability = async () => {
    captureConsoleLogs((log) => console.log(log));
    console.log('Checking if Clipboard module is supported...');
    const isSupported = clipboard.isSupported();
    console.log(`Clipboard module ${isSupported ? 'is' : 'is not'} supported`);
    return `Clipboard module ${isSupported ? 'is' : 'is not'} supported`;
  };

  const copyText = async () => {
    captureConsoleLogs((log) => console.log(log));

    const text = 'Copy this text';
    const blob = new Blob([text], { type: 'text/plain' });
    await clipboard.write(blob);
    console.log('Text copied to clipboard');
    return 'Text copied to clipboard';
  };

  const copyImage = async () => {
    captureConsoleLogs((log) => console.log(log));

    const byteCharacters = atob(
      'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==',
    );
    const byteArray = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i);
    }
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    await clipboard.write(blob);
    console.log('Image copied to clipboard');
    return 'Image copied to clipboard';
  };*/

  return (
      <div className="api-header">API: Clipboard</div>
  );
};

export default ClipboardAPIs;
