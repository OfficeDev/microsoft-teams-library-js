/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-useless-catch */
import { AppId, store } from '@microsoft/teams-js';
import { ReactElement } from 'react';
import React from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const StoreAPIs = (): ReactElement => {
  const appId1 = new AppId('1542629c-01b3-4a6d-8f76-1938b779e48d');
  const appId2 = new AppId('1542629c-01b3-4a6d-8f76-940934572634');

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

  const OpenFullStore = (): ReactElement =>
    ApiWithTextInput<store.OpenFullStoreParams>({
      name: 'openFullStore',
      title: 'Open Full Store',
      onClick: {
        validateInput: () => {},
        submit: async (input) => {
          try {
            await store.openFullStore(input);
            return 'full store opened';
          } catch (e) {
            throw e;
          }
        },
      },
      defaultInput: JSON.stringify({
        size: {
          width: 'large',
          height: 300,
        },
      }),
    });

  const OpenSpecificStore = (): ReactElement =>
    ApiWithTextInput<store.OpenSpecificStoreParams>({
      name: 'openSpecificStore',
      title: 'Open Specific Store',
      onClick: {
        validateInput: () => {},
        submit: async (input) => {
          try {
            await store.openSpecificStore(input);
            return 'specific store opened';
          } catch (e) {
            throw e;
          }
        },
      },
      defaultInput: JSON.stringify({
        collectionId: 'copilotextensions',
        size: {
          width: 'large',
          height: 300,
        },
      }),
    });

  const OpenAppDetail = (): ReactElement =>
    ApiWithTextInput<store.OpenAppDetailParams>({
      name: 'openAppDetail',
      title: 'Open App Detail',
      onClick: {
        validateInput: () => {},
        submit: async (input) => {
          const appId = input.appId ? new AppId((input.appId as any).appIdAsString) : input.appId;
          input = {
            ...input,
            appId,
          };
          try {
            await store.openAppDetail(input);
            return 'app detail opened';
          } catch (e) {
            throw e;
          }
        },
      },
      defaultInput: JSON.stringify({
        appId: appId1,
        size: {
          width: 'large',
          height: 300,
        },
      }),
    });

  const OpenInContextStore = (): ReactElement =>
    ApiWithTextInput<store.OpenInContextStoreParams>({
      name: 'openInContextStore',
      title: 'Open In Context Store',
      onClick: {
        validateInput: () => {},
        submit: async (input) => {
          const params: store.OpenInContextStoreParams = {
            ...input,
            filteredOutAppIds: input.filteredOutAppIds?.map((id) => new AppId((id as any).appIdAsString)),
          };
          try {
            await store.openInContextStore(params);
            return 'in context store opened';
          } catch (e) {
            throw e;
          }
        },
      },
      defaultInput: JSON.stringify({
        appCapability: 'Bot',
        appMetaCapabilities: ['copilotPlugins', 'copilotExtensions'],
        installationScope: 'Team',
        filteredOutAppIds: [appId1, appId2],
      }),
    });

  return (
    <ModuleWrapper title="Store">
      <CheckStoreCapability />
      <OpenFullStore />
      <OpenSpecificStore />
      <OpenAppDetail />
      <OpenInContextStore />
    </ModuleWrapper>
  );
};

export default StoreAPIs;
