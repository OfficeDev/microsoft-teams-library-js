import React from 'react';
import { ApiComponent } from '../components/sample/ApiComponents';
import { AdaptiveCardDialogInfo, dialog } from '@microsoft/teams-js';
import ApiComponentWrapper from '../utils/ApiComponentWrapper';
import { checkCapabilitySupport } from '../utils/CheckCapabilityUtils';

export const dialogCard_CheckDialogAdaptiveCardCapability = async (): Promise<void> => {
  const module = 'dialogCard';
  const moduleName = 'DialogCard';
  const supportedMessage = 'Dialog Adaptive Card module is supported. Dialog Adaptive Card is supported on all platforms except M365 Mobile and Outlook Mobile.';
  const notSupportedMessage = 'Dialog Adaptive Card module is not supported. Dialog Adaptive Card is not supported on M365 Mobile or Outlook Mobile.';
  
  await checkCapabilitySupport(module, moduleName, supportedMessage, notSupportedMessage);
};

export const dialogCard_OpenAdaptiveCardDialog = (input: AdaptiveCardDialogInfo): Promise<void> => {
  console.log('Executing openAdaptiveCardDialog with input:', JSON.stringify(input, null, 2));
  return new Promise((resolve, reject) => {
    try {
      console.log('Opening adaptive card dialog...');
      const onComplete = (resultObj: dialog.ISdkResponse): void => {
        if (resultObj.err) {
          if (resultObj.err === 'User cancelled/closed the task module.') {
            console.log('User cancelled/closed the dialog');
            resolve();
          } else {
            console.log('Error in adaptive card dialog result:', resultObj.err);
            reject(resultObj.err);
          }
        } else {
          console.log('Adaptive card dialog result:', resultObj.result);
          resolve();
        }
      };
      dialog.adaptiveCard.open(input, onComplete);
      console.log('Adaptive card dialog opened successfully');
    } catch (error) {
      console.log('Error opening adaptive card dialog:', error);
      reject(error);
      throw error;
    }
  });
};

const functionsRequiringInput = [
  'OpenAdaptiveCardDialog'
]; // List of functions requiring input

interface DialogCardAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const DialogCardAPIs: React.FC<DialogCardAPIsProps> = (props) => {
  return (
    <ApiComponentWrapper
      apiComponent={props.apiComponent}
      onDropToScenarioBox={props.onDropToScenarioBox}
      functionsRequiringInput={functionsRequiringInput}
    />
  );
};

export default DialogCardAPIs;
