import { appInstallDialog } from '@microsoft/teams-js';
import React from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const CheckAppInstallDialogCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkCapabilityAppInstallDialog',
    title: 'Check Capability App Install Dialog',
    onClick: async () => `AppInstallDialog module ${appInstallDialog.isSupported() ? 'is' : 'is not'} supported`,
  });

const OpenAppInstallDialog = (): React.ReactElement =>
  ApiWithTextInput<appInstallDialog.OpenAppInstallDialogParams>({
    name: 'openAppInstallDialog',
    title: 'Open App Install Dialog',
    onClick: {
      validateInput: (input) => {
        if (!input.appId) {
          throw new Error('appId is required');
        }
      },
      submit: async (input) => {
        await appInstallDialog.openAppInstallDialog(input);
        return 'called';
      },
    },
  });

const AppInstallDialogAPIs: React.FC = () => (
  <ModuleWrapper title="AppInstallDialog">
    <OpenAppInstallDialog />
    <CheckAppInstallDialogCapability />
  </ModuleWrapper>
);

export default AppInstallDialogAPIs;
