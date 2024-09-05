import { externalAppCommands } from '@microsoft/teams-js';
import React from 'react';

import { ApiWithoutInput, ApiWithTextInput } from '../utils';
import { ModuleWrapper } from '../utils/ModuleWrapper';

const CheckExternalAppCommandsCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkExternalAppCommandsCapability',
    title: 'Check External App Commands Capability',
    onClick: async () =>
      `External App Commands module ${externalAppCommands.isSupported() ? 'is' : 'is not'} supported`,
  });

const ProcessActionCommand = (): React.ReactElement =>
  ApiWithTextInput<{
    appId: string;
    commandId: string;
    extractedParameters: Record<string, string>;
  }>({
    name: 'processActionCommand',
    title: 'Process Action Command',
    onClick: {
      validateInput: (input) => {
        if (!input.appId) {
          throw new Error('appId is required');
        }
        if (!input.commandId) {
          throw new Error('commandId is required');
        }
        if (!input.extractedParameters) {
          throw new Error('extractedParameters is required');
        }
      },
      submit: async (input) => {
        const result = await externalAppCommands.processActionCommand(
          input.appId,
          input.commandId,
          input.extractedParameters,
        );
        return JSON.stringify(result);
      },
    },
    defaultInput: JSON.stringify({
      appId: 'b7f8c0a0-6c1d-4a9a-9c0a-2c3f1c0a3b0a',
      commandId: 'testCommandId',
      extractedParameters: { testParamName1: 'testValue1' },
    }),
  });

const ExternalAppCommandsAPIs = (): React.ReactElement => (
  <ModuleWrapper title="External App Commands">
    <CheckExternalAppCommandsCapability />
    <ProcessActionCommand />
  </ModuleWrapper>
);

export default ExternalAppCommandsAPIs;
