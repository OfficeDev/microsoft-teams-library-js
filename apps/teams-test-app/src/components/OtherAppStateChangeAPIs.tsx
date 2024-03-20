import { otherAppStateChange } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const CheckOtherAppStateChangeCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'otherAppStateChange_isSupported',
    title: 'Check OtherAppStateChanged Capability',
    onClick: async () => `OtherAppStateChanged module ${otherAppStateChange.isSupported() ? 'is' : 'is not'} supported`,
  });

const RegisterAppInstallHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'otherAppStateChange_registerInstallHandler',
    title: 'Register App Install Handler',
    onClick: async (setResult) => {
      const handler = (event: otherAppStateChange.OtherAppStateChangeEvent): void => {
        console.log(event);
        setResult(
          `App Install Event Received for ${event.appIds.length} apps that have ids: ${Object.keys(event.appIds)
            .map((key) => event.appIds[key])
            .join(', ')}`,
        );
      };
      setResult('register install handler');
      otherAppStateChange.registerAppInstallationHandler(handler);
      return 'received';
    },
  });

const UnregisterAppInstallHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'otherAppStateChange_unregisterInstallHandler',
    title: 'Unregister App Install Handler',
    onClick: async () => {
      otherAppStateChange.unregisterAppInstallationHandler();
      return 'received';
    },
  });

const OtherAppStateChangedAPIs = (): ReactElement => (
  <>
    <ModuleWrapper title="OtherAppStateChanged">
      <CheckOtherAppStateChangeCapability />
      <RegisterAppInstallHandler />
      <UnregisterAppInstallHandler />
    </ModuleWrapper>
  </>
);

export default OtherAppStateChangedAPIs;
