import React from 'react';
import { ApiComponent } from '../components/sample/ApiComponents';
import { clipboard } from '@microsoft/teams-js';
import ApiComponentWrapper from '../utils/ApiComponentWrapper';
import { checkCapabilitySupport } from '../utils/CheckCapabilityUtils';

export const clipboard_CheckClipboardCapability = async (): Promise<void> => {
  const module = clipboard;
  const moduleName = 'Clipboard';
  const supportedMessage = 'Clipboard module is supported. Clipboard is supported on new Teams (Version 23247.720.2421.8365 and above) Web, M365 Web, Outlook Web, new Teams (Version 23247.720.2421.8365 and above) Desktop, M365 Desktop, Outlook Desktop, M365 Mobile, and Outlook IOS.';
  const notSupportedMessage = 'Clipboard module is not supported.Clipboard is not supported on versions of Team below 23247.720.2421.8365 or Outlook Android.';
  
  await checkCapabilitySupport(module, moduleName, supportedMessage, notSupportedMessage);
};

export const clipboard_CopyText = async ({ text }: { text: string }): Promise<string> => {
  console.log('Executing CopyText...');
  if (!text) {
    return 'Error: Text input is missing';
  }
  try {
    const blob = new Blob([text], { type: 'text/plain' });
    await clipboard.write(blob);
    console.log(`Successfully copied text '${blob}' to clipboard`);
    return 'Text copied to clipboard';
  } catch (error) {
    console.error('Error copying text to clipboard:', error);
    throw error;
  }
};

// Copy Image to Clipboard
export const clipboard_CopyImage = async ({ mimeType }: { mimeType: string }): Promise<string> => {
  console.log('Executing CopyImage...');
  if (!mimeType) {
    return 'Error: mimeType input is missing';
  }
  try {
    // Example image data (base64 encoded PNG)
    const byteCharacters = atob('iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==');
    const byteArray = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i);
    }
    const blob = new Blob([byteArray], { type: mimeType });
    await clipboard.write(blob);
    console.log(`Successfully copied image '${JSON.stringify(blob, null, 2)}' to clipboard`);
    return 'Image copied to clipboard';
  } catch (error) {
    console.error('Error copying image to clipboard:', error);
    throw error;
  }
};

export const clipboard_Paste = async (): Promise<string> => {
  console.log('Executing Paste...');
  try {
    const result = await clipboard.read();
    let pasteResult = '';

    if (result.type.startsWith('text')) {
      const reader = new FileReader();
      reader.readAsText(result);
      pasteResult = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          if (reader.result) {
            resolve(reader.result as string);
          } else {
            reject('Failed to read text from clipboard');
          }
        };
      });
      console.log('Text pasted from clipboard:', pasteResult);
    } else if (result.type.startsWith('image')) {
      const image = document.createElement('img');
      image.src = URL.createObjectURL(result);
      image.style.height = '150px';
      image.style.width = '150px';
      const root = document.getElementById('root');
      if (root) {
        root.appendChild(image);
      }
      pasteResult = `Pasted image with id: ${image.id}`;
      console.log(pasteResult);
    } else {
      pasteResult = 'No contents read from clipboard';
      console.log(pasteResult);
    }

    return pasteResult;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error pasting from clipboard:', errorMessage);
    throw error;
  }
};

const functionsRequiringInput = [
  'CopyText', 
  'CopyImage'
]; // List of functions requiring input

interface ClipboardAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const ClipboardAPIs: React.FC<ClipboardAPIsProps> = (props) => {
  return (
    <ApiComponentWrapper
      apiComponent={props.apiComponent}
      onDropToScenarioBox={props.onDropToScenarioBox}
      functionsRequiringInput={functionsRequiringInput}
    />
  );
};

export default ClipboardAPIs;
