import { appInstallDialog } from '@microsoft/teams-js';
import React from 'react';

import { ApiWithTextInput } from './utils';
import { SupportButton } from './utils/SupportButton/SupportButton';

const AppInstallDialogCapability = (): React.ReactElement =>
  SupportButton({
    name: 'appInstallDialog',

    module: 'App Install Dialog',
    isSupported: appInstallDialog.isSupported(),
  });

const OpenAppInstallDialog = (): React.ReactElement =>
  ApiWithTextInput<appInstallDialog.OpenAppInstallDialogParams>({
    name: 'openAppInstallDialog',
    title: 'Open App Install Dialog',
    onClick: {
      validateInput: input => {
        if (!input.appId) {
          throw new Error('appId is required');
        }
      },
      submit: async input => {
        await appInstallDialog.openAppInstallDialog(input);
        return 'called';
      },
    },
  });

const AppInstallDialogAPIs: React.FC = () => (
  <>
    <h1>appInstallDialog</h1>
    <AppInstallDialogCapability />
    <OpenAppInstallDialog />
  </>
);

export default AppInstallDialogAPIs;
