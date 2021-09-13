import React from 'react';
import { appInstallDialog } from '@microsoft/teamsjs-app-sdk';
import { noHubSdkMsg } from '../App';
import BoxAndButton from './BoxAndButton';

const AppInstallDialogAPIs: React.FC = () => {
  const [openAppInstallDialogRes, setOpenAppInstallDialogRes] = React.useState('');
  const [checkAppInstallDialogCapabilityRes, setCheckAppInstallDialogCapabilityRes] = React.useState('');

  const openAppInstallDialog = (openAppInstallDialogParams: string): void => {
    setOpenAppInstallDialogRes('appInstallDialog.openAppInstallDialog()' + noHubSdkMsg);
    appInstallDialog
      .openAppInstallDialog(JSON.parse(openAppInstallDialogParams))
      .then(() => setOpenAppInstallDialogRes('Success'))
      .catch(reason => setOpenAppInstallDialogRes(JSON.stringify(reason)));
  };

  const checkAppInstallDialogCapability = (): void => {
    if (appInstallDialog.isSupported()) {
      setCheckAppInstallDialogCapabilityRes('App Install Dialog module is supported');
    } else {
      setCheckAppInstallDialogCapabilityRes('App Install Dialog module is not supported');
    }
  };

  return (
    <>
      <h1>appInstallDialog</h1>
      <BoxAndButton
        handleClickWithInput={openAppInstallDialog}
        output={openAppInstallDialogRes}
        hasInput={true}
        title="Open App Install Dialog"
        name="openAppInstallDialog"
      />
      <BoxAndButton
        handleClick={checkAppInstallDialogCapability}
        output={checkAppInstallDialogCapabilityRes}
        hasInput={false}
        title="Check Capability App Install Dialog"
        name="checkCapabilityAppInstallDialog"
      />
    </>
  );
};

export default AppInstallDialogAPIs;
