import { storage } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput } from './utils';

const WebStorageCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'webStorageCapability',
    title: 'Web Storage Capability',
    onClick: async () => `Storage ${storage.isWebStorageClearedOnUserLogOut() ? 'is' : 'is not'} supported`,
  });

const StorageAPIs = (): ReactElement => (
  <>
    <h1>storage</h1>
    <WebStorageCapability />
  </>
);

export default StorageAPIs;
