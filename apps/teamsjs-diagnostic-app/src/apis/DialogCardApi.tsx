import React from 'react';
import { dialog } from '@microsoft/teams-js';

const DialogCardAPIs: React.FC = () => {
  const checkDialogAdaptiveCardCapability = async () => {
    console.log('Checking if Dialog Adaptive Card module is supported...');
    const isSupported = dialog.adaptiveCard.isSupported();
    console.log(`Dialog Adaptive Card module ${isSupported ? 'is' : 'is not'} supported`);
    return `Dialog Adaptive Card module ${isSupported ? 'is' : 'is not'} supported`;
  };

  return (
      <div className="api-header">API: Dialog.Card</div>
  );
};

export default DialogCardAPIs;
