import { storage } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput } from './utils';

const CheckStorageCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkStorageCapability',
    title: 'Check Storage Capability',
    onClick: async () => `Storage ${storage.isSupported() ? 'is' : 'is not'} supported`,
  });

const GetWebStorage = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'storageCapability',
    title: 'storage Capability',
    onClick: async () => `Storage ${storage.isWebStorasgeSupported() ? 'is' : 'is not'} supported`,
  });

const StorageAPIs = (): ReactElement => (
  <>
    <h1>storage</h1>
    <GetWebStorage />
    <CheckStorageCapability />
  </>
);

export default StorageAPIs;
