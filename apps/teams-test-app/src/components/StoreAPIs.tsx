import { store } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const CheckStoreCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'store_isSupported',
    title: 'Check Store Capability',
    onClick: async () => `Store module ${store.isSupported() ? 'is' : 'is not'} supported`,
  });

const OpenStoreExperienceHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'store.openStoreExperience',
    title: 'Open Store',
    onClick: async () => {
      const params = {
        appId: '1234',
        dialogType: store.dialogType.ICS,
        supportedApps: [],
        userHasCopilotLicense: true,
      };
      await store.openStoreExperience(params);
      return 'opened';
    },
  });

const StoredAPIs = (): ReactElement => (
  <>
    <ModuleWrapper title="Store">
      <CheckStoreCapability />
      <OpenStoreExperienceHandler />
    </ModuleWrapper>
  </>
);

export default StoredAPIs;
