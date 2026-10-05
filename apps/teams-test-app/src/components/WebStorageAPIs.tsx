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
    onClick: async () => {
      const result = await webStorage.isWebStorageClearedOnUserLogOut();
      try {
        if (result === true) {
          return `webStorage is cleared on user log out. Result from sdk: ${result}`;
        } else if (result === false) {
          return `webStorage is not cleared on user log out. Result from sdk: ${result}`;
        } else {
          throw new Error('Invalid result: must be true or false');
        }
      } catch (error) {
        return `Error: ${error}. Result from sdk: ${result}`;
      }
    },
  });

const WebStorageAPIs = (): ReactElement => (
  <ModuleWrapper title="WebStorage">
    <CheckWebStorageCapability />
    <IsWebStorageClearedOnLogOut />
  </ModuleWrapper>
);

export default WebStorageAPIs;
