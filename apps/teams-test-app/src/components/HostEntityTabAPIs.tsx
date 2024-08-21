import { hostEntity } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const AddAndConfigure = (): React.ReactElement =>
  ApiWithTextInput<{ hostEntityIds: hostEntity.HostEntityIds; appTypes?: hostEntity.AppTypes[] }>({
    name: 'addAndConfigure',
    title: 'Add a tab',
    onClick: {
      validateInput: (input) => {
        if (!input.hostEntityIds?.threadId) {
          throw new Error('threadId is required');
        }
      },
      submit: async (input) => {
        const result = await hostEntity.tab.addAndConfigure(input.hostEntityIds, input.appTypes);
        return JSON.stringify(result);
      },
    },
    defaultInput: JSON.stringify({
      hostEntityIds: {
        threadId: 'threadId',
        messageId: 'messageId',
      },
    }),
  });

const Reconfigure = (): React.ReactElement =>
  ApiWithTextInput<{ tab: hostEntity.tab.ConfigurableTabInstance; hostEntityIds: hostEntity.HostEntityIds }>({
    name: 'reconfigure',
    title: 'Reconfigure a tab',
    onClick: {
      validateInput: (input) => {
        if (!input.tab?.internalTabInstanceId) {
          throw new Error('tabId is required');
        }

        if (!input.hostEntityIds?.threadId) {
          throw new Error('threadId is required');
        }
      },
      submit: async (input) => {
        const result = await hostEntity.tab.reconfigure(input.tab, input.hostEntityIds);
        return JSON.stringify(result);
      },
    },
    defaultInput: JSON.stringify({
      tab: {
        internalTabInstanceId: 'tabId',
        tabName: 'Tab name',
        appId: 'appId',
        url: 'contentUrl',
        tabType: 'ConfigurableTab',
      },
      hostEntityIds: {
        threadId: 'threadId',
        messageId: 'messageId',
      },
    }),
  });

const Rename = (): React.ReactElement =>
  ApiWithTextInput<{ tab: hostEntity.tab.ConfigurableTabInstance; hostEntityIds: hostEntity.HostEntityIds }>({
    name: 'rename',
    title: 'Rename a tab',
    onClick: {
      validateInput: (input) => {
        if (!input.tab?.internalTabInstanceId) {
          throw new Error('tabId is required');
        }

        if (!input.hostEntityIds?.threadId) {
          throw new Error('threadId is required');
        }
      },
      submit: async (input) => {
        const result = await hostEntity.tab.rename(input.tab, input.hostEntityIds);
        return JSON.stringify(result);
      },
    },
    defaultInput: JSON.stringify({
      tab: {
        internalTabInstanceId: 'tabId',
        tabName: 'New tab name',
        appId: 'appId',
        tabType: 'ConfigurableTab',
      },
      hostEntityIds: {
        threadId: 'threadId',
        messageId: 'messageId',
      },
    }),
  });

const Remove = (): React.ReactElement =>
  ApiWithTextInput<{ tab: hostEntity.tab.HostEntityTabInstance; hostEntityIds: hostEntity.HostEntityIds }>({
    name: 'remove',
    title: 'Remove a tab',
    onClick: {
      validateInput: (input) => {
        if (!input.tab?.internalTabInstanceId) {
          throw new Error('tabId is required');
        }

        if (!input.hostEntityIds?.threadId) {
          throw new Error('threadId is required');
        }
      },
      submit: async (input) => {
        const result = await hostEntity.tab.remove(input.tab, input.hostEntityIds);
        return JSON.stringify(result);
      },
    },
    defaultInput: JSON.stringify({
      tab: {
        internalTabInstanceId: 'tabId',
        tabName: 'New tab name',
        appId: 'appId',
        tabType: 'ConfigurableTab',
      },
      hostEntityIds: {
        threadId: 'threadId',
        messageId: 'messageId',
      },
    }),
  });

const GetAll = (): React.ReactElement =>
  ApiWithTextInput<{ hostEntityIds: hostEntity.HostEntityIds }>({
    name: 'getAll',
    title: 'Get tabs',
    onClick: {
      validateInput: (input) => {
        if (!input.hostEntityIds?.threadId) {
          throw new Error('threadId is required');
        }
      },
      submit: async (input) => {
        const result = await hostEntity.tab.getAll(input.hostEntityIds);
        return JSON.stringify(result);
      },
    },
    defaultInput: JSON.stringify({
      hostEntityIds: {
        threadId: 'threadId',
        messageId: 'messageId',
      },
    }),
  });

const CheckHostEntityTabCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkHostEntityTabCapability',
    title: 'Check Host entity tab call',
    onClick: async () => `Host entity tab module ${hostEntity.tab.isSupported() ? 'is' : 'is not'} supported`,
  });

const HostEntityTabAPIs = (): ReactElement => (
  <ModuleWrapper title="HostEntity.tab">
    <AddAndConfigure />
    <Reconfigure />
    <Rename />
    <Remove />
    <GetAll />
    <CheckHostEntityTabCapability />
  </ModuleWrapper>
);

export default HostEntityTabAPIs;
