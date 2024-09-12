import { externalAppCardActions, IAdaptiveCardActionSubmit } from '@microsoft/teams-js';
import React from 'react';

import { ApiWithoutInput, ApiWithTextInput } from '../utils';
import { ModuleWrapper } from '../utils/ModuleWrapper';

const CheckExternalAppCardActionsForCECCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkExternalAppCardActionsForCECCapability',
    title: 'Check External App Card Actions For CEC Capability',
    onClick: async () =>
      `External App Card Actions For CEC module ${externalAppCardActions.isSupported() ? 'is' : 'is not'} supported`,
  });

const CECProcessActionSubmit = (): React.ReactElement =>
  ApiWithTextInput<{
    appId: string;
    actionSubmitPayload: IAdaptiveCardActionSubmit;
  }>({
    name: 'processActionSubmitForCEC',
    title: 'Process Action Submit For CEC',
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

const CECProcessActionOpenUrl = (): React.ReactElement =>
  ApiWithTextInput<{
    appId: string;
    url: string;
    fromElement?: { name: 'composeExtensions' | 'plugins' };
  }>({
    name: 'processActionOpenUrlForCEC',
    title: 'Process Action Open Url For CEC',
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
        const result = await externalAppCardActions.processActionOpenUrl(
          input.appId,
          new URL(input.url),
          input.fromElement,
        );
        return JSON.stringify(result);
      },
    },
    defaultInput: JSON.stringify({
      appId: 'b7f8c0a0-6c1d-4a9a-9c0a-2c3f1c0a3b0a',
      url: 'https://www.example.com',
    }),
  });

const ExternalAppCardActionsForCECAPIs = (): React.ReactElement => (
  <ModuleWrapper title="External App Card Actions For CEC">
    <CheckExternalAppCardActionsForCECCapability />
    <CECProcessActionSubmit />
    <CECProcessActionOpenUrl />
  </ModuleWrapper>
);

export default ExternalAppCardActionsForCECAPIs;
