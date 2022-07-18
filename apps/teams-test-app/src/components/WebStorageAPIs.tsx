import { webStorage } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput } from './utils';

const WebStorageCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'webStorageCapability',
    title: 'Web Storage Capability',
    onClick: async () => `webStorage ${webStorage.isWebStorageClearedOnUserLogOut() ? 'is' : 'is not'} supported`,
  });

const WebStorageAPIs = (): ReactElement => (
  <>
    <h1>webStorage</h1>
    <WebStorageCapability />
  </>
);

export default WebStorageAPIs;
