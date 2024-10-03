import React from 'react';
import { ApiComponent } from '../components/sample/ApiComponents';
import { dialog } from '@microsoft/teams-js';
import ApiComponentWrapper from '../utils/ApiComponentWrapper';
import { checkCapabilitySupport } from '../utils/CheckCapabilityUtils';

export const dialog_CheckDialogCapability = async (): Promise<void> => {
  const module = dialog;
  const moduleName = 'Dialog';
  const supportedMessage = 'Dialog module is supported. Dialog is supported on all platforms except M365 Mobile and Outlook Mobile.';
  const notSupportedMessage = 'Dialog module is not supported. Dialog is not supported on M365 Mobile or Outlook Mobile.';
  
  await checkCapabilitySupport(module, moduleName, supportedMessage, notSupportedMessage);
};
interface DialogAPIsProps {
  apiComponent: ApiComponent;
  onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void;
}

const DialogAPIs: React.FC<DialogAPIsProps> = (props) => {
  return (
    <ApiComponentWrapper
      apiComponent={props.apiComponent}
      onDropToScenarioBox={props.onDropToScenarioBox}
    />
  );
};

export default DialogAPIs;
