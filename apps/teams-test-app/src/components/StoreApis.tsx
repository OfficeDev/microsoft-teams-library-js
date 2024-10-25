import { store } from '@microsoft/teams-js';
import { ReactElement } from 'react';
import React from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const StoreAPIs = (): ReactElement => {
  const CheckStoreCapability = (): ReactElement =>
    ApiWithoutInput({
      name: 'checkCapabilityStore',
      title: 'Check Capability Store',
      onClick: async () => {
        if (store.isSupported()) {
          return 'Store module is supported';
        } else {
          return 'Store module is not supported';
        }
      },
    });

  const OpenStore = (): ReactElement =>
    ApiWithTextInput<store.OpenStoreParams>({
      name: 'storeOpen',
      title: 'Store Open',
      onClick: {
        validateInput: (input) => {
          if (input?.dialogType === undefined) {
            throw new Error('store type undefined');
          }
        },
        submit: async (input) => {
          store.openStoreExperience(input as store.OpenStoreParams);
          return '';
        },
      },
      defaultInput: JSON.stringify({
        dialogType: 'ics',
      }),
    });
  return (
    <ModuleWrapper title="Store">
      <CheckStoreCapability />
      <OpenStore />
    </ModuleWrapper>
  );
};

export default StoreAPIs;
