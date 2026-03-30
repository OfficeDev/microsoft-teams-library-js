import { shortcutRelay } from '@microsoft/teams-js';
import React from 'react';

import { ApiWithoutInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const CheckShortcutRelayCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'shortcutRelay_checkShortcutRelayCapability',
    title: 'Check Shortcut Relay Capability',
    onClick: async () => `ShortcutRelay ${shortcutRelay.isSupported() ? 'is' : 'is not'} supported`,
  });

const EnableShortcutRelayCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'shortcutRelay_enableShortcutRelayCapability',
    title: 'Enable Shortcut Relay Capability and Trigger Ctrl+1 shortcut',
    onClick: async () => {
      await shortcutRelay.enableShortcutRelayCapability();
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: '1', ctrlKey: true }));
      return 'called';
    },
  });

const SetOverridableShortcutHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'shortcutRelay_setOverridableShortcutHandler',
    title: 'Set Overridable Shortcut Handler',
    onClick: async () => {
      shortcutRelay.setOverridableShortcutHandler(() => true);
      return 'called';
    },
  });

const ResetIsShortcutRelayCapabilityEnabled = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'shortcutRelay_resetIsShortcutRelayCapabilityEnabled',
    title: 'Reset Shortcut Relay Capability',
    onClick: async () => {
      shortcutRelay.resetIsShortcutRelayCapabilityEnabled();
      return 'called';
    },
  });

const ShortcutRelayAPIs = (): React.ReactElement => (
  <>
    <ModuleWrapper title="ShortcutRelay">
      <CheckShortcutRelayCapability />
      <EnableShortcutRelayCapability />
      <SetOverridableShortcutHandler />
      <ResetIsShortcutRelayCapabilityEnabled />
    </ModuleWrapper>
  </>
);

export default ShortcutRelayAPIs;
