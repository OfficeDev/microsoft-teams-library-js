import { plugins } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { generateRegistrationMsg } from '../../App';
import { ApiWithoutInput, ApiWithTextInput } from '../utils';
import { ModuleWrapper } from '../utils/ModuleWrapper';
import {
  CatalystFuncs,
  ContextUpdateArgs,
  PromptSentResponse,
  TriggerPromptArgs,
} from '../utils/shared-plugin-contract';

const defaultPromptSentResponse: PromptSentResponse = {
  promptId: 'prompt-001',
  status: 'accepted',
  message: 'hello from teams-test-app',
};

const SendMessage = (): ReactElement =>
  ApiWithTextInput<plugins.PluginMessage>({
    name: 'sendMessage',
    title: 'Send Message',
    onClick: {
      validateInput: (input) => {
        if (!input.func || typeof input.func !== 'string') {
          throw new Error('func is required and must be a string.');
        }
      },
      submit: async (input) => {
        await plugins.sendPluginMessage(input);
        return 'plugins.sendPluginMessage() was called';
      },
    },
    defaultInput: JSON.stringify({
      func: CatalystFuncs.promptSent,
      args: defaultPromptSentResponse,
      correlationId: '12345',
    }),
  });

const RegisterReceiveMessage = (): ReactElement =>
  ApiWithoutInput({
    name: 'registerReceiveMessage',
    title: 'Register Receive Message',
    onClick: async (setResult) => {
      const handler = (message: unknown): void => {
        const msg = message as plugins.PluginMessage;
        if (msg.func === CatalystFuncs.triggerPrompt) {
          const args = msg.args as unknown as TriggerPromptArgs;
          setResult(`Received triggerPrompt: ${JSON.stringify(args)}`);
        } else if (msg.func === CatalystFuncs.contextUpdate) {
          const args = msg.args as unknown as ContextUpdateArgs;
          setResult(
            `Received contextUpdate with corelationId: ${msg.correlationId} and data : ${JSON.stringify(args)}`,
          );
        } else {
          setResult(`Received plugin message: ${JSON.stringify(msg)}`);
        }
      };

      plugins.registerPluginMessage(handler);
      return generateRegistrationMsg('a plugin message is received');
    },
  });

const PluginAPI = (): ReactElement => (
  <ModuleWrapper title="Plugin Service">
    <SendMessage />
    <RegisterReceiveMessage />
  </ModuleWrapper>
);

export default PluginAPI;
