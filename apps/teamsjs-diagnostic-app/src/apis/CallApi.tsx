import React from 'react';
import { ApiComponent } from '../components/sample/ApiComponents';
import { call } from '@microsoft/teams-js';
import ApiComponentWrapper from '../utils/ApiComponentWrapper';

export const call_CheckCallCapability = async (): Promise<void> => {
  console.log('Executing CheckCallCapability...');
  try {
    const result = await call.isSupported();
    if (result) {
      console.log('Call module is supported. Call is supported on Teams Web, Outlook Web, Teams Desktop, Outlook Desktop, and Teams Mobile.');
    } else {
      console.log('Call module is not supported. Call is not supported on M365 Web, M365 Desktop, Outlook Desktop, M365 Mobile, or Outlook Mobile.');
      throw new Error('Call module is not supported');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error checking Call capability:', errorMessage);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
};

export const call_StartCall = async (input: string): Promise<string> => {
  console.log('Executing StartCall with input:', input);

  try {
    const validateInput = (input: string) => {
      if (!input) {
        console.log('Input is required for StartCall. Input includes a comma-separated list of user IDs representing the participants of the call, list of modalities for the call (defaults to [“audio”]), and an optional parameter that informs about the source of the deep link.');
        throw new Error('Input is required for StartCall');
      }
      console.log('Input validation passed');
    };

    validateInput(input);

    const result = await call.startCall({ targets: [input] });
    console.log('Call started successfully. StartCall result:', result);
    return 'Call started successfully';
  } catch (error) {
    console.log('Error in StartCall:', error);
    throw error;
  }
};

const functionsRequiringInput = [
  'StartCall'
]; // List of functions requiring input

interface CallAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const CallAPIs: React.FC<CallAPIsProps> = (props) => {
  return (
    <ApiComponentWrapper
      apiComponent={props.apiComponent}
      onDropToScenarioBox={props.onDropToScenarioBox}
      functionsRequiringInput={functionsRequiringInput}
    />
  );
};

export default CallAPIs;
