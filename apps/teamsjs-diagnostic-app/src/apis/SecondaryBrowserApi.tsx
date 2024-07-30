import React from 'react';
import { ApiComponent } from '../components/sample/ApiComponents';
import { secondaryBrowser } from '@microsoft/teams-js';
import ApiComponentWrapper from '../utils/ApiComponentWrapper';

export const secondaryBrowser_CheckSecondaryBrowserCapability = async (): Promise<void> => {
  console.log('Executing CheckSecondaryBrowserCapability...');
  try {
    const isSupported = secondaryBrowser.isSupported();
    if (isSupported) {
      console.log('Secondary Browser module is supported. Secondary Browser is supported on M365 Mobile and Outlook Mobile.');
    } else {
      console.log('Secondary Browser module is not supported. Secondary Browser is only supported on M365 Mobile and Outlook Mobile.');
      throw new Error('Secondary Browser module is not supported');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('Error checking Secondary Browser capability:', errorMessage);
    if (error instanceof Error) {
      console.log('Stack trace:', error.stack);
    }
    throw error;
  }
};

export const secondaryBrowser_Open = async (input: string): Promise<void> => {
  console.log('Executing Open...');
  try{
    if (typeof input !== 'string') {
        throw new Error('Input should be a string');
      }
      // validate that input should also be a valid URL
      new URL(input);
      await secondaryBrowser.open(new URL(input));
  }catch (error){
    console.log('Error opening secondary browser:', JSON.stringify(error, null, 2));
    console.log('Secondary Browser module is not supported. Secondary Browser is only supported on M365 Mobile and Outlook Mobile.');
    throw error;
  }
};
const functionsRequiringInput = [
  'Open'
]; // List of functions requiring input

interface SecondaryBrowserAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const SecondaryBrowserAPIs: React.FC<SecondaryBrowserAPIsProps> = (props) => {
  return (
    <ApiComponentWrapper
      apiComponent={props.apiComponent}
      onDropToScenarioBox={props.onDropToScenarioBox}
      functionsRequiringInput={functionsRequiringInput}
    />
  );
};

export default SecondaryBrowserAPIs;
