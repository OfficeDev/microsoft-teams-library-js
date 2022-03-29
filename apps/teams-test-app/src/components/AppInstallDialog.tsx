import { appInstallDialog } from '@microsoft/teams-js';
import { ForwardedRef, forwardRef, ReactElement } from 'react';

import { ApiWithTextInput } from './utils';
import { DynamicForm } from './utils/DynamicForm/DynamicForm';
import { ModuleWrapper } from './utils/ModuleWrapper/ModuleWrapper';
import { SupportButton } from './utils/SupportButton/SupportButton';

const AppInstallDialogCapability = (): ReactElement =>
  SupportButton({
    name: 'appInstallDialog',
    module: 'App Install Dialog',
    isSupported: appInstallDialog.isSupported(),
  });

const openAppInstallDialog = async (input: appInstallDialog.OpenAppInstallDialogParams): Promise<string> => {
  if (!input.appId) {
    throw new Error('appId is required');
  }
  await appInstallDialog.openAppInstallDialog(input);
  return JSON.stringify(input);
};

const OpenAppInstallDialog = (): ReactElement => {
  return (
    <DynamicForm
      name="openAppInstallDialog"
      label="Open App Install Dialog"
      onSubmit={openAppInstallDialog}
      inputFields={{ appId: '1245' }}
    />
  );
};

const OGOpenAppInstallDialog = (): ReactElement =>
  ApiWithTextInput<appInstallDialog.OpenAppInstallDialogParams>({
    name: 'OGopenAppInstallDialog',
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

const AppInstallDialogAPIs = forwardRef(
  (_props, ref: ForwardedRef<HTMLDivElement>): ReactElement => (
    <ModuleWrapper ref={ref} heading="appInstallDialog">
      <AppInstallDialogCapability />
      <OpenAppInstallDialog />
      <OGOpenAppInstallDialog />
    </ModuleWrapper>
  ),
);

AppInstallDialogAPIs.displayName = 'AppInstallDialogAPIs';
export default AppInstallDialogAPIs;
