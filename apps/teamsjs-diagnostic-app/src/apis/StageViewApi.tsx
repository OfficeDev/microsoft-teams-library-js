import React from 'react';
import { ApiComponent } from '../components/sample/ApiComponents';
import { stageView } from '@microsoft/teams-js';
import ApiComponentWrapper from '../utils/ApiComponentWrapper';

interface StageViewInput {
  appId: string;
  contentUrl: string;
  threadId: string;
  title: string;
  websiteUrl?: string;
  entityId?: string;
  openMode?: stageView.StageViewOpenMode;
}

export const stageView_CheckStageViewCapability = async (): Promise<void> => {
  console.log('Executing CheckStageViewCapability...');

  try {
    const result = stageView.isSupported();
    if (result) {
      console.log('Stage View module is supported. Stage View is supported on Teams Web and Teams Desktop.');
    } else {
      console.log('Stage View module is not supported. Stage View is not supported on M365 Web, Outlook Web, M365 Desktop, Outlook Desktop, Teams Mobile, M365 Mobile, or Outlook Mobile.');
      throw new Error('StageView capability is not supported');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error checking Stage View capability:', errorMessage);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
};

export const stageView_OpenStageView = async (input: StageViewInput): Promise<string> => {
  console.log('Executing OpenStageView...');
  try {
    if (!input.appId) {
      throw new Error('appId is required.');
    }
    if (!input.contentUrl) {
      throw new Error('contentUrl is required.');
    }
    if (!input.threadId) {
      throw new Error('threadId is required.');
    }
    if (!input.title) {
      throw new Error('title is required.');
    }

    await stageView.open(input);
    return 'Success';
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('Error opening stage view:', errorMessage);
    throw error;
  }
};

const functionsRequiringInput = [
  'OpenStageView'
]; // List of functions requiring input

interface StageViewAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const StageViewAPIs: React.FC<StageViewAPIsProps> = (props) => {
  return (
    <ApiComponentWrapper
      apiComponent={props.apiComponent}
      onDropToScenarioBox={props.onDropToScenarioBox}
      functionsRequiringInput={functionsRequiringInput}
    />
  );
};

export default StageViewAPIs;
