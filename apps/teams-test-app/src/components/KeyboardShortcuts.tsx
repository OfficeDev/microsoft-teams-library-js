import { keyboardShortcuts } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const CheckKeyboardShortcutsCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkKeyboardShortcutsCapability',
    title: 'Check Keyboard Shortcuts Capability',
    onClick: async () => `KeyboardShortcuts module ${keyboardShortcuts.isSupported() ? 'is' : 'is not'} supported`,
  });

const GetKeyboardEventsHostCanHandle = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'getKeyboardEventsHostCanHandle',
    title: 'Get Keyboard Events Host Can Handle',
    onClick: async () => {
      const result = await keyboardShortcuts.getKeyboardEventsHostCanHandle();
      return JSON.stringify(result);
    },
  });

const SendKeyboardShortcutToHost = (): React.ReactElement =>
  ApiWithTextInput<keyboardShortcuts.HostKeyboardShortcut>({
    name: 'sendKeyboardShortcutToHost',
    title: 'Send Keyboard Shortcut To Host',
    onClick: {
      validateInput: (input) => {
        if (!input.key) {
          throw new Error('key is required');
        }
        if (!input.eventType) {
          throw new Error('eventType is required');
        }
      },
      submit: async (keyboardShortcut) => {
        await keyboardShortcuts.sendKeyboardShortcutToHost(keyboardShortcut);
        return 'Completed';
      },
    },
  });

const KeyboardShortcutsAPIs = (): ReactElement => (
  <ModuleWrapper title="KeyboardShortcuts">
    <CheckKeyboardShortcutsCapability />
    <GetKeyboardEventsHostCanHandle />
    <SendKeyboardShortcutToHost />
  </ModuleWrapper>
);

export default KeyboardShortcutsAPIs;
