import { AppId, DialogSize, store } from '@microsoft/teams-js';
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
    ApiWithTextInput<{
      dialogType: string;
      appId?: string;
      collectionId?: string;
      size?: DialogSize;
      appCapability?: string;
      appMetaCapabilities?: string[];
      installationScope?: string;
      filteredOutAppIds?: string[];
    }>({
      name: 'storeOpen',
      title: 'Store Open',
      onClick: {
        validateInput: (input) => {
          if (input?.dialogType === undefined) {
            throw new Error('store type undefined');
          }
        },
        submit: async (input) => {
          const appId = input.appId === undefined ? undefined : new AppId(input.appId);
          const openStoreParam = {
            dialogType: input.dialogType,
            appId: appId,
            collectionId: input.collectionId,
            size: input.size,
            appCapability: input.appCapability,
            appMetaCapabilities: input.appMetaCapabilities,
            installationScope: input.installationScope,
            filteredOutAppIds: input.filteredOutAppIds,
          };
          // eslint-disable-next-line no-useless-catch
          try {
            await store.openStoreExperience(openStoreParam as store.OpenStoreParams);
            return 'store opened';
          } catch (e) {
            throw e;
          }
        },
      },
      defaultInput: JSON.stringify({
        dialogType: 'appdetail',
        appId: '1542629c-01b3-4a6d-8f76-1938b779e48d',
        size: {
          width: 'large',
          height: 300,
        },
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
