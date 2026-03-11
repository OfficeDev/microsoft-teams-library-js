import { pluginService } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { generateRegistrationMsg } from '../../App';
import { ApiWithoutInput, ApiWithTextInput } from '../utils';
import {
  CatalystFuncs,
  CatalystPluginIds,
  ContextUpdateArgs,
  PromptSentResponse,
  TriggerPromptArgs,
} from '../utils/catalyst-plugin-contract';
import { ModuleWrapper } from '../utils/ModuleWrapper';

const GetRegisteredPlugins = (): ReactElement =>
  ApiWithoutInput({
    name: 'getRegisteredPlugins',
    title: 'Get Registered Plugins',
    onClick: async () => {
      const plugins = await pluginService.getRegisteredPlugins();
      return JSON.stringify(plugins);
    },
  });

const SendMessage = (): ReactElement =>
  ApiWithTextInput<pluginService.PluginMessage>({
    name: 'sendMessage',
    title: 'Send Message',
    onClick: {
      validateInput: (input) => {
        if (!input.func || typeof input.func !== 'string') {
          throw new Error('func is required and must be a string.');
        }
        if (!input.pluginId || typeof input.pluginId !== 'string') {
          throw new Error('pluginId is required and must be a string.');
        }
      },
      submit: async (input) => {
        await pluginService.sendMessage(input);
        return 'pluginService.sendMessage() was called';
      },
    },
    defaultInput: JSON.stringify({
      func: CatalystFuncs.promptSent,
      pluginId: CatalystPluginIds.prompt,
      args: {
        promptId: 'prompt-001',
        status: 'accepted',
        message: 'hello from teams-test-app',
      } satisfies PromptSentResponse,
    }),
  });

const RegisterReceiveMessage = (): ReactElement =>
  ApiWithoutInput({
    name: 'registerReceiveMessage',
    title: 'Register Receive Message',
    onClick: async (setResult) => {
      const handler = (message: unknown): void => {
        const msg = message as pluginService.PluginMessage;
        if (msg.func === CatalystFuncs.triggerPrompt && msg.pluginId === CatalystPluginIds.prompt) {
          const args = msg.args as unknown as TriggerPromptArgs;
          setResult(`Received triggerPrompt: ${JSON.stringify(args)}`);
        } else if (msg.func === CatalystFuncs.contextUpdate && msg.pluginId === CatalystPluginIds.contextUpdate) {
          const args = msg.args as unknown as ContextUpdateArgs;
          setResult(`Received contextUpdate: ${JSON.stringify(args)}`);
        } else {
          setResult(`Received plugin message: ${JSON.stringify(msg)}`);
        }
      };

      pluginService.receivePluginMessage(handler);
      return generateRegistrationMsg('a plugin message is received');
    },
  });

const PluginAPI = (): ReactElement => (
  <ModuleWrapper title="Plugin Service">
    <GetRegisteredPlugins />
    <SendMessage />
    <RegisterReceiveMessage />
  </ModuleWrapper>
);

export default PluginAPI;
