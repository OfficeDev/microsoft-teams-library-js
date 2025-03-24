import { AppId, externalAppCardActionsForDA, UUID } from '@microsoft/teams-js';
import React from 'react';

import { ApiWithoutInput, ApiWithTextInput } from '../utils';
import { ModuleWrapper } from '../utils/ModuleWrapper';

const CheckExternalAppCardActionsForDACapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkExternalAppCardActionsForDACapability',
    title: 'Check External App Card Actions For DA Capability',
    onClick: async () =>
      `External App Card Actions For DA module ${
        externalAppCardActionsForDA.isSupported() ? 'is' : 'is not'
      } supported`,
  });

const ProcessActionOpenUrlDialog = (): React.ReactElement =>
  ApiWithTextInput<{
    appId: string;
    actionOpenUrlDialogInfo: externalAppCardActionsForDA.IActionOpenUrlDialogInfo;
    traceId: string;
  }>({
    name: 'processActionOpenUrlDialogForDA',
    title: 'Process Action OpenUrlDialog For DA',
    onClick: {
      validateInput: (input) => {
        if (!input.appId) {
          throw new Error('appId is required');
        }
        if (!input.traceId) {
          throw new Error('traceId is required');
        }
        if (!input.actionOpenUrlDialogInfo) {
          throw new Error('actionOpenUrlDialogInfo is required');
        }
      },
      submit: async (input) => {
        await externalAppCardActionsForDA.processActionOpenUrlDialog(
          new AppId(input.appId),
          input.actionOpenUrlDialogInfo,
          new UUID(input.traceId),
        );
        return 'Completed';
      },
    },
    defaultInput: JSON.stringify({
      appId: '01b92759-b43a-4085-ac22-7772d94bb7a9',
      actionOpenUrlDialogInfo: {
        title: 'Test Dialog',
        size: {
          width: 50,
          height: 50,
        },
        url: new URL('https://localhost:4000'),
      },
      traceId: '123e4567-e89b-12d3-a456-426614174000',
    }),
  });

const ExternalAppCardActionsForDAAPIs = (): React.ReactElement => (
  <ModuleWrapper title="External App Card Actions For DA">
    <CheckExternalAppCardActionsForDACapability />
    <ProcessActionOpenUrlDialog />
  </ModuleWrapper>
);

export default ExternalAppCardActionsForDAAPIs;
