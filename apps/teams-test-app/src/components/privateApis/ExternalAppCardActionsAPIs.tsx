import { externalAppCardActions } from '@microsoft/teams-js';
import React from 'react';

import { ApiWithoutInput, ApiWithTextInput } from '../utils';
import { ModuleWrapper } from '../utils/ModuleWrapper';

const CheckExternalAppCardActionsCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkExternalAppCardActionsCapability',
    title: 'Check External App Card Actions Capability',
    onClick: async () =>
      `External App Card Actions module ${externalAppCardActions.isSupported() ? 'is' : 'is not'} supported`,
  });

const ProcessActionSubmit = (): React.ReactElement =>
  ApiWithTextInput<{
    appId: string;
    actionSubmitPayload: externalAppCardActions.IAdaptiveCardActionSubmit;
  }>({
    name: 'processActionSubmit',
    title: 'Process Action Submit',
    onClick: {
      validateInput: (input) => {
        if (!input.appId) {
          throw new Error('appId is required');
        }
        if (!input.actionSubmitPayload) {
          throw new Error('actionSubmitPayload is required');
        }
      },
      submit: async (input) => {
        await externalAppCardActions.processActionSubmit(input.appId, input.actionSubmitPayload);
        return 'Completed';
      },
    },
    defaultInput: JSON.stringify({
      appId: 'b7f8c0a0-6c1d-4a9a-9c0a-2c3f1c0a3b0a',
      actionSubmitPayload: {
        id: 'submitId',
        data: 'data1',
      },
    }),
  });

const ProcessActionOpenUrl = (): React.ReactElement =>
  ApiWithTextInput<{
    appId: string;
    url: string;
  }>({
    name: 'processActionOpenUrl',
    title: 'Process Action Open Url',
    onClick: {
      validateInput: (input) => {
        if (!input.appId) {
          throw new Error('appId is required');
        }
        if (!input.url) {
          throw new Error('url is required');
        }
      },
      submit: async (input) => {
        const result = await externalAppCardActions.processActionOpenUrl(input.appId, new URL(input.url));
        return JSON.stringify(result);
      },
    },
    defaultInput: JSON.stringify({
      appId: 'b7f8c0a0-6c1d-4a9a-9c0a-2c3f1c0a3b0a',
      url: 'https://www.example.com',
    }),
  });

const ExternalAppCardActionsAPIs = (): React.ReactElement => (
  <ModuleWrapper title="External App Card Actions">
    <CheckExternalAppCardActionsCapability />
    <ProcessActionSubmit />
    <ProcessActionOpenUrl />
  </ModuleWrapper>
);

export default ExternalAppCardActionsAPIs;
