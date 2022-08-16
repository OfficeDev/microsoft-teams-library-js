import { webStorage } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const WebStorageCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'webStorageCapability',
    title: 'Web Storage Capability',
    onClick: async () => `webStorage ${webStorage.isWebStorageClearedOnUserLogOut() ? 'is' : 'is not'} supported`,
  });

const WebStorageAPIs = (): ReactElement => (
  <ModuleWrapper title="WebStorage">
    <WebStorageCapability />
  </ModuleWrapper>
);

export default WebStorageAPIs;
