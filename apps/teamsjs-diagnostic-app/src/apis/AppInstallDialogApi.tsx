import React from 'react';
import { appInstallDialog } from '@microsoft/teams-js';

const AppInstallDialogAPIs: React.FC = () => {
  const checkAppInstallDialogCapability = async () => {
    console.log('Checking if AppInstallDialog module is supported...');
    const isSupported = appInstallDialog.isSupported();
    console.log(`AppInstallDialog module ${isSupported ? 'is' : 'is not'} supported`);
    return `AppInstallDialog module ${isSupported ? 'is' : 'is not'} supported`;
  };

  const openAppInstallDialog = async () => {
    try {
      await appInstallDialog.openAppInstallDialog({ appId: '957f8a7e-fbcd-411d-b69f-acb7eb58b515' });
      return 'Opened App Install Dialog';
    } catch (error) {
      console.error('Error opening App Install Dialog:', error);
      throw new Error('Failed to open App Install Dialog');
    }
  };

  return (
    <div>
      <div className="api-header">API: AppInstallDialog</div>
      <button className="api-button" onClick={checkAppInstallDialogCapability}>
        Check Capability
      </button>
      <button className="api-button" onClick={openAppInstallDialog}>
        Open App Install Dialog
      </button>
    </div>
  );
};

export default AppInstallDialogAPIs;
