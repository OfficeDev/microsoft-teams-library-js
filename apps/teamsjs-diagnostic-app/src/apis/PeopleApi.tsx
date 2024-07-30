import React from 'react';
import { ApiComponent } from '../components/sample/ApiComponents';
import { people, SdkError } from '@microsoft/teams-js';
import ApiComponentWrapper from '../utils/ApiComponentWrapper';
import { checkCapabilitySupport } from '../utils/CheckCapabilityUtils';

interface SelectPeopleInput {
  title?: string;
  setSelected?: string[];
  openOrgWideSearchInChatOrChannel?: boolean;
  singleSelect?: boolean;
}

export const people_CheckPeopleCapability = async (): Promise<void> => {
  const module = 'people';
  const moduleName = 'People';
  const supportedMessage = 'People module is supported. People is supported on Teams Web, Teams Desktop, and Teams (versions under 23247.720.2421.8365) Mobile.';
  const notSupportedMessage = 'People module is not supported. People is not supported on M365 Web, Outlook Web, M365 Desktop, Outlook Desktop, M365 Mobile, or Outlook Mobile.';
  
  await checkCapabilitySupport(module, moduleName, supportedMessage, notSupportedMessage);
};

export const people_SelectPeople = async (input?: SelectPeopleInput): Promise<string> => {
  console.log('Executing SelectPeople with input:', JSON.stringify(input, null, 2));

  try {
    const result = await new Promise<any>((resolve, reject) => {
      people.selectPeople((error: SdkError, result: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }, input);
    });

    console.log('SelectPeople result:', JSON.stringify(result, null, 2));
    return JSON.stringify(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('Error during SelectPeople operation:', errorMessage);
    throw new Error(`Failure: SelectPeople for People API - ${errorMessage}`);
  }
};

const functionsRequiringInput = [
  'SelectPeople'
]; // List of functions requiring input

interface PeopleAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const PeopleAPIs: React.FC<PeopleAPIsProps> = (props) => {
  return (
    <ApiComponentWrapper
      apiComponent={props.apiComponent}
      onDropToScenarioBox={props.onDropToScenarioBox}
      functionsRequiringInput={functionsRequiringInput}
    />
  );
};

export default PeopleAPIs;
