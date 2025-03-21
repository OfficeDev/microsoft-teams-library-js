import { AppId, externalAppCardActionsForDA, ValidatedStringId } from '@microsoft/teams-js';
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
          new ValidatedStringId(input.traceId),
        );
        return 'Completed';
      },
    },
    defaultInput: JSON.stringify({
      appId: 'b7f8c0a0-6c1d-4a9a-9c0a-2c3testAppId',
      actionOpenUrlDialogInfo: {
        title: 'Test Dialog',
        size: {
          width: 50,
          height: 50,
        },
        url: new URL('https://localhost:4000'),
      },
      traceId: 'b7f8c0a0-6c1d-4a9a-9c0a-testConversationId',
    }),
  });

const ExternalAppCardActionsForDAAPIs = (): React.ReactElement => (
  <ModuleWrapper title="External App Card Actions For DA">
    <CheckExternalAppCardActionsForDACapability />
    <ProcessActionOpenUrlDialog />
  </ModuleWrapper>
);

export default ExternalAppCardActionsForDAAPIs;
