import { appInstallDialog } from '@microsoft/teams-js';
import React from 'react';

import { noHostSdkMsg } from '../App';
import BoxAndButton from './BoxAndButton';

const AppInstallDialogAPIs: React.FC = () => {
  const [openAppInstallDialogRes, setOpenAppInstallDialogRes] = React.useState('');
  const [checkAppInstallDialogCapabilityRes, setCheckAppInstallDialogCapabilityRes] = React.useState('');

  const openAppInstallDialog = (openAppInstallDialogParams: string): void => {
    setOpenAppInstallDialogRes('appInstallDialog.openAppInstallDialog()' + noHostSdkMsg);
    appInstallDialog
      .openAppInstallDialog(JSON.parse(openAppInstallDialogParams))
      .then(() => setOpenAppInstallDialogRes('called'))
      .catch(reason => setOpenAppInstallDialogRes(JSON.stringify(reason)));
  };

  const checkAppInstallDialogCapability = (): void => {
    if (appInstallDialog.isSupported()) {
      setCheckAppInstallDialogCapabilityRes('AppInstallDialog module is supported');
    } else {
      setCheckAppInstallDialogCapabilityRes('AppInstallDialog module is not supported');
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
