import React from 'react';
import { appInstallDialog } from '@microsoft/teams-js';
import { ApiWithTextInput } from '../utils/ApiWithTextInput';
import { ApiWithCheckboxInput } from '../utils/ApiWithCheckboxInput';
import { ApiWithoutInput } from '../utils/ApiWithoutInput';
import { ApiComponent } from '../components/sample/ApiComponents';

interface AppInstallDialogAPIsProps {
  apiComponent: ApiComponent;
}

const AppInstallDialogAPIs: React.FC<AppInstallDialogAPIsProps> = ({ apiComponent }) => {
  
  const OpenAppInstallDialog: React.FC = () => {
    const handleClick = async () => {
      try {
        const input = JSON.parse(apiComponent.defaultInput || '');
        await appInstallDialog.openAppInstallDialog(input);
        console.log('OpenAppInstallDialog executed successfully.');
      } catch (error) {
        console.error('Error in executing OpenAppInstallDialog:', error);
      }
    };

    return (
      <ApiWithTextInput
        title={apiComponent.title}
        name="openAppInstallDialog"
        onClick={handleClick}
        defaultInput={apiComponent.defaultInput || ''}
      />
    );
  };

  const CheckAppInstallDialogCapability: React.FC = () => {
    const handleClick = async () => {
      try {
        const result = appInstallDialog.isSupported();
        console.log(`AppInstallDialog module ${result ? 'is' : 'is not'} supported.`);
      } catch (error) {
        console.error('Error in checking AppInstallDialog capability:', error);
      }
    };

    return (
      <ApiWithoutInput
        title={apiComponent.title}
        name="checkCapabilityAppInstallDialog"
        onClick={handleClick}
      />
    );
  };

  return (
    <div className="api-container">
      <div className="api-header">{apiComponent.title}</div>
      {apiComponent.inputType === 'text' && <OpenAppInstallDialog />}
      {apiComponent.inputType === 'checkbox' && (
        <ApiWithCheckboxInput
          title={apiComponent.title}
          name={apiComponent.name}
          onClick={() => {}}
          defaultCheckboxState={apiComponent.defaultCheckboxState || false}
          label={apiComponent.label || ''}
        />
      )}
      {apiComponent.inputType === 'none' && (
        <ApiWithoutInput
          title={apiComponent.title}
          name={apiComponent.name}
          onClick={() => {}}
        />
      )}
    </div>
  );
};

export default AppInstallDialogAPIs;
