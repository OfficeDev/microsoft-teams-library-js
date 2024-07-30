import React from 'react';
import { ApiComponent } from '../components/sample/ApiComponents';
import { appInstallDialog } from '@microsoft/teams-js';
import * as microsoftTeams from '@microsoft/teams-js';
import ApiComponentWrapper from '../utils/ApiComponentWrapper';
import { checkCapabilitySupport } from '../utils/CheckCapabilityUtils';

export interface AppInstallDialogInput {
  appId: string;
}

export const appInstallDialog_CheckAppInstallCapability = async (): Promise<void> => {
  const module = appInstallDialog;
  const moduleName = 'AppInstallDialog';
  const supportedMessage = 'App Install Dialog module is supported. AppInstall Dialog is supported on Teams Web, Teams Desktop, and Teams Mobile.';
  const notSupportedMessage = 'App Install Dialog module is not supported. AppInstallDialog is not supported on Outlook Web, Outlook Desktop, Outlook Mobile, or M365 Mobile.';
  
  await checkCapabilitySupport(module, moduleName, supportedMessage, notSupportedMessage);
};

export function appInstallDialog_OpenAppInstallDialog(input: { appId: string }) {
  return new Promise<void>((resolve, reject) => {
    if (!input.appId) {
      console.log('App ID is missing');
      return reject('App ID is required');
    }

    console.log(`Starting OpenAppInstallDialog with appId: ${input.appId}`);

    try {
      const appId = input.appId;
      // SDK/API call to open install dialog
      microsoftTeams.tasks.startTask({
        title: 'Install App',
        height: 600,
        width: 400,
        url: `https://teams.microsoft.com/l/app/${appId}`,
      });

      console.log('App install dialog opened successfully');
      resolve();
    } catch (error) {
      console.error('Error opening app install dialog:', error);
      reject(error);
    }
  });
}

const functionsRequiringInput = [
  'OpenAppInstalDialog'
]; // List of functions requiring input

interface AppInstallDialogAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const AppInstallDialogAPIs: React.FC<AppInstallDialogAPIsProps> = (props) => {
  return (
    <ApiComponentWrapper
      apiComponent={props.apiComponent}
      onDropToScenarioBox={props.onDropToScenarioBox}
      functionsRequiringInput={functionsRequiringInput}
    />
  );
};

export default AppInstallDialogAPIs;
