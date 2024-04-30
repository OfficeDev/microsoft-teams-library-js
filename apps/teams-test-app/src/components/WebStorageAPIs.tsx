import { webStorage } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const CheckWebStorageCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkWebStorageCapability',
    title: 'Check Web Storage Capability',
    onClick: async () => `webStorage ${webStorage.isSupported() ? 'is' : 'is not'} supported`,
  });

const IsWebStorageClearedOnLogOut = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'isWebStorageClearedOnUserLogOut',
    title: 'Is Web Storage Cleared on Log Out',
    onClick: async () =>
      `webStorage ${(await webStorage.isWebStorageClearedOnUserLogOut()) ? 'is' : 'is not'} cleared on user log out`,
  });

const WebStorageAPIs = (): ReactElement => (
  <ModuleWrapper title="WebStorage">
    <CheckWebStorageCapability />
    <IsWebStorageClearedOnLogOut />
  </ModuleWrapper>
);

export default WebStorageAPIs;
