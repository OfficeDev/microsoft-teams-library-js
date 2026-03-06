import { pluginService } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { generateRegistrationMsg } from '../../App';
import { ApiWithoutInput, ApiWithTextInput } from '../utils';
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
      func: 'catalyst.promptSent',
      pluginId: 'catalyst-plugin', // example plugin existing in the hubsdk
      args: {
        message: 'hello from teams-test-app',
        count: 1,
      },
    }),
  });

const RegisterReceiveMessage = (): ReactElement =>
  ApiWithoutInput({
    name: 'registerReceiveMessage',
    title: 'Register Receive Message',
    onClick: async (setResult) => {
      const handler = (message: unknown): void => {
        setResult(`Received plugin message: ${JSON.stringify(message)}`);
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
