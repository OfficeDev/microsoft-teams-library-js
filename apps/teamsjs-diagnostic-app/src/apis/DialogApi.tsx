import React from 'react';
import { ApiComponent } from '../components/sample/ApiComponents';
import { dialog } from '@microsoft/teams-js';
import ApiComponentWrapper from '../utils/ApiComponentWrapper';

export const dialog_CheckDialogCapability = async (): Promise<void> => {
  console.log('Executing CheckDialogCapability...');
  try {
    const result = await dialog.isSupported();
    if (result) {
      console.log('Dialog module is supported. Dialog is supported on all platforms except M365 Mobile and Outlook Mobile.');
    } else {
      console.log('Dialog module is not supported. Dialog is not supported on M365 Mobile or Outlook Mobile.');
      throw new Error('Dialog module is not supported');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error checking Dialog capability:', errorMessage);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
};
interface DialogAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const DialogAPIs: React.FC<DialogAPIsProps> = (props) => {
  return (
    <ApiComponentWrapper
      apiComponent={props.apiComponent}
      onDropToScenarioBox={props.onDropToScenarioBox}
    />
  );
};

export default DialogAPIs;
