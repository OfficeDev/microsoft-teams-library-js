import React from 'react';
import { appInstallDialog } from '@microsoft/teams-js';
import { captureConsoleLogs } from './../components/sample/LoggerUtility';

const AppInstallDialogAPIs: React.FC = () => {
  const checkAppInstallDialogCapability = async () => {
    captureConsoleLogs((log) => console.log(log));

    console.log('Checking if AppInstallDialog module is supported...');
    const isSupported = appInstallDialog.isSupported();
    console.log(`AppInstallDialog module ${isSupported ? 'is' : 'is not'} supported`);
    return `AppInstallDialog module ${isSupported ? 'is' : 'is not'} supported`;
  };

  return (
    <div className="api-header">API: AppInstallDialog</div>
  );
};

export default AppInstallDialogAPIs;