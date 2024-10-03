import React from 'react';
import { ApiComponent } from '../components/sample/ApiComponents';
import { sharing } from '@microsoft/teams-js';
import ApiComponentWrapper from '../utils/ApiComponentWrapper';
import { checkCapabilitySupport } from '../utils/CheckCapabilityUtils';

interface ShareWebContentInput {
  content: {
    type: 'URL';
    url: string;
    message?: string;
    preview?: boolean;
  }[];
}

export const sharing_CheckSharingCapability = async (): Promise<void> => {
  const module = 'sharing';
  const moduleName = 'Sharing';
  const supportedMessage = 'Sharing module is supported. Sharing is supported on Teams Web, Teams Desktop, and Teams (versions under 23247.720.2421.8365) Mobile.';
  const notSupportedMessage = 'Sharing module is not supported. Sharing is not supported on M365 Web, Outlook Web, M365 Desktop, Outlook Desktop, M365 Mobile, or Outlook Mobile.';
  
  await checkCapabilitySupport(module, moduleName, supportedMessage, notSupportedMessage);
};

export const sharing_ShareWebContent = async (input: ShareWebContentInput): Promise<string> => {
  console.log('Executing ShareWebContent...');
  try {
    if (!input.content || input.content.length === 0) {
      throw new Error('content is required');
    }
    for (const contentItem of input.content) {
      if (contentItem.type !== 'URL') {
        console.log("Each of the content items has to have type property with value 'URL'.");
        throw new Error("Must have type property with value 'URL'.");
      }
      if (!contentItem.url) {
        console.log('Each of the content items has to have url property set.');
        throw new Error('Must have url property set.');
      }
    }

    await sharing.shareWebContent(input);
    return 'Success';
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('Error sharing web content:', errorMessage);
    throw error;
  }
};

const functionsRequiringInput = [
  'ShareWebContent'
]; // List of functions requiring input

interface SharingAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const SharingAPIs: React.FC<SharingAPIsProps> = (props) => {
  return (
    <ApiComponentWrapper
      apiComponent={props.apiComponent}
      onDropToScenarioBox={props.onDropToScenarioBox}
      functionsRequiringInput={functionsRequiringInput}
    />
  );
};

export default SharingAPIs;
